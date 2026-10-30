#!/usr/bin/env bash
set -euo pipefail

# Resolve the checkout from this script, regardless of the caller's directory.
PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required. Install Node.js and try again." >&2
  exit 1
fi

cd "$PROJECT_DIR"
npm link --no-audit --no-fund

GLOBAL_PREFIX="$(npm prefix --global)"
CLI_PATH="$GLOBAL_PREFIX/bin/skm"
"$CLI_PATH" --help
printf '\nConfigured skm: %s\nProject: %s\n' "$CLI_PATH" "$PROJECT_DIR"
case ":$PATH:" in
  *":$GLOBAL_PREFIX/bin:"*) ;;
  *) printf '\nAdd %s to your shell PATH to run skm globally.\n' "$GLOBAL_PREFIX/bin" ;;
esac
