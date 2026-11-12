---
name: draw-map
description: Bring the project map in line with committed code, covering every file, fixing record format, updating `since`, and recording violations.
disable-model-invocation: true
---

# Reconcile the project map

Records live under `.context/map/` and follow [the record format](references/MAP-RECORDS.md). The run is done when all three checks in `scripts/` print ✔:

- `check-format.py`: every record is well-formed.
- `check-coverage.py`: every non-ignored file is covered by a record.
- `check-expired.py`: every record's `since` is the newest commit touching any of its covered files.

Run them from the project root. Each finding says what is wrong and how to fix it.

## Steps

1. Run `check-format.py` and fix every record it lists. The other checks skip invalid records.
2. Run `check-coverage.py`. Add each unrecorded file to the record whose responsibility fits it, or create a record. Split a record that has outgrown one responsibility. Derive a new record's Constraints from the code and mark them as inferred.
3. Run `check-expired.py`. For each expired record, read the `review` command's changes and compare each one with the record:
   - The change agrees with Constraints and Architecture: update Feature, Architecture, and `files` to match the code.
   - The change breaks a Constraint or Architecture statement: ask the user whether the code or the record is wrong.
     - The code is wrong: keep the statement and add `- <commit> <path>: <what the code does>; breaks "<statement>".` under `## Violations`.
     - The record is outdated: rewrite or remove the statement, and remove any Violations line that cites it.
   - The code complies again with a statement listed under Violations: remove that line.

   Then set `since` to the expected hash.
4. Rerun all three checks until each prints ✔.

## Report

List the files newly covered, records created or split, inferred Constraints for the user to review, Violations added or removed, and uncommitted covered files.
