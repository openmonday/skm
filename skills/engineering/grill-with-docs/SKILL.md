---
name: grill-with-docs
description: Clarify a plan through an interview while recording resolved domain terms and ADRs locally.
disable-model-invocation: true
---

Invoke `grill-me` and `domain-modeling` together. If either skill is unavailable, report the missing dependency and its installation command: `skm add grill-me domain-modeling`.

Read `.assist/AGENTS.md` when present. Use `grill-me` for the interview rounds and `domain-modeling` to challenge terminology, check the code, and record resolved terms and significant decisions as they arise. Follow `domain-modeling`'s initialization, document formats, and shared-file ownership rules.

Document resolved domain knowledge during the interview. Begin implementation only after the user confirms the shared understanding. At the end, report the updated document paths and any unresolved decisions.
