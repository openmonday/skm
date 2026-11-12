#!/usr/bin/env python3
"""List the map records that cover each given file. Never modifies files."""
import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

PROG = Path(sys.argv[0]).name


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


def valid_path(path):
    parts = path.rstrip('/').split('/')
    return bool(path) and not path.startswith('/') and not any(p in ('', '.', '..') for p in parts) and not any(c in path for c in '*?[]\\')


def parse_files(lines):
    """Return the files list from the deliberately limited front matter syntax."""
    if not lines or lines[0] != '---' or '---' not in lines[1:]:
        raise ValueError('front matter is missing or unclosed')
    fields, paths, in_files = set(), [], False
    for line in lines[1:lines.index('---', 1)]:
        m = re.fullmatch(r'(type|since|files):(?:\s+(.*))?', line)
        item = re.fullmatch(r'  - (.+)', line)
        if m:
            if m.group(1) in fields:
                raise ValueError(f'{m.group(1)} appears more than once')
            fields.add(m.group(1))
            in_files = m.group(1) == 'files'
            if in_files and m.group(2):
                raise ValueError('files must be a block list')
        elif item and in_files:
            paths.append(item.group(1))
        else:
            raise ValueError(f'unsupported front matter line {line!r}')
    if fields != {'type', 'files', 'since'} or not paths:
        raise ValueError('front matter needs type, files, and since')
    bad = [p for p in paths if not valid_path(p)]
    if bad:
        raise ValueError(f'files entry {bad[0]!r} is not a literal project-relative path')
    return paths


def scan(root, directory):
    """Return (record name, files list) pairs and the problems that skipped records."""
    records, problems = [], []
    # Do not follow symlinks: they could point outside the map.
    for current, dirs, names in os.walk(directory, followlinks=False, onerror=lambda e: problems.append(str(e))):
        base = Path(current)
        for name in sorted(dirs):
            if (base / name).is_symlink():
                problems.append(f'{(base / name).relative_to(root)}: symbolic-link directory skipped')
        dirs[:] = sorted(d for d in dirs if not (base / d).is_symlink())
        for name in sorted(names):
            record = base / name
            label = str(record.relative_to(root))
            if record.is_symlink():
                problems.append(f'{label}: symbolic-link record skipped')
                continue
            try:
                records.append((label, parse_files(record.read_text(encoding='utf-8').splitlines())))
            except (OSError, UnicodeError, ValueError) as e:
                problems.append(f'{label}: {e}')
    return records, problems


def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        epilog='Paths are literal and relative to the project root. Exit 1 means some records '
               'were unreadable, so the results may be incomplete; 2 means the query could not run.')
    parser.add_argument('files', nargs='+', metavar='file', help='project-root-relative file path')
    args = parser.parse_args()
    for path in args.files:
        if not valid_path(path) or path.endswith('/'):
            parser.error(f'{path!r} is not a project-relative file path')
    try:
        root = Path(os.fsdecode(git('rev-parse', '--show-toplevel').strip()))
    except subprocess.CalledProcessError:
        print(f'{PROG}: not inside a Git repository; run from the project', file=sys.stderr)
        return 2
    directory = root / '.context/map'
    if (root / '.context').is_symlink() or directory.is_symlink() or (directory.exists() and not directory.is_dir()):
        print(f'{PROG}: .context/map must be a real directory', file=sys.stderr)
        return 2
    records, problems = scan(root, directory) if directory.exists() else ([], [])
    for query in args.files:
        found = [name for name, paths in records
                 if any((query == p and not p.endswith('/')) or query.startswith(p.rstrip('/') + '/') for p in paths)]
        print(style(show(query), '1'))
        for name in sorted(found):
            print('  ' + name)
        if not found:
            print('  ' + style('(no record)', '2'))
    for problem in problems:
        print(f'{PROG}: {problem}', file=sys.stderr)
    if problems:
        print(f'{PROG}: results may be incomplete; fix the records above and rerun', file=sys.stderr)
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
