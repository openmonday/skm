---
name: implement
description: Implement a spec or local tickets, review the changes, and commit to the current branch.
disable-model-invocation: true
---

# Implement

Implement the work described by the user's spec or tickets.

## 1. Establish scope

Read `.assist/AGENTS.md`; if missing, ask the user to run `/setup-assist`. Resolve local references using its conventions and state the ticket title before starting. Read the full source spec and `.assist/CONTEXT.md`. Find the arch records for the files and directories you will change, following "Finding arch records" in `.assist/AGENTS.md`, and treat their Constraints as requirements alongside the spec's. Ask only when the reference or required behavior is ambiguous.

Record the current branch, starting commit, and existing working-tree changes. Keep unrelated user changes intact and outside the implementation commit. The starting commit is the fixed point passed to `code-review`.

When implementing tickets, claim each one before starting it and respect its blockers. In a shared-worktree run, return state updates to the coordinator instead of writing shared files.

**Done:** the scope, acceptance criteria, test seams, baseline, and ticket ownership are known.

## 2. Implement and verify

Use `tdd` where possible at pre-agreed seams, honoring any confirmation already given. Run relevant single test files and typechecking during development, then the full applicable test suite at the end. Record actual results and any unavailable checks.

**Done:** the requested behavior and acceptance criteria are implemented and applicable checks pass, or an unresolved limitation is explicitly reported.

## 3. Review and commit

Invoke `code-review` with the starting commit and explicit spec/ticket paths. Include staged, unstaged, and relevant new files in the review. Fix findings within scope and rerun the affected checks.

Commit only this work to the current branch after review and verification. Ensure the actual staged content matches the reviewed and tested implementation; reconcile partially staged edits before committing. When this commit completes the feature's last ticket, write its arch record first, from the spec's Constraints adjusted for what was actually built, then set the arch record's `since:` to the new commit hash and remove the feature folder once everything is verified. Skip the arch record when the change does not qualify. Record the commit and verification evidence in the supplied spec or tickets, completing tickets according to `.assist/AGENTS.md`. In a worktree run, the coordinator completes them and writes the arch record only after integration; return the branch, commit, check results, and proposed shared-document changes.

**Done:** the scoped implementation is reviewed and committed, ticket state reflects the actual integration status, the record is written when one is due, and remaining limitations are reported.
