---
name: to-tasks
description: Break a plan, spec, or conversation into local tracer-bullet tasks with explicit dependencies.
disable-model-invocation: true
---

# To Tasks

Break a plan, spec, or conversation into a set of **tasks**: tracer-bullet vertical slices, each declaring the tasks that **block** it.

Read `.desk/AGENTS.md` for work paths, task states, and dependency rules. If it is missing, ask the user to run `/setup-desk`. In a shared-worktree run, return drafts to the coordinator to save.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. Read any spec or local task paths the user provides. Resolve task numbers within the identified feature; ask when the feature is ambiguous. Read the feature's existing spec and tasks before extending its plan.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Use `.desk/CONTEXT.md` vocabulary when present. Once you know which areas each task will touch, find their records following "Finding arch records" in `.desk/AGENTS.md`, and respect their Constraints.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tasks.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each task its **blocking edges**: the other tasks that must complete before it can start. A task with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the codebase. Prefer **expand–contract**: first add the new form beside the old, then migrate callers in independently verifiable batches, and finally delete the old form. Each migration task depends on the expansion; the contraction depends on every migration. If the batches cannot pass checks independently, group the coupled edits into one verifiable task with internal checkpoints and final integration checks. Use a handoff to resume a long task. Dependency edges still unlock only after a task's acceptance checks pass.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each task, show:

- **Title**: short descriptive name
- **Blocked by**: which other tasks (if any) must complete first
- **What it delivers**: the end-to-end behaviour this task makes work

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each task only depend on tasks that genuinely gate it?
- Should any tasks be merged or split further?

Iterate until the user approves the breakdown.

### 5. Save and validate local tasks

Save the approved tasks, one file per task, as `tasks/<task-slug>.md` inside the feature directory. Put the two-digit number in the task's `# <NN>: <title>` heading, in creation order within the feature. Leave `spec.md` to `/to-spec`: when working from a plan or conversation without a spec, put each task's confirmed requirements in its own sections, and suggest `/to-spec` when the user wants a durable feature-level source.

Use the task template below. Preserve existing task IDs, implementation evidence, and completion states when extending a plan. Change an existing task's scope or dependencies only as part of the approved breakdown; if completed work needs correction, reopen it explicitly.

```markdown
# <NN>: <Task title>

Status: pending
Blocked by: None

## What to build

The end-to-end behavior this task delivers, from the user's perspective.

## Acceptance criteria

- [ ] Observable result 1
- [ ] Observable result 2

## Constraints

The spec's constraints that apply to this task, the names of records found for the areas it touches, and any spec Supersedes entries this task carries out. Omit when none apply.

## Verification

Record checks and implementation commit references here as work completes.
```

Replace `None` with the blocking task numbers when applicable. Before reporting completion, verify every dependency resolves within the feature, the graph has no cycles, and each task has independently verifiable acceptance criteria. Report the feature path, task files, and initial frontier. Leave implementation and completion to the implementation workflow.

Avoid specific implementation file paths or code snippets in task requirements: they go stale fast. Stable pointers to the spec, tasks, or agreed test seams are useful. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo.
