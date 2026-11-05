# Arch Record Format

Architecture records live at `.desk/architecture/<descriptive-slug>.md`. Each record documents one finished change: what it built, the rules it set, and its shape.

Follow the workspace rules in `.desk/AGENTS.md`. Check-arch and update-arch skills use this format. How agents weigh records against specs and code is defined under "Using arch records" in `.desk/AGENTS.md`.

## When to write

Write an arch record when a future agent editing the same files could do the wrong thing without it:
- The change added behavior with rules attached
- Set a boundary or interface contract
- Reshaped modules or moved responsibilities
- A fix revealed a rule the code did not enforce

Skip for:
- Typo fixes, formatting, linting
- Dependency version bumps
- Changes the code and tests already explain clearly

## Filename

Use a descriptive slug that makes the topic clear: `payment-gateway-integration.md`, `event-sourcing-orders.md`, `api-versioning-strategy.md`.

Avoid dates, numbers, or commit hashes in the filename. The name describes what, not when.

## Template

```yaml
---
type: feat              # feat | fix | refactor (required)
files:                  # lookup key: which files this record describes (required)
  - src/payments/stripe.ts
  - src/payments/paypal.ts
  - src/orders/create.ts
since: abc123f          # commit where this was last confirmed accurate (required)
---

# <What changed, in a short phrase>

## Feature
What users or callers can now do. One or two short paragraphs.
Leave out for refactors.

## Constraints
Rules that future changes must keep. One line each: the rule, then the reason.
State what must not be done as well as what must. Cover rules for new modules that
have no history yet.

Example:
- Payment methods must implement PaymentProvider interface: ensures consistent error handling
- Never store card numbers in logs: PCI compliance requirement
- Refunds must create audit entries: financial reporting requirement

## Architecture
How it is built: the modules, their boundaries, data flow, and key interfaces.
Mention a rejected alternative only when someone would otherwise propose it again.

Example:
Payments flow through three layers:
- PaymentController validates and logs
- PaymentService orchestrates provider calls
- Providers (Stripe, PayPal) implement PaymentProvider

We chose composition over inheritance to allow runtime provider switching.
```

## Guidance by type

- **feat**: Feature section (what it does), plus Constraints and Architecture when there is something to say
- **refactor**: Architecture section (the new shape) and Constraints (what the shape protects). No Feature.
- **fix**: usually no arch record. When the bug revealed a rule, write one Constraints entry stating the rule and the failure it prevents.

## Writing rules

- **Keep it under 60 lines.** Split unrelated topics into separate records.
- **No line numbers or code snippets.** Git already links commits to files, and line numbers go stale. Describe structure and rules, not implementation.
- **One constraint per line.** Make each independently understandable.
- **Copy from spec Constraints.** Start with the spec's Constraints and Supersedes sections and adjust for what was actually built. Don't write a second version from memory.
- **Write after commit.** A record describes committed code. Never write or edit one for planned work.
- **Update files list when paths change.** If a file is renamed or moved, update its entry so lookup still works.

## Metadata fields

### type (required)
One of: `feat`, `fix`, `refactor`

### files (required)
List of file paths this record describes. Used for lookup:
```bash
grep -l -e '- src/payments/stripe.ts' .desk/architecture/*.md
```

Paths are relative to project root. Use exact paths; wildcards are not supported.

### since (required)
Commit hash where this record was last confirmed accurate. Use the full hash or short form (7+ chars).

Updated by `/update-arch` after each commit that changes the described files.

## Superseding records

Planned rule changes are listed in the spec's Supersedes section, not in records. After the code is committed, carry them out in one of two ways:

- **Same topic:** update the existing record. Replace or remove the superseded Constraint, adjust Architecture, and set the new `since:` hash.
- **New topic that overrides an older record:** write a new record and note what it replaces, so readers of the old record find the change:

```markdown
## Constraints
- Payments now support async webhooks (replaces sync-only rule in payment-gateway-integration.md)
```

Also remove the replaced rule from the old record, so the two never disagree.

## Validation

`validate-arch.sh` ships next to this file in the skill's `scripts/` directory. Run it from the project root, with the script path resolved against the skill directory:
```bash
scripts/validate-arch.sh .desk/architecture/payment-gateway-integration.md
```

With no arguments it validates every record in `.desk/architecture/`:
```bash
scripts/validate-arch.sh
```
