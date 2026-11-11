---
name: guidelines
description: Project rules and coding guidelines. Use for development work, including research, design, planning, implementation, review, and handoffs; read workspace rules and apply relevant coding and architecture guidance.
license: MIT
disable-model-invocation: true
---

# Guidelines

Read `.desk/AGENTS.md` for project rules when present; continue silently if absent.

Keep changes focused and avoid speculative complexity.

Before adding complexity for a speculative or vanishingly unlikely race or security edge case, explain the concrete failure mode, likelihood, and complexity cost to the user and get their buy-in. Do not silently expand scope for theoretical robustness.

Read [ARCH-RECORDS.md](ARCH-RECORDS.md) for arch record discovery and compliance.
