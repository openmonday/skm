# Assist Instructions

Project-local conventions for engineering skills. Installed Assist skills load this file explicitly when invoked. Paths below resolve from the project root, including when `.assist` is a symlink in a linked worktree. Read this file before planning, implementing, debugging, reviewing, or changing the domain model.

## Files

Create files when there is content to record:

```text
.assist/
├── AGENTS.md
├── GLOSSARY.md
├── adr/
│   └── 0001-<decision>.md
├── features/
│   └── <feature-slug>/
│       ├── spec.md
│       └── issues/
│           ├── 01-<ticket-slug>.md
│           └── 02-<ticket-slug>.md
├── handoffs/
│   └── <session-slug>.md
├── debug/
│   └── <bug-slug>/
└── reports/
    └── <report-slug>.html
```

Use one stable feature slug for its spec and tickets. Read and update an existing feature when continuing it. Ask when multiple features could match a reference; a bare ticket number is scoped to one feature.

Write local specs, tickets, glossary definitions, ADRs, handoffs, and diagnostic notes in Chinese, keeping code identifiers and useful English technical terms. Instruction and configuration files, including this file, stay in English. Product or collaborative output follows its intended audience.

## Domain docs

Read `.assist/GLOSSARY.md` when present and use its canonical terms in proposals, code names, tests, and task descriptions. Read relevant `.assist/adr/` decisions before changing the area; surface conflicts with their rationale. Missing domain docs are normal: continue without creating placeholders.

Use one project glossary, grouping terms by domain when useful. `domain-modeling` records resolved terms and significant decisions as they arise. The glossary holds concise definitions; specs hold requirements; ADRs hold decisions and their reasons. Existing project documentation remains relevant evidence even when it lives elsewhere.

## Specs and tickets

A spec lives at `.assist/features/<feature-slug>/spec.md`. It records the problem, solution, user stories, implementation decisions, testing decisions, and scope.

Each ticket has its own file under the feature's `issues/`, numbered from `01` in dependency order. Reuse existing numbers; assign the next unused number to a new ticket. Each ticket contains these metadata lines near the top:

```text
Status: pending
Blocked by: None
```

`Blocked by: 01, 02` references tickets in the same feature. Every reference must exist, self-dependencies are invalid, and the dependency graph must be acyclic. List all genuine prerequisites, including later-numbered tickets if an existing plan changes.

- `pending`: waiting to be started, including tickets with unfinished blockers.
- `in-progress`: claimed by one implementer.
- `done`: acceptance criteria verified, review findings addressed, and the implementation is committed to the target branch. In a worktree workflow, its changes must also be merged into the integration branch.

The **frontier** is pending tickets whose blockers are all done. Start in number order when several are ready. Claim a ticket before dispatching work. A failed or interrupted attempt stays in-progress with a brief note until the coordinator confirms the old worker has stopped, then resumes or releases it to pending.

Record verification evidence and implementation commit references in the ticket. Record the integration branch, owner workspace, and original review-base commit in the spec when implementation starts; reuse that baseline when resuming. Completion includes rerunning affected checks on the target branch. When a final review finds a defect, reopen the affected ticket until the correction is integrated and verified. A feature is complete when every ticket and the spec's acceptance requirements are satisfied; the coordinator then records a completion note and final verification in `spec.md`.

## Git and shared worktrees

Assist material is local, untracked data excluded by `/.assist` in Git's shared `info/exclude`. It is outside project commit history and needs a separate backup if desired. Exclusion does not affect files already tracked. Preserve the local exclusion on setup reruns.

For a parallel implementation, the coordinator prepares every worktree before launching a worker:

1. Resolve the current `.assist/` to its physical absolute path. Keep this owner workspace available until all dependent worktrees are cleaned up.
2. Create a fresh branch and worktree from the current integration branch. Use `git worktree add -b <ticket-branch> <worktree-path> <integration-branch>` with concrete, quoted arguments; keep worktrees outside `.assist/` so their source files are not recursively included in the shared workspace.
3. Create `<worktree-path>/.assist` as a directory symlink to the resolved owner directory. An existing entry must resolve to that same directory; resolve conflicts before dispatch and preserve any existing data.
4. Verify the linked `.assist/AGENTS.md` is readable and matches the owner, and `git -C <worktree-path> check-ignore -v -- .assist` confirms the link is ignored. Check the shared exclusion if verification fails.

Workers use ordinary `.assist/...` paths. The coordinator handles the absolute link target once during setup. Symlink support is required for parallel worktrees; if the platform cannot create the link, use sequential implementation in the owner workspace and report the limitation.

Only the coordinator writes shared Assist files. Workers and reviewers read the spec, tickets, glossary, and ADRs through the link and return findings, evidence, or proposed document updates to the coordinator. Keep durable source files, test fixtures, and regression tests in the normal tracked project directories.

On resume, inspect existing branches, worktrees, commits, and ticket notes before dispatching. Reconcile in-progress work and reuse valid links. Remove only worktrees created by this effort, after integration and verification; retain branches until their commits are known to be integrated. Preserve the owner `.assist/`.

## Handoffs, diagnostics, and reports

Save engineering handoffs under `.assist/handoffs/`, captured traces and temporary reproduction harnesses under `.assist/debug/<bug-slug>/`, and engineering HTML reports under `.assist/reports/`. Redact secrets before writing or quoting artifacts. Remove disposable debug captures after diagnosis; retain useful redacted findings and handoff pointers. Permanent regression fixtures belong with the tests.

Teaching workspaces managed by `teach` keep their own learning records and vocabulary. They are independent of these engineering paths.
