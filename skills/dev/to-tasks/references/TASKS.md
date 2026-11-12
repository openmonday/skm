# Task files

Each task is one file, `.context/issues/<issue-slug>/tasks/<task-slug>.md`. Its heading `# <NN>: <title>` carries a two-digit number in creation order. Numbers are never reused or changed, even after a task is dropped.

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

The spec Constraints and Supersedes entries, and the map records, that apply to this task. Omit when none apply.

## Verification

Commits and the checks run, with their results.
```

`Status:` is one of:

| Status | Meaning |
| --- | --- |
| `pending` | Not started, or reopened |
| `in-progress (<owner>)` | Claimed by `<owner>`: a task branch, or `main` for the owner workspace |
| `done` | Acceptance criteria verified, and the commit is on the integration branch |
| `dropped` | Removed from the plan with the user's approval; the reason is under Verification |

- Claim a task by setting `in-progress (<owner>)` before editing code. A task someone else claimed is theirs.
- Reopen a `done` task by setting it to `pending` and noting why under Verification. Earlier evidence stays.

`Blocked by:` is `None` or a comma-separated list of task numbers in the same issue, such as `01, 03`. A task is ready when every blocker is `done`. The ready tasks form the **frontier**. The graph has no cycles and no references to missing tasks.
