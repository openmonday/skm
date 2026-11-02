---
name: update-arch
description: Update arch records after committing code, setting the `since:` field to the latest commit hash. Use after completing a feature or fix that introduces rules others must follow.
argument-hint: "Which files or arch records to update?"
disable-model-invocation: true
---

Update arch records after committing code. Read `.assist/AGENTS.md` for the arch record format and lookup procedure.

This is the final step in the arch record workflow:
1. `/check-arch` before work (find existing records)
2. Develop (grill-me, to-spec, implement, etc.)
3. `/update-arch` after work (record the new state)

## When to update

Run this skill after:
- Completing a feature and writing its arch record
- Fixing a bug that revealed a rule worth recording
- Refactoring that reshapes modules or boundaries
- Any commit where you created or updated an arch record

Skip this for typo fixes, formatting, dependency bumps, or changes with no arch record.

## Procedure

1. **Identify the committed files.** Use `git diff --name-only <before>..HEAD` or get them from the user. These are the files you just committed.

2. **Find matching arch records.** Use `.assist/find-arch.sh <file>...` or search manually:
   ```bash
   grep -l -e '- src/payments/stripe.ts' .assist/arch/*.md
   ```

3. **Get the latest commit hash** for the files just committed:
   ```bash
   git log -1 --format='%H' -- <file>
   ```

4. **Update each matched arch record's `since:` field** to this commit hash. If the record describes multiple files that were not all part of this commit, update `since:` only if all listed files are current. When in doubt, use the newest commit touching any listed file.

5. **Check the arch record's content still matches reality.** If the commit changed behavior in a way that contradicts the arch record's Constraints or Architecture, update the content or write a new arch record that supersedes it.

6. **Report which arch records were updated** and the new commit hash.

Workers in a shared-worktree run return proposed updates to the coordinator rather than editing shared files directly.

## Example

```bash
# After committing src/payments/stripe.ts and src/payments/paypal.ts
$ git log -1 --format='%H' -- src/payments
abc123f456...

$ .assist/find-arch.sh src/payments
.assist/arch/payment-gateway-integration.md

# Edit payment-gateway-integration.md front matter:
# since: abc123f456...
```
