---
name: wait-what
description: "Stop. That last message did not land: re-pitch it."
disable-model-invocation: true
---

Wait, I don't understand where you've got to here. Re-pitch the last message: give me a little context, respond in my language, and use simple terms. Preserve the intended meaning and explain unfamiliar terms briefly.

If the `.desk/` directory exists, read `.desk/AGENTS.md` when present for project conventions, use the domain language in `.desk/CONTEXT.md` if it exists, and consult relevant `.desk/arch/` records when they explain the topic. If the `.desk/` directory or any of these documents does not exist, skip them without creating them, and continue silently. Treat shared Assist documents as read-only for this explanation; explain using the available context without creating or updating domain context.
