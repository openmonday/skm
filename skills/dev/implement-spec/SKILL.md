---
name: implement-spec
description: Implement a local spec and its ticket graph on an integration branch using parallel worktrees.
disable-model-invocation: true
---

# Implement Spec

Deliver the entire spec on one **integration branch**. Treat its tickets as a dependency graph, scheduling the **frontier** as prerequisites complete.

Read `.desk/AGENTS.md` before starting. If it is missing, ask the user to run `/setup-assist`. It defines paths, ticket states, ownership, and the shared-worktree procedure. If the spec has no tickets, ask the user to run `/to-tickets` first; describe any missing input precisely.

## 1. Validate the plan

Read the complete spec and tickets. Resolve every dependency and check the graph for missing references and cycles. Read the glossary. Find the arch records for the files and directories the spec will change, following "Finding arch records" in `.desk/AGENTS.md`, and treat their Constraints as requirements alongside the spec's. Reuse agreed test seams; clarify unresolved acceptance requirements before implementation.

Record the starting worktree status. Pin the work's initial review-base commit before implementation, record it in the spec, and reuse it on resume so final review covers the entire effort. Choose the record name (`<YYYY-MM-DD>-<feature-slug>`) and note it in the spec too. If a resumed feature lacks that record, reconstruct and verify its original base from branch history before final review. Use a clean integration worktree so unrelated edits cannot enter merges or review. On resume, reconcile existing work and ticket ownership using the workspace rules.

An optional exploration subagent may inspect code or external docs and return findings. The coordinator saves useful notes in the shared workspace; all workers receive pointers to these notes rather than duplicated context.

**Done:** every ticket is accounted for, the dependency graph is valid, and implementation can start at a known baseline.

## 2. Prepare integration and workers

Create the integration branch from the agreed base, or resume the existing integration branch for this feature. If the owner worktree has unrelated edits, use a separate clean integration worktree and prepare its shared `.desk` link too. Record the integration branch and owner workspace in the spec. For each ready ticket, the coordinator claims it and prepares a dedicated branch and worktree from the current integration tip, following the sharing procedure in `.desk/AGENTS.md`.

Workers read ordinary `.desk/...` paths and leave shared files to the coordinator. If parallel worktrees are unavailable, work sequentially in the owner workspace with the same ticket graph, verification, and review requirements.

**Done:** each dispatched ticket has one owner and a verified, isolated workspace with readable shared context.

## 3. Implement the frontier

Run implementer subagents in the background when available. Each receives the spec/ticket paths, agreed test seams, branch, worktree, and any relevant notes. Each worker:

1. Confirms its branch descends from the assigned integration commit before editing. Reports a mismatch so the coordinator can reconcile it while preserving existing work.
2. Uses `tdd` to implement the ticket and verifies its acceptance criteria.
3. Commits its scoped changes with conventional commit messages, merges the current integration tip into its ticket branch, resolves conflicts, and reruns affected checks.
4. Returns its branch/commit, check results, unresolved findings, and proposed shared-document updates.

Use context pointers and concise results for communication. A worker report is ready for integration, not proof that a ticket is done.

## 4. Integrate and advance

Serialize integration merges. A merger subagent may perform each merge, but the coordinator owns scheduling and shared-document updates. If integration advanced after a worker synchronized, merge against the latest tip and resolve and verify any conflicts before accepting the ticket.

Verify the merged acceptance behavior on the integration branch before recording completion. Recompute the frontier and launch newly ready tickets while independent workers continue. Apply agreed glossary updates centrally so later workers read current terms.

**Done:** all ticket implementations are integrated and verified, with recorded commit references and no outstanding worker failures.

## 5. Review the whole spec

Run the full applicable test suite and typechecking on the integration branch. Invoke `code-review` against the work's original review-base commit, passing the spec and all ticket paths.

Reopen tickets affected by review findings. Use one implementer subagent to fix the findings, with a shared workspace prepared as above; integrate its corrections and rerun affected checks. If subagents are unavailable, the coordinator performs the same work sequentially.

**Done:** the entire spec is satisfied, review findings are addressed, and final verification results are recorded.

## 6. Close out locally

Finalize ticket states. Remove `.desk/features/<feature-slug>/` and tell the user. Report the integration branch, commits, checks, and limitations.

If the feature qualifies for an arch record (it added behavior with rules attached, set a boundary, reshaped modules, or revealed a rule the code did not enforce), recommend calling `/update-arch` with the files modified in the integration branch to record the architectural decisions. The arch record should start from the spec's Constraints, adjusted for what was actually built, including changes made during review.

Completion ends at the local integration branch.

Clean up only worktrees created for this effort after confirming their work is integrated and safe to remove. Preserve the owner workspace and the context file and arch records.
