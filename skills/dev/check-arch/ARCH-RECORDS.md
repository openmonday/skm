# Arch record discovery and compliance

Before editing a file, find its arch records (see Finding arch records below). A record describes the committed code as of its `since:` commit, not a plan. Treat its Constraints as requirements, with these rules:

- **Precedence:** the user's explicit instruction, then the active spec's Supersedes list, then arch record Constraints, then what the code appears to do.
- **Unplanned conflict:** when a change would break a constraint that the spec does not supersede, stop and surface it to the user instead of silently overriding it. A constraint can be changed, but not accidentally.
- **Drift:** when the record's files have commits after `since:`, check the constraints you rely on against the code. Report disagreements; don't silently follow either side.
- **Timing:** never edit `.desk/arch/` to describe planned work. Records change after the code is committed.


## Finding arch records

Search `.desk/arch/*.md` for each file and its ancestor directories. A record can list either a file or a directory containing it; include every matching record.

- Read all matching arch records.
- Check drift: `git log --oneline <since>..HEAD -- <file>` shows what changed since a record was confirmed. Any commits mean the record may be stale.
- When two arch records disagree, the one with the newer `since:` wins.
- Silently continue when nothing is found or an arch record file is missing.
- A renamed file may be listed under its old path; `git log --follow` traces the rename if a direct match fails.

Arch records cover rules tied to code. Rules that apply to the whole project belong in the `.desk/AGENTS.md`.
