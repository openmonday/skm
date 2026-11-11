#!/usr/bin/env bash
set -eu

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd -P)"
cd "$root"
if [ -e .desk ] || [ -L .desk ]; then
  if [ ! -d .desk ]; then
    echo 'Error: .desk exists but is not a directory (or is a broken link).' >&2
    exit 1
  fi
fi
for path in .desk/arch .desk/specs .desk/handoffs .desk/refs .desk/research; do
  if { [ -e "$path" ] || [ -L "$path" ]; } && [ ! -d "$path" ]; then
    echo "Error: $path is not a directory." >&2
    exit 1
  fi
done
for path in .desk/AGENTS.md .desk/CONTEXT.md; do
  if { [ -e "$path" ] || [ -L "$path" ]; } && [ ! -f "$path" ]; then
    echo "Error: $path is not a regular file." >&2
    exit 1
  fi
done
if git rev-parse --git-dir >/dev/null 2>&1; then
  if [ -n "$(git ls-files -- .desk)" ]; then
    echo 'Error: .desk has tracked files; resolve their tracking before setup.' >&2
    exit 1
  fi
  exclude="$(git rev-parse --path-format=absolute --git-path info/exclude)"
  mkdir -p "$(dirname "$exclude")"
  touch "$exclude"
  if ! grep -Fxq '/.desk' "$exclude"; then
    if [ -s "$exclude" ] && [ "$(tail -c 1 "$exclude" | wc -l | tr -d ' ')" = 0 ]; then printf '\n' >> "$exclude"; fi
    printf '/.desk\n' >> "$exclude"
  fi
  echo "Git exclusion: $exclude"
else
  echo 'Git exclusion pending: not a Git repository.'
fi
# .desk/
# ├── AGENTS.md   Project-wide rules
# ├── CONTEXT.md  Domain glossary
# ├── arch/       Architecture records for committed code
# ├── specs/      Feature specs and their tasks
# ├── handoffs/   Session handoffs
# ├── refs/       Read-only reference checkouts
# └── research/   Research reports and diagrams
mkdir -p .desk .desk/arch .desk/specs .desk/handoffs .desk/refs .desk/research
if [ ! -e .desk/AGENTS.md ] && [ ! -L .desk/AGENTS.md ]; then
  printf '# Desk project rules\n\nAdd project-wide rules here, one per line with the reason.\n' > .desk/AGENTS.md
fi
if [ ! -e .desk/CONTEXT.md ] && [ ! -L .desk/CONTEXT.md ]; then
  : > .desk/CONTEXT.md
fi
printf 'Desk workspace: %s/.desk\n' "$root"
