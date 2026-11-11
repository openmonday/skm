---
name: wait-what
description: "Stop. That last message did not land: re-pitch it."
disable-model-invocation: true
---

Wait, I don't understand where you've got to here. Re-pitch the last message: give me a little context, respond in my language, and use simple terms. Preserve the intended meaning and explain unfamiliar terms briefly.

If `.context/` exists, use the domain language in `.context/GLOSSARY.md` when present and consult relevant `.context/map/` records when they explain the topic. If the workspace or these documents do not exist, continue without creating them. Treat shared context documents as read-only for this explanation.
