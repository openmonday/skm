---
name: check-arch
description: Find and review arch records for files you're about to change. Use before starting any implementation work to understand existing constraints and architecture decisions.
argument-hint: "Which files or directories will you be editing?"
disable-model-invocation: true
---

Find and review architecture records before changing code. Read [ARCH-FORMAT.md](scripts/ARCH-FORMAT.md) for the record format and `.assist/AGENTS.md` for workspace conventions.

## When to check

Run this skill before:
- Starting implementation of a spec or ticket
- Making changes to existing code
- Refactoring or restructuring modules
- Any work that might conflict with existing architectural decisions

Skip this for trivial changes where you already know no arch records exist (brand new code areas, documentation-only changes).

## Procedure

1. **Identify the files you'll change.** Get them from the spec, ticket, or user. Include:
   - Files you'll edit directly
   - Directories containing new files you'll create
   - Modules you'll restructure

2. **Ensure `.assist/arch/` exists.** If the directory doesn't exist, create it:
   ```bash
   mkdir -p .assist/arch
   ```
   This is safe to run even if the directory already exists. When `.assist/AGENTS.md` is missing, suggest the user run `/setup-assist` to initialize the full workspace, but creating the arch directory alone is sufficient for check-arch to function.

3. **Find matching arch records.** Use `scripts/find-arch.sh <file>...` or search manually:
   ```bash
   # For specific files
   grep -l -e '- src/payments/stripe.ts' .assist/arch/*.md
   
   # For a directory (finds records for any file in that directory)
   grep -l -e '- src/payments/' .assist/arch/*.md
   ```

4. **Read each matched arch record.** Pay special attention to:
   - **Constraints**: rules you must follow
   - **Architecture**: structure you must preserve or extend consistently
   - **Feature**: what the code is meant to do (helps you avoid breaking behavior)

5. **Check drift.** For each arch record, see how much has changed since it was last confirmed:
   ```bash
   # Get the 'since:' value from the record's front matter
   git log --oneline abc123f..HEAD -- src/payments/stripe.ts
   ```
   Many commits since `since:` suggests the record may be stale; read it critically.

6. **Surface conflicts early.** If the work you're about to do would break a constraint or deviate from the recorded architecture, discuss with the user before proceeding:
   - Can the constraint be loosened?
   - Should the architecture evolve?
   - Is there a better approach that preserves the constraint?

7. **Report findings.** Summarize:
   - Which arch records apply
   - Key constraints to follow
   - Any drift or staleness concerns
   - Whether the work conflicts with existing records

When no records are found, report that and continue. Missing records are normal for new code areas.

Workers in a shared-worktree run return findings to the coordinator rather than changing the implementation plan directly.

## Example

### In a repository with existing arch records:

```bash
# Check files before implementing a payment feature
$ scripts/find-arch.sh src/payments/stripe.ts src/payments/paypal.ts
.assist/arch/payment-gateway-integration.md

# Read the record
$ cat .assist/arch/payment-gateway-integration.md

# Check drift
$ git log --oneline abc123f..HEAD -- src/payments/
(shows 3 commits since the record was last updated)

# Report: "Found payment-gateway-integration.md. Key constraint: 
# all payment methods must implement the PaymentProvider interface.
# The record is from 3 commits ago but still current."
```

### In a new repository:

```bash
# Create the arch directory if it doesn't exist
$ mkdir -p .assist/arch

# Search for records (will find none in a new repository)
$ scripts/find-arch.sh src/payments/stripe.ts
(no output - no records found)

# Report: "No arch records found for these files. This is normal for 
# a new code area. Any architectural constraints established during 
# this work should be documented in a new arch record after completion."
```
