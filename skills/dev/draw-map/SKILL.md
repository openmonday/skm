---
name: draw-map
description: Audit all tracked-file map coverage, record format and commit freshness; propose and apply approved repairs.
disable-model-invocation: true
---

# Check and update the project map

Read [MAP-FORMAT.md](scripts/MAP-FORMAT.md) and [MAP-RECORDS.md](MAP-RECORDS.md). Run both bundled checks from the target Git project, resolving its path relative to this skill:

```bash
python3 /path/to/draw-map/scripts/check-coverage.py
python3 /path/to/draw-map/scripts/check-expired.py
```

Exit 0 means no deterministic findings, 1 means findings, and 2 means the check could not complete. Neither script edits anything. The coverage script reports format and unrecorded files; the freshness script reports expired records and identifies invalid records it skipped. Run both even if the first reports findings. They check all tracked files, including files in listed directories, without exclusions; each record's expected hash is calculated from every covered tracked file. Inspect Git status as well: working tree or index changes are not necessarily represented by HEAD history. Explain them rather than claiming the records capture uncommitted work.

## Workflow

1. Run both checks and inspect records, relevant committed code and Git history. Manually review semantic format requirements and whether existing descriptions, constraints, and architecture remain accurate. A valid-looking record is not proof of correctness. Check relevant issues in `.context/issues/` and their Supersedes where applicable.
2. Report **unrecorded**, **expired**, and **format non-compliance** separately, including empty categories. Explain invalid/unreachable hashes and files with no committed history. For each finding propose specific remedies and affected files. An unrecorded file requires valid coverage, potentially by adding it to an appropriate existing record or creating a cohesive new record. An expired record needs its `since` set to the reported latest commit; propose content changes too when needed, or a hash-only update if review shows the change is harmless. Explain semantic findings and any circular tracked-record problem. `setup-context` normally excludes `.context` from Git, but already tracked files remain tracked and must be covered.
3. **Wait for explicit user approval before editing anything**, including creating directories or records. Do not commit, change Git tracking, or alter project code without specific approval. In shared-worktree runs, return proposed edits to the coordinator rather than editing shared files.
4. Apply only approved repairs. Describe committed reality, organize records recursively in module subfolders, with small, cohesive responsibilities, preserve correct existing constraints, apply actual supersessions and remove contradictions. For bootstrapping, infer from code, identify inferred constraints and request user review. Do not claim uncommitted work is recorded. If a tracked file has no HEAD history, ask the user to commit it before completing its record. Recalculate hashes after any approved commits.
5. Run both checks again, repeat the semantic review, and report applied changes, remaining findings, and any inability to converge. Do not remove completed issues automatically; propose cleanup separately if appropriate.
