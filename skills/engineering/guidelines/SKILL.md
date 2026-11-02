---
name: guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---

# Guidelines

Keep changes focused and avoid speculative complexity.

Before adding complexity for a speculative or vanishingly unlikely race or security edge case, explain the concrete failure mode, likelihood, and complexity cost to the user and get their buy-in. Do not silently expand scope for theoretical robustness.

## Arch record compliance

Before editing a file, find its arch records following "Finding arch records" in `.assist/AGENTS.md`. Read them and treat their Constraints as requirements. When a change would break a constraint, surface the conflict to the user instead of silently overriding it. A constraint can be changed, but not accidentally.

After committing a change that introduces new rules or completes a feature, write an arch record following "Arch records" in `.assist/AGENTS.md`, then update its `since:` field to the new commit hash using `/update-arch`.
