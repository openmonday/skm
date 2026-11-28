---
name: draw-map
description: Bring the project map in line with committed code, covering every file, fixing module file format, updating `since`, and logging violations.
disable-model-invocation: true
---

# Reconcile the project map

Module files live under `.context/map/` and follow [the module file format](references/MODULE-FILES.md). The run is done when all three checks in `scripts/` print ✔:

- `check-format.py`: every module file is well-formed.
- `check-coverage.py`: every non-ignored file is covered by a module file.
- `check-expired.py`: every module file's `since` is the newest commit touching any of its covered files.

Run them from the project root. Each finding says what is wrong and how to fix it.

## Steps

1. Run `check-format.py` and fix every module file it lists. The other checks skip invalid module files.
2. Run `check-coverage.py`. Add each uncovered file to the module file whose responsibility fits it, or create a module file. Split a module file that has outgrown one responsibility. Derive a new module file's Constraints from the code and mark them as inferred.
3. Run `check-expired.py`. For each expired module file, read the `review` command's changes and compare each one with the module file:
   - The change agrees with Constraints and Architecture: update Feature, Architecture, and `files` to match the code.
   - The change breaks a Constraint or Architecture statement: ask the user whether the code or the module file is wrong.
     - The code is wrong: keep the statement and add `- <commit> <path>: <what the code does>; breaks "<statement>".` under `## Violations`.
     - The module file is outdated: rewrite or remove the statement, and remove any Violations line that cites it.
   - The code complies again with a statement listed under Violations: remove that line.

   Then set `since` to the expected hash.
4. Rerun all three checks until each prints ✔.

## Report

List the files newly covered, module files created or split, inferred Constraints for the user to review, Violations added or removed, and uncommitted covered files.
