---
name: update-arch
description: Update arch records after committing code, setting the `since:` field to the latest commit hash. Use after completing a feature or fix that introduces rules others must follow.
argument-hint: "Which files or arch records to update?"
disable-model-invocation: true
---

Update arch records after committing code. Read [ARCH-FORMAT.md](scripts/ARCH-FORMAT.md) for the record format.

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

Run bundled scripts from the project directory.

## Procedure

1. **Identify the committed files.** Use `git diff --name-only <before>..HEAD` or get them from the user. These are the files you just committed.

2. **Ensure `.desk/arch/` exists.** If creating a new arch record or updating existing ones:
   ```bash
   mkdir -p .desk/arch
   ```
   This is safe to run even if the directory already exists.

3. **Find matching arch records.** Use `scripts/find-arch.sh <file>...` or search manually:
   ```bash
   grep -l -e '- src/payments/stripe.ts' .desk/arch/*.md
   ```

4. **Get the latest commit hash** for the files just committed:
   ```bash
   git log -1 --format='%H' -- <file>
   ```

5. **Update each matched arch record's `since:` field** to this commit hash. If the record describes multiple files that were not all part of this commit, update `since:` only if all listed files are current. When in doubt, use the newest commit touching any listed file.

6. **Check the arch record's content still matches reality.** If the work came from a spec, apply its Supersedes list: replace or remove each named Constraint as it was actually built. Then check the rest of the record against the committed code. If the commit changed behavior in a way that contradicts the record's Constraints or Architecture, update the content, or write a new record that supersedes it. Never update a record for code that is not committed yet.

7. **Validate the updated records** using `scripts/validate-arch.sh` to catch formatting errors:
   ```bash
   scripts/validate-arch.sh .desk/arch/payment-gateway-integration.md
   ```

8. **Close out the feature.** If the work came from a spec in `.desk/specs/<feature-slug>/`, every task there is `done` or `dropped`, and all records from step 7 pass validation, remove `.desk/specs/<feature-slug>/`. Keep it when any task is still open or validation failed.

9. **Report which arch records were updated**, the new commit hash, and whether the feature folder was removed.

Workers in a shared-worktree run return proposed updates to the coordinator rather than editing shared files directly.

## Bootstrapping existing code

When the user asks to record existing code and `.desk/arch/` has no records, infer initial records from the codebase instead of from a commit. Skip this when records already exist, when there is no source code yet, or outside Git (there is no commit for `since:`).

1. **Identify source directories.** Find the main source locations:
   ```bash
   find . -type d \( -name src -o -name lib -o -name app -o -name pkg \) -not -path '*/node_modules/*' -not -path '*/vendor/*' | head -20
   ```
   Adapt to the language (`src/main/java`, `app/models`, and so on).
2. **Prioritize major modules.** Core domain logic, API boundaries, persistence, authentication and authorization, and external integrations. Skip generated code, vendored dependencies, configuration, and trivial utilities unless they encode important rules.
3. **Analyze each module.** Read the code for its purpose, key interfaces, data flows, boundaries, and the rules it observably enforces (validation, interface contracts, error handling, layering).
4. **Write one record per cohesive module** following [ARCH-FORMAT.md](scripts/ARCH-FORMAT.md): a `<module-name>-<purpose>` slug, `type: feat` (or `refactor` for pure structural code), every analyzed file under `files:`, and `since:` set to `git log -1 --format='%H' -- <files>`.
5. **Validate** with `scripts/validate-arch.sh`.
6. **Tell the user** which records were created, that they were inferred from code rather than confirmed, and ask them to review each record's Constraints. Until they do, agents check those Constraints against the code before relying on them, as the arch-record compliance rules in `guidelines` require.

## Example

### Updating an existing arch record:

```bash
# After committing src/payments/stripe.ts and src/payments/paypal.ts
$ git log -1 --format='%H' -- src/payments
abc123f456...

$ scripts/find-arch.sh src/payments
.desk/arch/payment-gateway-integration.md

# Edit payment-gateway-integration.md front matter:
# since: abc123f456...
```

### Creating a new arch record:

```bash
# After committing a new feature with architectural constraints
$ mkdir -p .desk/arch

# Create .desk/arch/payment-gateway-integration.md with:
---
type: feat
files:
  - src/payments/stripe.ts
  - src/payments/paypal.ts
since: abc123f456...
---

# Payment Gateway Integration

## Feature
Integrated Stripe and PayPal for order payments.

## Constraints
- Payment methods must implement PaymentProvider interface: ensures consistent error handling
- Never store card numbers in logs: PCI compliance requirement

## Architecture
Payments flow through PaymentController → PaymentService → Provider implementations.
```
