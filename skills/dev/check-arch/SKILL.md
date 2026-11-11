---
name: check-arch
description: Check arch records for staleness after others have committed. Scans recent git history to find which arch records have fallen behind their tracked files.
argument-hint: "Optional: commit range or recent commit count (default: last 20 commits)"
disable-model-invocation: true
---

Check whether arch records are outdated after others have committed. Read [ARCH-FORMAT.md](scripts/ARCH-FORMAT.md) for the record format.

## When to check

Run this skill:
- After pulling changes from others
- Periodically to detect drift in a shared codebase
- Before starting a development sprint to ensure documentation is current
- When you suspect arch records may be stale

Run bundled scripts from the project directory.

## Procedure

1. **Identify recent commits.** Use a commit range or recent commit count:
   ```bash
   # Last 20 commits (default)
   git log --oneline -20
   
   # Specific range
   git log --oneline abc123f..HEAD
   
   # Since last pull
   git log --oneline @{upstream}..HEAD
   ```

2. **Find affected files.** List files changed in those commits:
   ```bash
   git diff --name-only abc123f..HEAD
   ```

3. **Find arch records for those files.** For each changed file, find its arch records:
   ```bash
   # Using the helper script
   scripts/find-arch.sh <changed-file>...
   
   # Or search manually
   grep -l -e '- src/payments/stripe.ts' .desk/arch/*.md
   ```

4. **Check each arch record's staleness.** For each found record:
   - Extract the `since:` field from its front matter
   - Extract the `files:` list
   - Check if any of those files have commits after `since:`:
     ```bash
     # Count commits since the record was last updated
     git log --oneline <since>..HEAD -- <file>...
     ```
   - Record is stale if there are commits after its `since:` value

5. **Report stale arch records.** For each stale record, report:
   - The record filename
   - The files it describes
   - Its current `since:` commit
   - How many commits have happened since then
   - Brief summary of what changed (from commit messages)
   - Whether the changes likely invalidate the record's constraints or architecture

6. **Recommend action.** For stale records:
   - If changes are minor (formatting, comments, small refactors), recommend updating `since:` only
   - If changes affect constraints or architecture, recommend reviewing and updating the record content
   - If changes completely replace the described behavior, recommend writing a new record

When no arch records are found for the changed files, report that and note it's normal for new code areas or untracked modules.

## Example

### Checking after pulling changes:

```bash
# See recent commits
$ git log --oneline -20
abc789f fix: update payment validation
def456a feat: add webhook verification  
ghi123b refactor: extract stripe adapter

# Find changed files
$ git diff --name-only HEAD~20..HEAD
src/payments/stripe.ts
src/payments/webhook.ts
src/payments/types.ts

# Find arch records for those files
$ scripts/find-arch.sh src/payments/stripe.ts src/payments/webhook.ts src/payments/types.ts
.desk/arch/payment-gateway-integration.md

# Read the record and check its 'since:' field
$ head -10 .desk/arch/payment-gateway-integration.md
---
type: feat
files:
  - src/payments/stripe.ts
  - src/payments/types.ts
since: ghi123b
---

# Check drift: commits since the record was updated
$ git log --oneline ghi123b..HEAD -- src/payments/
abc789f fix: update payment validation
def456a feat: add webhook verification

# Report: "Found stale arch record: payment-gateway-integration.md
# Last updated at ghi123b, but 2 commits have modified its files since then:
# - abc789f: update payment validation
# - def456a: add webhook verification
#
# The webhook verification feature may have introduced new constraints.
# Recommend reviewing the record and updating both content and 'since:' field."
```

### When no staleness is detected:

```bash
$ git log --oneline -20
# (shows recent commits to other modules)

$ git diff --name-only HEAD~20..HEAD
src/ui/components/Button.tsx
src/ui/styles/theme.ts

$ scripts/find-arch.sh src/ui/components/Button.tsx src/ui/styles/theme.ts
(no output - no arch records for these files)

# Report: "No arch records found for recently changed files. 
# This is normal for UI components and styling code that may not need architectural documentation."
```
