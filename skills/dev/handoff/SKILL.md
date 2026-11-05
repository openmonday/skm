---
name: handoff
description: Save a concise conversation handoff for another agent to continue the work.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff that lets a fresh agent resume the work. For engineering work, read `.desk/AGENTS.md` and save to `.desk/handoffs/<session-slug>.md`, using a distinct name for each handoff; overwrite when continuing a known session. If the workspace is missing, ask the user to run `/setup-desk`. For an independent teaching or non-engineering workspace, save in the workspace location the user chose; use an OS temporary directory when no persistent location is established.

Include the objective, confirmed decisions, current progress, unresolved questions, and concrete next actions. Record the project location, branch/worktree, and how to find shared `.desk` context. Name the suggested skills for the next session.

Reference existing specs, tickets, records, research, commits, and diffs by path instead of duplicating them. Use project-relative `.desk/...` pointers where possible. Redact secrets before saving.

If the user supplied a next-session focus, tailor the handoff to it. In a shared-worktree run, return handoff content to the coordinator to save. Finish by reporting the saved path.
