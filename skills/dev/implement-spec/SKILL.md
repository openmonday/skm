---
name: implement-spec
description: Implement a local spec and its task graph on an integration branch using parallel worktrees.
disable-model-invocation: true
---

# Implement Spec

Deliver the entire spec on one **integration branch**. Treat its tasks as a dependency graph, scheduling the **frontier** as prerequisites complete.

If `.desk/AGENTS.md` is missing, stop and tell the user the Desk workspace is not initialized. If the spec is missing, stop and ask the user for a spec; if it has no tasks, stop and ask the user for a task graph. Read [task conventions](TASKS.md) for task states and [WORKTREES.md](WORKTREES.md) for ownership and worktrees.

## 1. Validate the plan

Read the complete spec and tasks. Resolve every dependency and check the graph for missing references and cycles. Read the glossary. Find the arch records for the files and directories the spec will change, following [arch record discovery](ARCH-RECORDS.md). Apply them under the [arch record compliance rules](ARCH-RECORDS.md): their Constraints are requirements alongside the spec's, except where the spec's Supersedes list replaces them. Pass both the records and the Supersedes list to every worker. A worker that would break any other Constraint stops and reports back instead of proceeding. Reuse agreed test seams; clarify unresolved acceptance requirements before implementation.

Record the starting worktree status. Pin the work's initial review-base commit before implementation, record it in the spec, and reuse it on resume so final review covers the entire effort. Choose the record name (`<YYYY-MM-DD>-<feature-slug>`) and note it in the spec too. If a resumed feature lacks that record, reconstruct and verify its original base from branch history before final review. Use a clean integration worktree so unrelated edits cannot enter merges or review. On resume, reconcile existing work and task ownership using the workspace rules.

An optional exploration subagent may inspect code or external docs and return findings. The coordinator saves useful notes in the shared workspace; all workers receive pointers to these notes rather than duplicated context.

**Done:** every task is accounted for, the dependency graph is valid, and implementation can start at a known baseline.

## 2. Prepare integration and workers

Create the integration branch from the agreed base, or resume the existing integration branch for this feature. If the owner worktree has unrelated edits, use a separate clean integration worktree and prepare its shared `.desk` link too. Record the integration branch and owner workspace in the spec. For each ready task, the coordinator claims it and prepares a dedicated branch and worktree from the current integration tip, following [WORKTREES.md](WORKTREES.md).

Workers read ordinary `.desk/...` paths and leave shared files to the coordinator. If parallel worktrees are unavailable, work sequentially in the owner workspace with the same task graph, verification, and review requirements.

**Done:** each dispatched task has one owner and a verified, isolated workspace with readable shared context.

## 3. Implement the frontier

Run implementer subagents in the background when available. Each receives the spec/task paths, agreed test seams, branch, worktree, and any relevant notes. Each worker:

1. Confirms its branch descends from the assigned integration commit before editing. Reports a mismatch so the coordinator can reconcile it while preserving existing work.
2. Uses test-driven development to implement the task and verifies its acceptance criteria.
3. Commits its scoped changes with conventional commit messages, merges the current integration tip into its task branch, resolves conflicts, and reruns affected checks.
4. Returns its branch/commit, check results, unresolved findings, and proposed shared-document updates.

Use context pointers and concise results for communication. A worker report is ready for integration, not proof that a task is done.

## 4. Integrate and advance

Serialize integration merges. A merger subagent may perform each merge, but the coordinator owns scheduling and shared-document updates. If integration advanced after a worker synchronized, merge against the latest tip and resolve and verify any conflicts before accepting the task.

Verify the merged acceptance behavior on the integration branch before marking a task `done` and recording its commit references and checks under `Verification`. Recompute the frontier and launch newly ready tasks while independent workers continue. Apply agreed glossary updates centrally so later workers read current terms.

**Done:** all task implementations are integrated and verified, with recorded commit references and no outstanding worker failures.

## 5. Review the whole spec

Run the full applicable test suite and typechecking on the integration branch. Review the changes against the work's original review-base commit, the spec, all tasks, and project standards.

Reopen tasks affected by review findings. Use one implementer subagent to fix the findings, with a shared workspace prepared as above; integrate its corrections and rerun affected checks. If subagents are unavailable, the coordinator performs the same work sequentially.

**Done:** the entire spec is satisfied, review findings are addressed, and final verification results are recorded.

## 6. Close out locally

Finalize task states. Report the integration branch, commits, checks, and limitations.

If the feature added behavior with rules, set a boundary, reshaped modules, or revealed an unenforced rule, report the architectural decisions and modified files. Keep the spec and its Constraints and Supersedes as a source for recording those decisions.

Once the spec is satisfied and every task is `done` or `dropped`, remove the feature folder if no architectural decisions need recording; otherwise retain it. Keep it if work remains incomplete. Tell the user which happened.

Completion ends at the local integration branch.

Clean up only worktrees created for this effort after confirming their work is integrated and safe to remove. Preserve the owner workspace and the context file and arch records.
