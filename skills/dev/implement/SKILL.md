---
name: implement
description: Implement one local issue on the current branch from its spec and module map, reading only the modules it changes, then review and commit.
disable-model-invocation: true
---

# Implement

Implement the issue at `.context/issues/<issue-slug>/` on the current branch as one commit. Ask which issue is meant if it is unclear. The issue holds `spec.md`, which follows [the spec format](references/SPEC.md), and `modules.md`, which follows [the module format](references/MODULES.md). `modules.md` names the **change set**, the modules this issue edits, and the **contracts** of the modules around it.

## 1. Establish scope

Read `spec.md`, `modules.md`, and `.context/GLOSSARY.md`. Stop and tell the user if `modules.md` is missing, if Status is `done` or `dropped`, or if any issue under `Blocked by:` is not `done`.

Record the current branch, the starting commit, and any uncommitted changes. The starting commit is the review base. Uncommitted changes that existed before the run stay out of the commit.

Check for drift with `git diff --stat <Base> HEAD -- <every path in modules.md>`. For a changed path outside the change set, read only the declarations its contract names, and correct the contract in `modules.md`. If the drift changes what the spec asks for, stop and ask the user. Then set the spec's `Status` to `in-progress`.

**Done:** the scenarios, change set, contracts, test seams, and review base are known.

## 2. Read narrowly

Read the change-set files and their tests. Use every other module through its contract in `modules.md`, without opening its code. Open a neighbor only when its contract is missing, ambiguous, or contradicted by a test or a run; read only the part in question, correct the contract, and note it for the report.

Run `scripts/query-map.py <file>...` from the project root for the change-set files and read every record it lists. Treat their Constraints and Architecture as requirements, except those the spec lists under Supersedes. If the work would break any other one, stop and ask the user. `.context/map/` describes committed code; leave it as is.

**Done:** the code to change is understood without reading modules outside the change set, or each exception is noted.

## 3. Build and verify

Edit only the change set. If the work needs a change in another module, stop and ask the user whether to add the module to this issue or leave the change to another issue.

Use test-driven development at the seams `modules.md` names under Tests. Run single test files and type checks while working, and the full test suite at the end.

**Done:** every scenario in the spec is met and the checks pass, or the remaining failure is reported.

## 4. Review and commit

Review the diff from the review base against the spec, the Interface changes in `modules.md`, and project standards, including new and staged files. Confirm it touches only the change set. Fix findings and rerun the affected checks. Commit only this work, and confirm the staged content is what you reviewed and tested. Then record the commit and the checks run, with their results, under the spec's `## Verification`, and set its `Status` to `done`.

**Done:** the work is committed and the spec's Status is `done`. Report the commit, the check results, the contracts you corrected, and any follow-up work the change revealed.
