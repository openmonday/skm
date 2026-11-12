---
name: implement
description: Implement a local spec on the current branch, review it, and commit.
disable-model-invocation: true
---

# Implement

Implement the spec at `.context/issues/<issue-slug>/spec.md` on the current branch. Ask which issue is meant if it is unclear. If the issue has a `tasks/` folder, stop: this skill implements a spec as one unit and does not track task state.

## 1. Establish scope

Read the spec and `.context/GLOSSARY.md`. Record the current branch, the starting commit, and any uncommitted changes. The starting commit is the review base. Uncommitted changes that existed before the run stay out of the commit.

Before editing a file, run `scripts/query-map.py <file>...` from the project root and read every record it lists. Treat their Constraints and Architecture as requirements, except those the spec lists under Supersedes. If the work would break any other one, stop and ask the user. `.context/map/` describes committed code; leave it as is.

**Done:** the acceptance criteria, test seams, and review base are known.

## 2. Build and verify

Use test-driven development at the agreed seams. Run single test files and type checks while working, and the full test suite at the end.

**Done:** every acceptance criterion is met and the checks pass, or the remaining failure is reported.

## 3. Review and commit

Review the diff from the review base against the spec and project standards, including new and staged files. Fix findings and rerun the affected checks. Commit only this work, and confirm the staged content is what you reviewed and tested.

**Done:** the work is committed. Report the commit and check results.
