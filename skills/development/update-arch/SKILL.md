---
name: update-arch
description: Update arch records after committing code, setting the `since:` field to the latest commit hash. Use after completing a feature or fix that introduces rules others must follow.
argument-hint: "Which files or arch records to update?"
disable-model-invocation: true
---

Update arch records after committing code. Read [ARCH-FORMAT.md](scripts/ARCH-FORMAT.md) for the record format and `.assist/AGENTS.md` for workspace conventions.

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

2. **Ensure `.assist/arch/` exists.** If creating a new arch record or updating existing ones:
   ```bash
   mkdir -p .assist/arch
   ```
   This is safe to run even if the directory already exists.

3. **Find matching arch records.** Use `scripts/find-arch.sh <file>...` or search manually:
   ```bash
   grep -l -e '- src/payments/stripe.ts' .assist/arch/*.md
   ```

4. **Get the latest commit hash** for the files just committed:
   ```bash
   git log -1 --format='%H' -- <file>
   ```

5. **Update each matched arch record's `since:` field** to this commit hash. If the record describes multiple files that were not all part of this commit, update `since:` only if all listed files are current. When in doubt, use the newest commit touching any listed file.

6. **Check the arch record's content still matches reality.** If the commit changed behavior in a way that contradicts the arch record's Constraints or Architecture, update the content or write a new arch record that supersedes it.

7. **Validate the updated records** using `scripts/validate-arch.sh` to catch formatting errors:
   ```bash
   scripts/validate-arch.sh .assist/arch/payment-gateway-integration.md
   ```

8. **Report which arch records were updated** and the new commit hash.

Workers in a shared-worktree run return proposed updates to the coordinator rather than editing shared files directly.

## Example

### Updating an existing arch record:

```bash
# After committing src/payments/stripe.ts and src/payments/paypal.ts
$ git log -1 --format='%H' -- src/payments
abc123f456...

$ scripts/find-arch.sh src/payments
.assist/arch/payment-gateway-integration.md

# Edit payment-gateway-integration.md front matter:
# since: abc123f456...
```

### Creating a new arch record:

```bash
# After committing a new feature with architectural constraints
$ mkdir -p .assist/arch

# Create .assist/arch/payment-gateway-integration.md with:
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
