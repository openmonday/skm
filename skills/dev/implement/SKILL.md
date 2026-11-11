---
name: implement
description: Implement a spec, review the changes, and commit to the current branch.
disable-model-invocation: true
---

# Implement

Implement the work described by the user's spec on the current branch. If it has tasks, stop and explain that this workflow does not coordinate task state or integration.

## 1. Establish scope

Resolve the spec under `.context/issues/<issue-slug>/spec.md` and state its title before starting. If the reference is ambiguous, ask which issue is intended; if the spec is missing, stop and ask the user for one. Read the full spec and, when present, `.context/GLOSSARY.md` and use its domain vocabulary. Ask only when the reference or required behavior is ambiguous.

Before editing each file, run this skill's `scripts/query-map.py <file>...` from the project root to find records listing that file or an ancestor directory, and read all matches, including their Constraints; continue if none exist. Inspect additional records as the scope changes. Records describe committed code, not planned work. Treat their Constraints as requirements alongside the spec, except for the specific rules explicitly replaced by the spec's confirmed Supersedes entries. If the work would break any other constraint, stop and ask the user. Check relevant records' `since` commits and covered paths against Git history and the code; report stale records, disagreements with code, or conflicting records rather than silently choosing between them. Leave map records untouched until the code is committed.

Record the current branch, starting commit, and existing working-tree changes. Keep unrelated user changes intact and outside the implementation commit. The starting commit is the review baseline.

**Done:** the scope, acceptance criteria, test seams, and baseline are known.

## 2. Implement and verify

Use test-driven development where possible at agreed seams, honoring any confirmation already given. Run relevant single test files and typechecking during development, then the full applicable test suite at the end. Record actual results and any unavailable checks.

**Done:** the requested behavior and acceptance criteria are implemented and applicable checks pass, or an unresolved limitation is explicitly reported.

## 3. Review and commit

Review the changes against the starting commit and the spec, including project standards and acceptance criteria. Include staged, unstaged, and relevant new files in the review. Fix findings within scope and rerun the affected checks.

Commit only this work to the current branch after review and verification. Ensure the actual staged content matches the reviewed and tested implementation; reconcile partially staged edits before committing. Report the commit and verification evidence instead of editing the spec.

If the change added behavior with rules, set a boundary, reshaped modules, or revealed an unenforced rule, report the decisions and committed files for a subsequent map update. Keep the issue as the source of Constraints and Supersedes; propose cleanup separately rather than removing it automatically. In a shared-worktree run, return proposed shared-document changes to the coordinator instead of writing them.

**Done:** the scoped implementation is reviewed and committed, and remaining limitations are reported.
