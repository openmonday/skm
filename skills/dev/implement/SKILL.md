---
name: implement
description: Implement a spec, review the changes, and commit to the current branch.
disable-model-invocation: true
---

# Implement

Implement the work described by the user's spec on the current branch. If it has tasks, stop and explain that this workflow does not coordinate task state or integration.

## 1. Establish scope

If `.desk/AGENTS.md` is missing, stop and tell the user the Desk workspace is not initialized. Resolve the spec using workspace conventions and state its title before starting. If the spec is missing, stop and ask the user for a spec. Read the full spec and `.desk/CONTEXT.md`. Find the arch records for the files and directories you will change, following [arch record discovery](ARCH-RECORDS.md). Apply them under the [arch record compliance rules](ARCH-RECORDS.md): their Constraints are requirements alongside the spec's, except where the spec's Supersedes list replaces them. If the work would break any other Constraint, stop and ask. Ask only when the reference or required behavior is ambiguous.

Record the current branch, starting commit, and existing working-tree changes. Keep unrelated user changes intact and outside the implementation commit. The starting commit is the review baseline.

**Done:** the scope, acceptance criteria, test seams, and baseline are known.

## 2. Implement and verify

Use test-driven development where possible at pre-agreed seams, honoring any confirmation already given. Run relevant single test files and typechecking during development, then the full applicable test suite at the end. Record actual results and any unavailable checks.

**Done:** the requested behavior and acceptance criteria are implemented and applicable checks pass, or an unresolved limitation is explicitly reported.

## 3. Review and commit

Review the changes against the starting commit and the spec, including project standards and acceptance criteria. Include staged, unstaged, and relevant new files in the review. Fix findings within scope and rerun the affected checks.

Commit only this work to the current branch after review and verification. Ensure the actual staged content matches the reviewed and tested implementation; reconcile partially staged edits before committing. Report the commit and verification evidence instead of editing the spec.

If the change added behavior with rules, set a boundary, reshaped modules, or revealed an unenforced rule, report the architectural decisions and committed files.

When the spec is complete and everything is verified, close out the feature: if architectural decisions need recording, keep `.desk/specs/<feature-slug>/` as the source of Constraints and Supersedes; otherwise remove the folder now and tell the user. In a shared-worktree run, return proposed shared-document changes to the coordinator instead of writing them.

**Done:** the scoped implementation is reviewed and committed, and remaining limitations are reported.
