---
name: guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---

# Guidelines

Keep changes focused and avoid speculative complexity.

Before adding complexity for a speculative or vanishingly unlikely race or security edge case, explain the concrete failure mode, likelihood, and complexity cost to the user and get their buy-in. Do not silently expand scope for theoretical robustness.

## Arch record compliance

Before editing a file, find its arch records (see Finding arch records below). A record describes the committed code as of its `since:` commit, not a plan. Treat its Constraints as requirements, with these rules:

- **Precedence:** the user's explicit instruction, then the active spec's Supersedes list, then arch record Constraints, then what the code appears to do.
- **Unplanned conflict:** when a change would break a constraint that the spec does not supersede, stop and surface it to the user instead of silently overriding it. A constraint can be changed, but not accidentally.
- **Drift:** when the record's files have commits after `since:`, check the constraints you rely on against the code. Report disagreements; don't silently follow either side.
- **Timing:** never edit `.desk/arch/` to describe planned work. Records change after the code is committed, through `/update-arch`.

`.desk/AGENTS.md` ("Using arch records") is the full version of these rules.

## Finding arch records

Use the bundled helper to find the arch records that describe the files you will edit:

```bash
scripts/find-arch.sh path/to/file [...]
```

- Read all matching arch records.
- Check drift: `git log --oneline <since>..HEAD -- <file>` shows what changed since a record was confirmed. Any commits mean the record may be stale.
- When two arch records disagree, the one with the newer `since:` wins.
- Silently continue when nothing is found or an arch record file is missing.
- A renamed file may be listed under its old path; `git log --follow` traces the rename if a direct match fails.

Arch records cover rules tied to code. Rules that apply to the whole project belong in the project-wide rules section of `.desk/AGENTS.md`.
