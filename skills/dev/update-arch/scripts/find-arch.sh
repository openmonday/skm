#!/usr/bin/env bash
# Print the arch records that describe any of the given files or directories.
# Usage (from the project root): find-arch.sh <path>...
# A directory path also matches records that list files inside it.

set -euo pipefail

if [ $# -eq 0 ]; then
    echo "Usage: $0 <file-or-directory>..." >&2
    exit 1
fi

ARCH_DIR=".desk/architecture"
[ -d "$ARCH_DIR" ] || exit 0

for record in "$ARCH_DIR"/*.md; do
    [ -f "$record" ] || continue
    for path in "$@"; do
        path="${path%/}"
        # Match a front matter list item: exact file, or anything under the directory.
        if grep -qE -e "^  - ${path//./\\.}(/|$)" "$record"; then
            printf '%s\n' "$record"
            break
        fi
    done
done
