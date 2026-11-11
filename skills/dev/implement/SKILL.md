---
name: implement
description: Implement a spec, review the changes, and commit to the current branch.
disable-model-invocation: true
---

# Implement

Implement the work described by the user's spec from `/to-spec`.

## 1. Establish scope

If `.desk/AGENTS.md` is missing, ask the user to run `/setup-desk`. Resolve the spec using workspace conventions and state its title before starting. If the spec is missing, ask the user to run `/to-spec` first. Read the full spec and `.desk/CONTEXT.md`. Find the arch records for the files and directories you will change, following the arch-record discovery procedure in `guidelines`. Apply them under the arch-record compliance rules in `guidelines`: their Constraints are requirements alongside the spec's, except where the spec's Supersedes list replaces them. If the work would break any other Constraint, stop and ask. Ask only when the reference or required behavior is ambiguous.

Record the current branch, starting commit, and existing working-tree changes. Keep unrelated user changes intact and outside the implementation commit. The starting commit is the fixed point passed to `code-review`.

**Done:** the scope, acceptance criteria, test seams, and baseline are known.

## 2. Implement and verify

Use `tdd` where possible at pre-agreed seams, honoring any confirmation already given. Run relevant single test files and typechecking during development, then the full applicable test suite at the end. Record actual results and any unavailable checks.

**Done:** the requested behavior and acceptance criteria are implemented and applicable checks pass, or an unresolved limitation is explicitly reported.

## 3. Review and commit

Invoke `code-review` with the starting commit and the explicit spec path. Include staged, unstaged, and relevant new files in the review. Fix findings within scope and rerun the affected checks.

Commit only this work to the current branch after review and verification. Ensure the actual staged content matches the reviewed and tested implementation; reconcile partially staged edits before committing. Report the commit and verification evidence instead of editing the spec.

If the change qualifies for an arch record (it added behavior with rules attached, set a boundary, reshaped modules, or revealed a rule the code did not enforce), recommend calling `/update-arch` with the committed files and the spec path to record the architectural decisions.

When the spec is complete and everything is verified, close out the feature: if `/update-arch` was recommended, keep `.desk/specs/<feature-slug>/`, because `/update-arch` needs the spec's Constraints and Supersedes list and removes the folder itself afterwards; otherwise remove the folder now and tell the user.

**Done:** the scoped implementation is reviewed and committed, and remaining limitations are reported.
