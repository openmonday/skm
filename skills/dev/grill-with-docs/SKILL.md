---
name: grill-with-docs
description: Clarify a plan through an interview while recording resolved domain terms locally and confirming the rules the work must follow.
disable-model-invocation: true
---

Invoke `grill-me` and `domain-modeling` together. If either skill is unavailable, report the missing dependency and its installation command: `skm add grill-me domain-modeling`.

If the user names a research report from `/research`, or one exists under `.desk/research/` for this topic, read it first. Treat its findings as settled background, and start the interview from its Open questions and its "Fit with this project" suggestions. Use `grill-me` for the interview rounds and `domain-modeling` to challenge terminology, check the code, record resolved terms as they arise, and confirm the rules the work must follow. Follow `domain-modeling`'s initialization, glossary format, and shared-file ownership rules.

Document resolved domain terms during the interview. Report the confirmed rules along with the resolved terms. Begin implementation only after the user confirms the shared understanding. At the end, report the updated document paths and any unresolved decisions.
