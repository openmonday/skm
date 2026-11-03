---
name: guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---

# Guidelines

Keep changes focused and avoid speculative complexity.

Before adding complexity for a speculative or vanishingly unlikely race or security edge case, explain the concrete failure mode, likelihood, and complexity cost to the user and get their buy-in. Do not silently expand scope for theoretical robustness.

## Arch record compliance

Before editing a file, find its arch records (see Finding arch records below). Read them and treat their Constraints as requirements. When a change would break a constraint, surface the conflict to the user instead of silently overriding it. A constraint can be changed, but not accidentally.

## Finding arch records

Use the bundled helper to find the arch records that describe the files you will edit:

```bash
scripts/find-arch.sh path/to/file [...]
```

- Read all matching arch records.
- Check drift: `git log --oneline <since>..HEAD -- <file>` shows what changed since a record was confirmed. Many commits means read the record critically; it may be stale.
- When two arch records disagree, the one with the newer `since:` wins.
- Silently continue when nothing is found or an arch record file is missing.
- A renamed file may be listed under its old path; `git log --follow` traces the rename if a direct match fails.

Arch records cover rules tied to code. Rules that apply to the whole project belong in the project-wide rules section of `.desk/AGENTS.md`.
