# Tasks

Each task is one file, `specs/<feature-slug>/tasks/<task-slug>.md`. The task's `# <NN>: <title>` heading carries its number: two digits in creation order within the feature. Never reuse or renumber a number, even after a task is dropped.

The `Status:` line holds one of:

| Status | Meaning |
| --- | --- |
| `pending` | Not started, or reopened |
| `in-progress (<owner>)` | Claimed. `<owner>` is the task branch, or `main` for work in the owner workspace |
| `done` | Acceptance criteria verified and the commit is on the target branch (the integration branch in `/implement-spec`) |
| `dropped` | Removed from the plan with the user's approval; give the reason under Verification |

- **Claim before work.** Set `in-progress (<owner>)` before editing code. Never take a task that someone else has claimed.
- **Reopen explicitly.** Set a `done` task back to `pending` and note why under Verification. Never edit completed evidence away.
- **Verification** lists the commits and the checks actually run, with their results.

`Blocked by:` is `None` or a comma-separated list of task numbers in the same feature (`01, 03`). A task is ready when every blocker is `done`. The set of ready tasks is the **frontier**. The graph must have no cycles and no references to missing tasks.

