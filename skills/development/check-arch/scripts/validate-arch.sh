#!/usr/bin/env bash
# Validate arch records against the format in ARCH-FORMAT.md
# Usage: validate-arch.sh [<file.md>...]   (default: .assist/arch/*.md from the project root)

set -euo pipefail

if [ $# -eq 0 ]; then
    set -- .assist/arch/*.md
    if [ ! -f "$1" ]; then
        echo "No arch records found in .assist/arch/" >&2
        exit 0
    fi
fi

errors=0
warnings=0

check_file() {
    local file="$1"
    local basename=$(basename "$file")
    
    # Check file exists
    if [ ! -f "$file" ]; then
        echo "ERROR: $basename: file not found"
        errors=$((errors + 1))
        return
    fi
    
    # Extract front matter (between first --- and second ---)
    local frontmatter=$(awk '/^---$/{flag=!flag; next} flag' "$file")
    
    if [ -z "$frontmatter" ]; then
        echo "ERROR: $basename: no YAML front matter found"
        errors=$((errors + 1))
        return
    fi
    
    # Check required fields
    if ! echo "$frontmatter" | grep -q "^type:"; then
        echo "ERROR: $basename: missing 'type:' field"
        errors=$((errors + 1))
    else
        local type=$(echo "$frontmatter" | grep "^type:" | sed 's/type:[[:space:]]*//' | tr -d ' ')
        if [[ ! "$type" =~ ^(feat|fix|refactor)$ ]]; then
            echo "ERROR: $basename: type must be feat, fix, or refactor (got: $type)"
            errors=$((errors + 1))
        fi
    fi
    
    if ! echo "$frontmatter" | grep -q "^files:"; then
        echo "ERROR: $basename: missing 'files:' field"
        errors=$((errors + 1))
    else
        # Check files list is not empty
        local file_count=$(echo "$frontmatter" | grep -c "^  - " || true)
        if [ "$file_count" -eq 0 ]; then
            echo "ERROR: $basename: 'files:' list is empty"
            errors=$((errors + 1))
        fi
    fi
    
    if ! echo "$frontmatter" | grep -q "^since:"; then
        echo "ERROR: $basename: missing 'since:' field"
        errors=$((errors + 1))
    else
        local since=$(echo "$frontmatter" | grep "^since:" | sed 's/since:[[:space:]]*//')
        if [ -z "$since" ]; then
            echo "ERROR: $basename: 'since:' field is empty"
            errors=$((errors + 1))
        elif [ ${#since} -lt 7 ]; then
            echo "WARNING: $basename: 'since:' hash is very short (${#since} chars, recommend 7+)"
            warnings=$((warnings + 1))
        fi
    fi
    
    # Check filename format (descriptive slug, no dates/numbers at start)
    if [[ "$basename" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}- ]]; then
        echo "WARNING: $basename: filename starts with date (use descriptive slug instead)"
        warnings=$((warnings + 1))
    fi
    
    if [[ "$basename" =~ ^[0-9]+- ]]; then
        echo "WARNING: $basename: filename starts with number (use descriptive slug instead)"
        warnings=$((warnings + 1))
    fi
    
    # Check for line numbers or code snippets in content
    if grep -q "^[[:space:]]*[0-9]\+:" "$file" 2>/dev/null; then
        echo "WARNING: $basename: contains line numbers (they go stale; describe structure instead)"
        warnings=$((warnings + 1))
    fi
    
    # Check content after front matter exists
    local content=$(awk '/^---$/{count++} count==2{flag=1} flag' "$file")
    if [ -z "$content" ]; then
        echo "ERROR: $basename: no content after front matter"
        errors=$((errors + 1))
    fi
    
    # Check for heading
    if ! echo "$content" | grep -q "^#"; then
        echo "WARNING: $basename: no markdown heading found"
        warnings=$((warnings + 1))
    fi
    
    # Estimate length
    local lines=$(wc -l < "$file" | tr -d ' ')
    if [ "$lines" -gt 100 ]; then
        echo "WARNING: $basename: $lines lines (recommend under 60; consider splitting)"
        warnings=$((warnings + 1))
    fi
}

for file in "$@"; do
    check_file "$file"
done

echo
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo "✓ All checks passed"
    exit 0
elif [ $errors -eq 0 ]; then
    echo "⚠ $warnings warning(s)"
    exit 0
else
    echo "✗ $errors error(s), $warnings warning(s)"
    exit 1
fi
