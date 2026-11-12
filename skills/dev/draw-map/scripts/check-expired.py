#!/usr/bin/env python3
"""Report map records whose since is not the newest commit of their files. Never modifies files."""
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

PROG = Path(sys.argv[0]).name


class Fatal(Exception):
    """The check cannot run; the message says what to fix."""


def git(*args):
    return subprocess.run(['git', *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True).stdout


def style(text, code, stream=None):
    """Emphasize text only on a color-capable terminal."""
    stream = stream or sys.stdout
    if stream.isatty() and 'NO_COLOR' not in os.environ and os.environ.get('TERM') != 'dumb':
        return f'\033[{code}m{text}\033[0m'
    return text


def show(path):
    return path if path.isprintable() and path.strip() == path else repr(path)


def heading(title, count):
    print(style(title, '1') + ' ' + style(f'({count})', '2'))


def ok(message):
    print(style('✔', '32') + ' ' + message)


def row(symbol, code, target, note=''):
    print('  ' + style(symbol, code) + ' ' + target + (f'  {note}' if note else ''))


def hint(message):
    print('\n  ' + style(message, '2'))


def valid_path(path):
    parts = path.rstrip('/').split('/')
    return bool(path) and not path.startswith('/') and not any(p in ('', '.', '..') for p in parts) and not any(c in path for c in '*?[]\\')


def load_project():
    """Return the project's eligible files and map records, or raise Fatal."""
    try:
        root = Path(os.fsdecode(git('rev-parse', '--show-toplevel').strip()))
    except subprocess.CalledProcessError:
        raise Fatal('not inside a Git repository; run from the project')
    os.chdir(root)
    try:
        git('rev-parse', '--verify', '-q', 'HEAD^{commit}')
    except subprocess.CalledProcessError:
        raise Fatal('HEAD has no commit; make an initial commit, then rerun')
    map_dir = root / '.context/map'
    if not map_dir.is_dir():
        raise Fatal('.context/map is not a directory; create it, then rerun')
    raw = git('ls-files', '-z', '--cached', '--others', '--exclude-standard')
    files = sorted({os.fsdecode(p) for p in raw.split(b'\0') if p})
    records = sorted(p for p in map_dir.rglob('*') if p.is_file() or p.is_symlink())
    return root, files, [check_record(root, p, files) for p in records]


def parse_front_matter(lines):
    """Parse the deliberately limited front matter syntax."""
    if not lines or lines[0] != '---' or '---' not in lines[1:]:
        raise ValueError('front matter is missing or unclosed')
    end = lines.index('---', 1)
    fields, paths, issues = {}, [], []
    in_files = False
    for line in lines[1:end]:
        m = re.fullmatch(r'(type|since|files):(?:\s+(.*))?', line)
        item = re.fullmatch(r'  - (.+)', line)
        if m:
            key, value = m.groups()
            if key in fields:
                issues.append(f'{key} appears more than once')
            fields[key] = value or ''
            in_files = key == 'files'
        elif item and in_files:
            paths.append(item.group(1))
        else:
            issues.append(f'unsupported front matter line {line!r}')
    return end, fields, paths, issues


def check_record(root, record, files):
    """Return a dict with name, fields, paths, matches, and issues."""
    result = {'name': str(record.relative_to(root)), 'fields': {}, 'paths': [], 'matches': set(), 'issues': []}
    issues = result['issues']
    if record.is_symlink():
        issues.append('is a symbolic link; replace it with a regular file')
        return result
    if not re.fullmatch(r'[a-z]+(?:-[a-z]+)*\.md', record.name):
        issues.append('filename must be lowercase words joined by hyphens, ending in .md')
    try:
        lines = record.read_text(encoding='utf-8').splitlines()
    except (UnicodeError, OSError) as e:
        issues.append(f'cannot be read as UTF-8: {e}')
        return result
    if len(lines) >= 60:
        issues.append(f'has {len(lines)} lines; keep it under 60')
    try:
        end, fields, paths, parse_issues = parse_front_matter(lines)
    except ValueError as e:
        issues.append(str(e))
        return result
    result.update(fields=fields, paths=paths)
    issues.extend(parse_issues)
    missing, extra = {'type', 'files', 'since'} - set(fields), set(fields) - {'type', 'files', 'since'}
    if missing:
        issues.append('front matter lacks ' + ', '.join(sorted(missing)))
    if fields.get('type', 'feat') not in ('feat', 'fix', 'refactor') or fields.get('type') == '':
        issues.append('type must be feat, fix, or refactor')
    if 'files' in fields and (fields['files'] or not paths):
        issues.append('files must be a block list with at least one "  - path" line')
    if 'since' in fields and not re.fullmatch(r'[0-9a-fA-F]{7,64}', fields['since']):
        issues.append('since must be a commit hash of at least 7 hex characters')
    body = lines[end + 1:]
    if not any(re.fullmatch(r'# \S.*', line) for line in body):
        issues.append('needs a "# Title" line')
    if any(re.match(r'^\s*(?:```|~~~|\d+:)', line) for line in body):
        issues.append('contains a code fence or line-numbered snippet; describe it in prose')
    if fields.get('type') == 'feat' and '## Feature' not in body:
        issues.append('type feat needs a "## Feature" section')
    if fields.get('type') == 'refactor':
        if '## Feature' in body:
            issues.append('type refactor must not have a "## Feature" section')
        for section in ('## Constraints', '## Architecture'):
            if section not in body:
                issues.append(f'type refactor needs a "{section}" section')
    if '## Violations' in body:
        entries = []
        for line in body[body.index('## Violations') + 1:]:
            if line.startswith('## '):
                break
            if line.strip():
                entries.append(line)
        if not entries:
            issues.append('"## Violations" is empty; remove it or add an entry')
        for line in entries:
            if not re.fullmatch(r'- [0-9a-fA-F]{7,64} \S+: .+; breaks ".+"\.?', line):
                issues.append(f'violation {line!r} must read: - <commit> <path>: <behavior>; breaks "<statement>".')
    for path in paths:
        if not valid_path(path):
            issues.append(f'files entry {path!r} must be a literal project-relative path')
            continue
        found = {p for p in files if p == path or p.startswith(path.rstrip('/') + '/')}
        if not found:
            issues.append(f'files entry {path!r} matches no file; fix or remove it')
        result['matches'].update(found)
    return result


def main(run):
    try:
        sys.exit(run())
    except Fatal as e:
        message = str(e)
    except (OSError, subprocess.CalledProcessError) as e:
        detail = os.fsdecode(e.stderr).strip() if getattr(e, 'stderr', None) else str(e)
        message = f'unexpected failure: {detail}'
    print(f'{PROG}: {message}', file=sys.stderr)
    sys.exit(2)


def run():
    root, files, records = load_project()
    history = git('rev-list', 'HEAD').decode().split()
    order = {h: i for i, h in enumerate(history)}
    latest_cache, expired, pending, skipped = {}, [], [], []
    for record in records:
        if record['issues']:
            skipped.append(record['name'])
            continue
        commits = set()
        for path in sorted(record['matches']):
            if path not in latest_cache:
                latest_cache[path] = git('log', '-1', '--format=%H', 'HEAD', '--', ':(literal)' + path).decode().strip()
            if latest_cache[path]:
                commits.add(latest_cache[path])
            else:
                pending.append((path, record['name']))
        if not commits:
            continue
        expected = min(commits, key=order.__getitem__)
        since = record['fields']['since']
        try:
            resolved = git('rev-parse', '--verify', '-q', since + '^{commit}').decode().strip()
        except subprocess.CalledProcessError:
            resolved = None
        if resolved == expected:
            continue
        if resolved is None:
            problem = f'since {since} is not a commit'
        elif resolved not in order:
            problem = f'since {since} is not reachable from HEAD'
        else:
            problem = f'since {since}'
        review = None
        if resolved in order:
            paths = ' '.join(shlex.quote(p) for p in record['paths'])
            review = f'git log -p {since}..{expected[:12]} -- {paths}'
        expired.append((record['name'], problem, expected, review))
    if not expired and not skipped:
        ok(f'all {len(records)} records are up to date')
    elif expired:
        heading('Expired records', len(expired))
        for name, problem, expected, review in expired:
            row('✘', '31', name, f'{problem}, expected {expected[:12]}')
            print('      ' + style('review  ' + (review or 'compare the whole record with the code'), '2'))
        hint('Reconcile each record with the changes shown, then set since to the expected hash.')
    if pending:
        print()
        heading('Uncommitted covered files', len(pending))
        for path, name in pending:
            row('!', '33', show(path), style(name, '2'))
        hint('These files do not affect since until they are committed.')
    if skipped:
        if expired or pending:
            print()
        heading('Skipped invalid records', len(skipped))
        for name in skipped:
            row('!', '33', name)
        hint('Fix these with check-format.py, then rerun.')
    return 1 if expired or skipped else 0


if __name__ == '__main__':
    main(run)
