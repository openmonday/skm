# Map records

A record is a Markdown file anywhere under `.context/map/`, such as `.context/map/payments/retry.md`. It describes what the committed code does and the rules it must keep. Give each record one cohesive responsibility and group records in module folders.

```markdown
---
type: feat
files:
  - src/payments/
  - config/payment.json
since: abc123f
---
# Payment processing

## Feature
Callers can submit payments.

## Constraints
- Never log card numbers: protects sensitive data.
- Retries are idempotent: prevents double charges.

## Architecture
The service delegates processing to payment providers.

## Violations
- 9f2c1ab src/payments/retry.py: reuses the charge id; breaks "Retries are idempotent".
```

## Front matter

- The file starts with the block shown, containing exactly `type`, `files`, and `since`, each once, in the literal syntax shown. Quotes, comments, and other YAML forms are rejected.
- `type` is `feat`, `fix`, or `refactor`.
- `files` lists project-root-relative paths, one per `  - ` line, without wildcards, `.`, `..`, or quotes. A directory covers every file under it. Every entry must match at least one file.
- `since` is a commit hash of at least seven characters. It is the newest commit touching any covered file. Uncommitted covered files do not count.

## Body

- Name the file with lowercase words joined by hyphens, without numbers or dates, and keep it under 60 lines.
- Start the body with a `# Title`.
- `feat` needs `## Feature`. `refactor` needs `## Constraints` and `## Architecture` and no Feature. A `fix` describes the rule and the failure it prevents.
- Write one Constraint per line, with its reason.
- Architecture describes boundaries, interfaces, and data flow. Use prose only, without code fences or line-numbered excerpts.
- `## Violations` is optional. Each line names a committed change that breaks a Constraint or Architecture statement: `- <commit> <path>: <observed behavior>; breaks "<statement as written>".` The statement stays binding, and the violating code stays a defect.
