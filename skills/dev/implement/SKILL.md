---
name: implement
description: Implement a spec or local tickets, review the changes, and commit to the current branch.
disable-model-invocation: true
---

# Implement

Implement the work described by the user's spec or tickets.

## 1. Establish scope

Read `.desk/AGENTS.md`; if missing, ask the user to run `/setup-desk`. Resolve local references using its conventions and state the ticket title before starting. Read the full source spec and `.desk/CONTEXT.md`. Find the arch records for the files and directories you will change, following "Finding arch records" in `.desk/AGENTS.md`. Apply them under "Using arch records": their Constraints are requirements alongside the spec's, except where the spec's Supersedes list replaces them. If the work would break any other Constraint, stop and ask. Ask only when the reference or required behavior is ambiguous.

Record the current branch, starting commit, and existing working-tree changes. Keep unrelated user changes intact and outside the implementation commit. The starting commit is the fixed point passed to `code-review`.

When implementing tickets, claim each one before starting it and respect its blockers. In a shared-worktree run, return state updates to the coordinator instead of writing shared files.

**Done:** the scope, acceptance criteria, test seams, baseline, and ticket ownership are known.

## 2. Implement and verify

Use `tdd` where possible at pre-agreed seams, honoring any confirmation already given. Run relevant single test files and typechecking during development, then the full applicable test suite at the end. Record actual results and any unavailable checks.

**Done:** the requested behavior and acceptance criteria are implemented and applicable checks pass, or an unresolved limitation is explicitly reported.

## 3. Review and commit

Invoke `code-review` with the starting commit and explicit spec/ticket paths. Include staged, unstaged, and relevant new files in the review. Fix findings within scope and rerun the affected checks.

Commit only this work to the current branch after review and verification. Ensure the actual staged content matches the reviewed and tested implementation; reconcile partially staged edits before committing. Record the commit and verification evidence in the ticket's `Verification` section, completing tickets according to `.desk/AGENTS.md`; when working from a spec without tickets, report the evidence instead of editing the spec. In a worktree run, the coordinator completes them only after integration; return the branch, commit, check results, and proposed shared-document changes.

If the change qualifies for an arch record (it added behavior with rules attached, set a boundary, reshaped modules, or revealed a rule the code did not enforce), recommend calling `/update-arch` with the committed files and the spec path to record the architectural decisions.

When this commit completes the feature's last ticket and everything is verified, close out the feature: if `/update-arch` was recommended, keep `.desk/features/<feature-slug>/`, because `/update-arch` needs the spec's Constraints and Supersedes list and removes the folder itself afterwards; otherwise remove the folder now and tell the user.

**Done:** the scoped implementation is reviewed and committed, ticket state reflects the actual integration status, and remaining limitations are reported.
