# Desk Instructions

Project-local conventions for the dev skills. Installed Desk skills load this file explicitly when invoked. Paths below resolve from the project root, including when `.desk` is a symlink in a linked worktree. Read this file before researching, planning, implementing, debugging, reviewing, or changing the domain model.

## Files

Create files when there is content to record:

```text
.desk/
├── AGENTS.md                      # these conventions and the project-wide rules
├── CONTEXT.md                     # domain terms (lasting)
├── arch/                          # architecture records (lasting)
│   └── <descriptive-slug>.md
├── research/                      # research reports (lasting until the user deletes them)
│   └── <topic-slug>/
│       ├── report.md
│       └── <diagrams>
├── features/                      # work in progress (removed at close-out)
│   └── <feature-slug>/
│       ├── spec.md
│       └── tickets/
│           ├── 01-<ticket-slug>.md
│           └── 02-<ticket-slug>.md
├── handoffs/                      # session handoffs (manual cleanup)
│   └── <session-slug>.md
└── reports/                       # HTML reports (manual cleanup)
    └── <description>.html
```

Temporary debug artifacts go to `${TMPDIR:-/tmp}/desk-debug/<bug-slug>/` and disposable HTML visuals go to `${TMPDIR:-/tmp}/desk-reports/`. Permanent tests and fixtures go in the project's normal source tree, never in `.desk/`.

Slugs are lowercase, hyphen-separated, and describe the topic (`payment-retry`, not `feature-2`).

## Language

Write `.desk` documents in English unless the project-wide rules below say otherwise. Keep identifiers, paths, commands, and quoted code exact.

## Tickets

Each ticket is one file, `features/<feature-slug>/tickets/<NN>-<ticket-slug>.md`. Number tickets with two digits in creation order within the feature. Never reuse or renumber a number, even after a ticket is dropped.

The `Status:` line holds one of:

| Status | Meaning |
| --- | --- |
| `pending` | Not started, or reopened |
| `in-progress (<owner>)` | Claimed. `<owner>` is the ticket branch, or `main` for work in the owner workspace |
| `done` | Acceptance criteria verified and the commit is on the target branch (the integration branch in `/implement-spec`) |
| `dropped` | Removed from the plan with the user's approval; give the reason under Verification |

- **Claim before work.** Set `in-progress (<owner>)` before editing code. Never take a ticket that someone else has claimed.
- **Reopen explicitly.** Set a `done` ticket back to `pending` and note why under Verification. Never edit completed evidence away.
- **Verification** lists the commits and the checks actually run, with their results.

`Blocked by:` is `None` or a comma-separated list of ticket numbers in the same feature (`01, 03`). A ticket is ready when every blocker is `done`. The set of ready tickets is the **frontier**. The graph must have no cycles and no references to missing tickets.

## Ownership

One agent, the **coordinator**, owns every shared `.desk` file during a run: `CONTEXT.md`, `arch/`, `research/`, specs, tickets, and handoffs. Subagents and ticket workers may read them, but they return proposed changes as text, and the coordinator applies them. In a single-agent session, that agent is the coordinator.

## Shared worktrees

`/implement-spec` gives each ticket its own branch and worktree. The coordinator prepares each one:

1. Create it from the current integration tip, outside the project directory:
   ```bash
   git worktree add "../<repo>.worktrees/<feature-slug>-<NN>" -b "<feature-slug>-<NN>-<ticket-slug>" <integration-tip>
   ```
   Name the integration branch `<feature-slug>`. Ticket branches use hyphens, not `/`, because Git cannot hold both `<feature-slug>` and `<feature-slug>/...` as branch names.
2. Link the owner's real workspace, resolving any existing symlink first:
   ```bash
   DESK="$(cd .desk && pwd -P)"
   ln -s "$DESK" "../<repo>.worktrees/<feature-slug>-<NN>/.desk"
   ```
3. Verify: `.desk/AGENTS.md` is readable from the worktree, `git -C <worktree> check-ignore -q .desk` succeeds, and `git -C <worktree> status --short` is empty.
4. To clean up after the ticket is integrated, remove the link first (`rm <worktree>/.desk`, with no trailing slash and never `-r`), then run `git worktree remove <worktree>` and `git branch -d <ticket-branch>`.

If directory symlinks or worktrees are unavailable, work through the tickets sequentially in the owner workspace.

## Finding arch records

Before editing, planning, or reviewing files, find the arch records that list them. Run this from the project root:

```bash
scripts/find-arch.sh path/to/file path/to/dir/ [...]   # ships with check-arch, update-arch, guidelines
grep -l -e '- path/to/file' .desk/arch/*.md             # fallback without the helper
```

A directory argument matches records that list files inside it. If nothing matches or `.desk/arch/` is absent, continue silently. A renamed file may be listed under its old path, so use `git log --follow` to trace it.

## Using arch records

An arch record describes the **committed code as of its `since:` commit**: what was built and which rules future changes must keep. Records do not describe plans. Apply them as follows.

**Precedence**, when sources disagree:

1. The user's explicit instruction in the current session.
2. Entries in the active spec's **Supersedes** list, which the user confirmed.
3. Arch record Constraints. Between two records, the newer `since:` wins.
4. What the code appears to do.

**Default: binding.** Treat every Constraint as a requirement. If a change would break one that the spec does not supersede, stop and ask the user. If they approve, add the entry to the spec's Supersedes list before continuing. A constraint can change, but never by accident.

**Check drift before relying on a record.** Run `git log --oneline <since>..HEAD -- <listed files>`. If any commits appear, the record may be stale: check each Constraint you depend on against the current code. When code and record disagree, report it to the user and don't silently follow either one. `/check-arch` reports drift across the project.

**Change records only after the code lands.** Never edit `arch/` to describe planned work. If the plan is abandoned, a record written in advance would describe code that doesn't exist. Planned changes live in the spec's Supersedes list. During implementation they replace only the rules they name, and every other Constraint stays binding. After the commit, `/update-arch` rewrites the record from what was actually built.

## Project-wide rules

Rules that apply to the whole project rather than to specific files. Add them here as one line each: the rule, then the reason.
