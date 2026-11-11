#!/usr/bin/env python3
"""Find working-tree map records listing a file or one of its parent paths."""
import argparse
import os
import re
from pathlib import Path
import subprocess
import sys

def git(*args):
    return subprocess.run(['git', *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True).stdout


def valid_path(path):
    parts = path.rstrip('/').split('/')
    return bool(path) and not path.startswith('/') and not any(p in ('', '.', '..') for p in parts) and not any(c in path for c in '*?[]\\')


def parse_front_matter(lines):
    """Parse the map format's deliberately limited front matter syntax."""
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


def main():
    parser = argparse.ArgumentParser(description=__doc__, epilog='Paths are literal and relative to the Git project root. Exit 1 means records could not be searched reliably; 2 means invalid input or environment.')
    parser.add_argument('files', nargs='+', help='project-root-relative file paths')
    args = parser.parse_args()
    for path in args.files:
        if not valid_path(path) or path.endswith('/'):
            parser.error(f'invalid project-relative file path: {path!r}')
    try:
        root = Path(os.fsdecode(git('rev-parse', '--show-toplevel').strip()))
        directory = root / '.context/map'
        if (root / '.context').is_symlink() or directory.is_symlink() or (directory.exists() and not directory.is_dir()):
            raise OSError('.context/map must be a real directory, not a symlink')
        matches = {path: [] for path in args.files}
        errors = []
        if directory.exists():
            # Do not follow symlinked directories or records: they could escape the map.
            for current, dirs, files in os.walk(directory, followlinks=False, onerror=lambda e: errors.append(str(e))):
                base = Path(current)
                for name in sorted(dirs):
                    if (base / name).is_symlink():
                        errors.append(f'{(base / name).relative_to(root)}: symbolic-link directory skipped')
                dirs[:] = sorted(d for d in dirs if not (base / d).is_symlink())
                for name in sorted(files):
                    record = base / name
                    label = str(record.relative_to(root))
                    if record.is_symlink():
                        errors.append(f'{label}: symbolic-link record skipped')
                        continue
                    try:
                        _, fields, paths, issues = parse_front_matter(record.read_text(encoding='utf-8').splitlines())
                        if issues or set(fields) != {'type', 'files', 'since'} or fields.get('files') or not paths or any(not valid_path(p) for p in paths):
                            raise ValueError('invalid front matter or files list')
                    except (OSError, UnicodeError, ValueError) as e:
                        errors.append(f'{label}: {e}')
                        continue
                    for query in matches:
                        if any((not p.endswith('/') and query == p) or query.startswith(p.rstrip('/') + '/') for p in paths):
                            matches[query].append(label)
        for query, records in matches.items():
            print(f'{query!r}:')
            for record in sorted(records):
                print(f'  {record!r}')
            if not records:
                print('  (no matching records)')
        for error in errors:
            print(f'Warning: {error}', file=sys.stderr)
        if errors:
            print('Warning: results may be incomplete; inspect invalid records and run the draw-map coverage check.', file=sys.stderr)
        return 1 if errors else 0
    except (OSError, subprocess.CalledProcessError) as e:
        print(f'Cannot query map: {e}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
