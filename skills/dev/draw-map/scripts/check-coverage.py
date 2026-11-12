#!/usr/bin/env python3
"""Check map coverage; never modifies files."""
import os
import re
import subprocess
import sys
from pathlib import Path


def git(*args):
    return subprocess.run(['git', *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True).stdout


def style(text, code):
    """Apply restrained terminal emphasis without decorating redirected output."""
    if sys.stdout.isatty() and 'NO_COLOR' not in os.environ and os.environ.get('TERM') != 'dumb':
        return f'\033[{code}m{text}\033[0m'
    return text


def report_section(title, items, *, quoted=False, note=''):
    print(style(title, '1') + ' ' + style(f'({len(items)})', '2') + note)
    for item in items:
        print('  ' + (repr(item) if quoted else item))
    if not items:
        print('  ' + style('(none)', '2'))


def valid_path(path):
    parts = path.rstrip('/').split('/')
    return bool(path) and not path.startswith('/') and not any(p in ('', '.', '..') for p in parts) and not any(c in path for c in '*?[]\\')


def parse_front_matter(lines):
    """Parse the checker's deliberately limited front matter syntax."""
    if not lines or lines[0] != '---' or '---' not in lines[1:]:
        raise ValueError('missing or unclosed front matter')
    end = lines.index('---', 1)
    fields, paths, issues = {}, [], []
    in_files = False
    for line in lines[1:end]:
        m = re.fullmatch(r'(type|since|files):(?:\s+(.*))?', line)
        item = re.fullmatch(r'  - (.+)', line)
        if m:
            key, value = m.groups()
            if key in fields:
                issues.append(f'duplicate {key} field')
            fields[key] = value or ''
            in_files = key == 'files'
        elif item and in_files:
            paths.append(item.group(1))
        else:
            issues.append(f'unsupported front matter line: {line!r}')
    return end, fields, paths, issues


def run():
    try:
        root = Path(os.fsdecode(git('rev-parse', '--show-toplevel').strip()))
        os.chdir(root)
        git('rev-parse', '--verify', 'HEAD^{commit}')
        tracked = sorted(os.fsdecode(p) for p in git('ls-files', '-z', '--cached').split(b'\0') if p)
        tracked = sorted(set(tracked))
        files = sorted(set(tracked) | {os.fsdecode(p) for p in git('ls-files', '-z', '--others', '--exclude-standard').split(b'\0') if p})
    except subprocess.CalledProcessError as e:
        print('Cannot check: Git repository with a committed HEAD required: ' + os.fsdecode(e.stderr).strip(), file=sys.stderr)
        return 2
    map_dir = root / '.context/map'
    if map_dir.exists() and not map_dir.is_dir():
        print('Cannot check: .context/map is not a directory', file=sys.stderr)
        return 2
    errors = []
    covered = set()
    records = sorted(p for p in map_dir.rglob('*') if p.is_file() or p.is_symlink()) if map_dir.exists() else []
    for record in records:
        name = str(record.relative_to(root))
        issues = []
        if record.is_symlink():
            errors.append(f'{name}: symbolic-link records are not supported')
            continue
        if not re.fullmatch(r'[a-z]+(?:-[a-z]+)*\.md', record.name):
            issues.append('record must have a descriptive lowercase hyphenated .md filename without numbers')
        try:
            text = record.read_text(encoding='utf-8')
        except (UnicodeError, OSError) as e:
            errors.append(f'{name}: cannot read UTF-8 record: {e}')
            continue
        lines = text.splitlines()
        if len(lines) >= 60:
            issues.append('record must be under 60 lines')
        try:
            end, fields, paths, parse_issues = parse_front_matter(lines)
        except ValueError as e:
            errors.append(f'{name}: {e}' + ('; ' + '; '.join(issues) if issues else ''))
            continue
        issues.extend(parse_issues)
        if set(fields) != {'type', 'files', 'since'}:
            issues.append('requires exactly type, files, and since fields')
        if fields.get('type') not in ('feat', 'fix', 'refactor'):
            issues.append('type must be feat, fix, or refactor')
        if fields.get('files') or not paths:
            issues.append('files must be a nonempty block list')
        since = fields.get('since', '')
        if not re.fullmatch(r'[0-9a-fA-F]{7,64}', since):
            issues.append('since must be a hexadecimal commit hash of at least 7 characters')
        body = lines[end + 1:]
        if not any(re.fullmatch(r'# \S.*', line) for line in body):
            issues.append('missing nonempty level-one title')
        if any(re.match(r'^\s*(?:```|~~~|\d+:)', line) for line in body):
            issues.append('code fences and line-numbered snippets are not allowed')
        if fields.get('type') == 'feat' and not any(line == '## Feature' for line in body):
            issues.append('feat requires a Feature section')
        if fields.get('type') == 'refactor':
            if '## Feature' in body:
                issues.append('refactor must not have a Feature section')
            for section in ('## Constraints', '## Architecture'):
                if section not in body:
                    issues.append(f'refactor requires {section[3:]} section')
        matches = set()
        for path in paths:
            if not valid_path(path):
                issues.append(f'invalid literal project-relative path: {path!r}')
                continue
            found = {p for p in files if p == path or p.startswith(path.rstrip('/') + '/')}
            if not found:
                issues.append(f'path matches no eligible files: {path!r}')
            matches.update(found)
        # Do not let malformed records hide coverage gaps or produce misleading freshness results.
        if issues:
            errors.append(f'{name}: ' + '; '.join(issues))
            continue
        covered.update(matches)
    unrecorded = sorted(set(files) - covered)
    report_section('UNRECORDED', unrecorded, quoted=True)
    return 1 if unrecorded else 0


def main():
    try:
        sys.exit(run())
    except (OSError, subprocess.CalledProcessError) as e:
        print(f'Cannot complete check: {e}', file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
