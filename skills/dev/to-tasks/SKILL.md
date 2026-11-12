---
name: to-tasks
description: Split a local spec into tracer-bullet task files with blocking edges.
disable-model-invocation: true
---

# To tasks

Split the spec at `.context/issues/<issue-slug>/spec.md` into task files that follow [the task format](references/TASKS.md). Ask which issue is meant if it is unclear.

## 1. Gather context

Read the spec, any existing tasks, and `.context/GLOSSARY.md`. Explore the code the work will touch. For those files, run `scripts/query-map.py <file>...` from the project root and read every record it lists. Each task must keep their Constraints and Architecture, except those the spec lists under Supersedes. If the spec would break any other one, stop and ask the user.

Look for prefactoring that makes the change easy: "make the change easy, then make the easy change."

## 2. Draft vertical slices

Make each task a **tracer bullet**:

- It cuts a narrow but complete path through every layer (schema, API, UI, tests).
- It is demoable or verifiable on its own.
- It fits in one fresh context window.
- Prefactoring tasks come first.

Give each task its **blocking edges**: the tasks that must finish before it can start.

A **wide refactor** is the exception: one mechanical change, such as renaming a column, that spreads across the codebase. Use **expand–contract**. Add the new form beside the old, migrate callers in batches that each pass checks, then delete the old form. Each migration depends on the expansion, and the contraction depends on every migration. If batches cannot pass checks separately, make one task with internal checkpoints.

## 3. Review with the user

Present the breakdown as a numbered list. For each task, give its title, its blockers, and the behavior it delivers. Ask whether the granularity is right, whether each blocker really gates its task, and whether any task should be merged or split. Iterate until the user approves.

## 4. Save

Write one file per approved task under the issue's `tasks/` folder. When extending a plan, keep existing numbers, evidence, and states. Change an existing task only as part of the approved breakdown, and reopen a `done` task explicitly. Leave `spec.md` unchanged.

Keep file paths and code out of requirements, because they go stale. The exception is a prototype snippet that pins a decision better than prose (a state machine, schema, or type shape). Inline the decision-rich part and note that it came from a prototype.

**Done:** every blocker refers to a task in this issue, the graph has no cycles, and every task has acceptance criteria that can be verified on their own. Report the task files and the initial frontier.
