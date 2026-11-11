#!/usr/bin/env bash
set -eu

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd -P)"
cd "$root"

for path in .context .context/map .context/issues .context/reference; do
  if { [ -e "$path" ] || [ -L "$path" ]; } && [ ! -d "$path" ]; then
    echo "Error: $path is not a directory; resolve the conflict and retry." >&2
    exit 1
  fi
done
if { [ -e .context/GLOSSARY.md ] || [ -L .context/GLOSSARY.md ]; } && [ ! -f .context/GLOSSARY.md ]; then
  echo 'Error: .context/GLOSSARY.md is not a regular file; resolve the conflict and retry.' >&2
  exit 1
fi

if git rev-parse --git-dir >/dev/null 2>&1; then
  if [ -n "$(git ls-files -- .context)" ]; then
    echo 'Error: .context has tracked files; resolve their tracking before setup.' >&2
    exit 1
  fi
  exclude="$(git rev-parse --path-format=absolute --git-path info/exclude)"
  mkdir -p "$(dirname "$exclude")"
  touch "$exclude"
  if ! grep -Fxq '/.context' "$exclude"; then
    if [ -s "$exclude" ] && [ "$(tail -c 1 "$exclude" | wc -l | tr -d ' ')" = 0 ]; then
      printf '\n' >> "$exclude"
    fi
    printf '/.context\n' >> "$exclude"
  fi
  git_status="configured"
else
  git_status="pending"
fi

mkdir -p .context/map .context/issues .context/reference
if [ ! -e .context/GLOSSARY.md ] && [ ! -L .context/GLOSSARY.md ]; then
  : > .context/GLOSSARY.md
fi
# Color stdout only when it is a terminal and color has not been disabled.
cyan='' bold='' green='' yellow='' reset=''
if [ -t 1 ] && [ -z "${NO_COLOR+x}" ] && [ "${TERM:-}" != dumb ]; then
  cyan=$(printf '\033[36m'); bold=$(printf '\033[1m')
  green=$(printf '\033[32m'); yellow=$(printf '\033[33m'); reset=$(printf '\033[0m')
fi
printf '\n%s%s▸ context%s\n' "$bold" "$cyan" "$reset"
printf '  %s✔%s ready  %s/.context\n' "$green" "$reset" "$root"
if [ "$git_status" = configured ]; then
  printf '  %s✔%s configured  Git exclusion: %s\n' "$green" "$reset" "$exclude"
else
  printf '  %s!%s pending  Git exclusion: not a Git repository\n' "$yellow" "$reset"
fi
