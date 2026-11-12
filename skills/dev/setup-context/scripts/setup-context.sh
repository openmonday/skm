#!/usr/bin/env bash
# Create the .context workspace and exclude it from Git. Keeps existing content.
set -eu

prog=setup-context.sh
die() { printf '%s: %s\n' "$prog" "$1" >&2; exit 1; }

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd -P)"
cd "$root"

for path in .context .context/map .context/issues .context/reference; do
  if { [ -e "$path" ] || [ -L "$path" ]; } && [ ! -d "$path" ]; then
    die "$path exists but is not a directory; move it aside and rerun"
  fi
done
if { [ -e .context/GLOSSARY.md ] || [ -L .context/GLOSSARY.md ]; } && [ ! -f .context/GLOSSARY.md ]; then
  die ".context/GLOSSARY.md exists but is not a regular file; move it aside and rerun"
fi

in_git=false exclude='' exclude_state=''
if git rev-parse --git-dir >/dev/null 2>&1; then
  in_git=true
  if [ -n "$(git ls-files -- .context)" ]; then
    die ".context has tracked files; untrack them with 'git rm -r --cached .context' and rerun"
  fi
  exclude="$(git rev-parse --path-format=absolute --git-path info/exclude)"
  mkdir -p "$(dirname "$exclude")"
  touch "$exclude"
  if grep -Fxq '/.context' "$exclude"; then
    exclude_state=unchanged
  else
    if [ -s "$exclude" ] && [ "$(tail -c 1 "$exclude" | wc -l | tr -d ' ')" = 0 ]; then
      printf '\n' >> "$exclude"
    fi
    printf '/.context\n' >> "$exclude"
    exclude_state=added
  fi
fi

created=0 unchanged=0 rows=''
for path in .context/map .context/issues .context/reference .context/GLOSSARY.md; do
  if [ -e "$path" ]; then
    unchanged=$((unchanged + 1)); rows="$rows unchanged:$path"
  else
    case "$path" in
      *.md) : > "$path" ;;
      *) mkdir -p "$path" ;;
    esac
    created=$((created + 1)); rows="$rows created:$path"
  fi
done

cyan='' bold='' green='' yellow='' dim='' reset=''
if [ -t 1 ] && [ -z "${NO_COLOR+x}" ] && [ "${TERM:-}" != dumb ]; then
  cyan=$(printf '\033[36m'); bold=$(printf '\033[1m'); dim=$(printf '\033[2m')
  green=$(printf '\033[32m'); yellow=$(printf '\033[33m'); reset=$(printf '\033[0m')
fi

home_path() { case "$1" in "$root"/*) printf '%s' "${1#"$root"/}" ;; "$HOME"/*) printf '~%s' "${1#"$HOME"}" ;; *) printf '%s' "$1" ;; esac; }

printf '\n%s%s▸ context%s  %s\n' "$bold" "$cyan" "$reset" "$(home_path "$root")"
for item in $rows; do
  state=${item%%:*} path=${item#*:}
  if [ "$state" = created ]; then
    printf '  %s✔%s created  %s\n' "$green" "$reset" "$path"
  else
    printf '  %s• unchanged  %s%s\n' "$dim" "$path" "$reset"
  fi
done
if [ "$in_git" = true ]; then
  if [ "$exclude_state" = added ]; then
    printf '  %s✔%s excluded  /.context in %s\n' "$green" "$reset" "$(home_path "$exclude")"
  else
    printf '  %s• unchanged  /.context in %s%s\n' "$dim" "$(home_path "$exclude")" "$reset"
  fi
else
  printf '  %s!%s not excluded  not a Git repository\n' "$yellow" "$reset"
fi
printf '\n  %s%s created · %s unchanged%s\n' "$dim" "$created" "$unchanged" "$reset"
