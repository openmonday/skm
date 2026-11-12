# Map record format

Records live recursively under `.context/map/`, for example `.context/map/payments/validation.md` and describe committed reality, not planned work. Every Git-tracked or non-ignored untracked file must be covered by at least one valid record, including tests, configuration, generated files and map records themselves. Organize records into module subfolders and keep each record small and focused on a cohesive responsibility; a broad directory entry is allowed, but does not excuse inaccurate content. See [MAP-RECORDS.md](../MAP-RECORDS.md) for how to use records.

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

## Architecture
The service delegates processing to payment providers.
```

## Rules

- Use a meaningful lowercase hyphen-separated filename without numbers or dates. Keep each record under 60 lines.
- Front matter must be the first block, delimited by `---` lines. Use exactly `type`, `files`, and `since`, each once. The checker accepts the literal block-list syntax in the example, not all YAML syntax; no inline comments, quoted strings, aliases or extra metadata.
- `type` is `feat`, `fix`, or `refactor`. A feat has a Feature section; a refactor has Constraints and Architecture sections and no Feature. A fix should describe the rule and failure it prevents. Sections must be meaningful; semantic quality is reviewed by the agent.
- `files` is a nonempty list of literal project-root-relative paths without wildcards, `.` or `..`. Each entry must match eligible files. A directory covers every eligible file recursively under it. Eligible files comprise tracked files (even if ignored) and untracked files not excluded by Git ignore rules, including .git/info/exclude and global excludes; .git internals are excluded. Spaces are literal; do not quote paths.
- `since` is a full or unambiguous abbreviated hexadecimal commit hash, at least seven characters, reachable from HEAD. It must resolve to the latest commit affecting any *current tracked file* covered by the record. The checker finds each file's latest commit and selects the first among them in `git rev-list HEAD` order. It does not compare timestamps. Review the record even when the hash alone needs updating.
- No code snippets or line-numbered excerpts. Write constraints one per line, with a reason. Describe boundaries, interfaces and data flow, rather than implementation detail. Use specifications' Constraints and Supersedes when applicable; remove or explicitly supersede outdated rules.
- Update paths after renames. Explain inferred rules and ask the user to review them. Never assert uncommitted work is recorded.

The format checker enforces deterministic format rules above, but cannot decide whether a title is descriptive, prose is accurate, sections are meaningful, or constraints are independent; review those manually. It reads records from the working tree and uses Git's index and non-ignored untracked files for coverage and HEAD history for hashes; untracked and staged-only new files have no HEAD history and must be committed before a valid hash can be determined. Uncommitted changes require separate review.

`setup-context` normally adds `/.context` to `.git/info/exclude`, but this does not untrack files already in Git.

**Tracked-record limitation:** If `.context/map` itself is Git-tracked, mandatory coverage and exact latest hashes can form self-referential or circular dependencies: committing a record can change the expected `since` of the record covering it. The scripts report these normally; do not claim convergence or silently exclude tracked files. Discuss repository tracking policy with the user when this occurs.
