---
name: implement-tasks
description: Implement a local spec's task graph on an integration branch, with parallel worktrees.
disable-model-invocation: true
---

# Implement tasks

Deliver the spec at `.context/issues/<issue-slug>/spec.md` and its task files on one **integration branch**. Ask which issue is meant if it is unclear. Task files follow [the task format](references/TASKS.md). Worktrees and ownership follow [the worktree guide](references/WORKTREES.md).

## Map constraints

For every file a task touches, run `scripts/query-map.py <file>...` from the project root and read every record it lists. Treat their Constraints and Architecture as requirements, except those the spec lists under Supersedes. A worker that would break any other one stops and reports, and the coordinator asks the user. `.context/map/` describes committed code; leave it as is.

## 1. Validate the plan

Read the spec, every task, and `.context/GLOSSARY.md`. Check that every blocker exists and the graph has no cycles. Settle unclear acceptance criteria with the user.

Pin the review base: the commit the work starts from. Record it and the integration branch in the spec. On resume, reuse both and reconcile task states with the existing branches.

**Done:** the graph is valid, and the review base and integration branch are recorded.

## 2. Run the frontier

For each ready task, the coordinator claims it and prepares its worktree from the current integration tip. Each worker, preferably a background subagent, receives the spec and task paths, the relevant records and Supersedes, the branch, and the worktree. Each worker:

1. Confirms its branch starts at the assigned integration commit.
2. Implements the task with test-driven development and verifies its acceptance criteria.
3. Commits, merges the current integration tip into its branch, resolves conflicts, and reruns affected checks.
4. Returns its commits, check results, open problems, and proposed changes to shared files.

## 3. Integrate

Merge task branches into the integration branch one at a time. Verify the task's acceptance criteria on the merged result, then mark it `done` with its commits and checks under Verification. Apply proposed shared-file changes centrally. Recompute the frontier and dispatch newly ready tasks while other workers continue.

**Done:** every task is `done` or `dropped`, and no worker has an open failure.

## 4. Review the whole spec

Run the full test suite and type checks on the integration branch. Review the full diff from the review base against the spec, every task, and project standards. Reopen tasks with findings, fix them through one worker, integrate, and rerun the affected checks.

**Done:** the spec is satisfied and the final check results are recorded.

## 5. Close out

Remove the worktrees and task branches this run created, once their work is integrated. Report the integration branch, its commits, the checks run, and remaining limitations.
