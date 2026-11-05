# Dev Skills

These skills make up a development workflow. It takes an idea through research, design, spec, tickets, implementation, review, and architecture records. All project state lives in a local, untracked `.desk/` workspace, so specs and notes never enter Git history.

Install the whole group with `skm add @dev`, or pick individual skills by name.

## Workflow

```text
                       /setup-desk  (once per clone)
                              │
                              ▼
 /check-arch ─► /research ─► grill-me / /grill-with-docs ─► /to-spec ─► /to-tickets
 (stale?)       report.md     (+ domain-modeling)            spec.md     tickets/NN-*.md
                                                             +Supersedes      │
                     ┌────────────────────────────────────────────────────────┤
                     ▼                                                        ▼
                /implement                                             /implement-spec
          (current branch, one commit)                       (integration branch, parallel worktrees)
                     │           uses tdd · code-review · guidelines          │
                     └──────────────────────────┬─────────────────────────────┘
                                                ▼
                                          /update-arch
                              (rewrite records from committed code)
```

Other entry points:

- **Bug:** `diagnosing-bugs` (feedback loop → reproduce → hypotheses → instrument → fix + regression test → cleanup) → `/update-arch` when the fix revealed a rule.
- **Design question:** `codebase-design` for deep-module vocabulary, plus `/show-me` for diagrams.
- **Pause:** `/handoff` writes `.desk/handoffs/<session>.md` so a fresh agent can pick up the work.

### Stages

1. **Set up.** `/setup-desk` creates `.desk/AGENTS.md` from `setup-desk/WORKSPACE.md` and adds `/.desk` to Git's `info/exclude`. It creates nothing else; each other `.desk` file is created by the skill that owns it. It never touches the project's own `AGENTS.md` or `CLAUDE.md`.
2. **Research** (optional). `/research` takes a feature and reference projects, which it checks out under `.desk/references/<project>/`. It reconstructs the design from first principles and grounds every step in cited reference code: the feature's position, inputs, outputs, considerations, and the reasons for its shape. It ends with suggestions for this project. The report goes to `.desk/research/<topic>/report.md`.
3. **Clarify.** `grill-me` asks rounds of numbered questions with recommended answers until every branch of the design tree is settled. `/grill-with-docs` adds `domain-modeling`, which records resolved terms in `.desk/CONTEXT.md` as they come up. Given a research report, it starts from the report's open questions.
4. **Specify.** `/to-spec` turns the conversation into `.desk/features/<slug>/spec.md` without interviewing again. It collects every stated rule into **Constraints**, and every arch rule the work deliberately changes into **Supersedes**.
5. **Slice.** `/to-tickets` splits the work into tracer-bullet vertical slices. Each slice is a ticket file with `Status`, `Blocked by`, acceptance criteria, and constraints. The user approves the breakdown, and the dependency graph is checked for cycles.
6. **Implement.**
   - `/implement` handles focused work: TDD, `code-review` against the starting commit, then one commit on the current branch.
   - `/implement-spec` delivers the whole ticket graph. It schedules the frontier into per-ticket worktrees, then a coordinator merges, verifies, and reviews against the pinned base. It ends on a local integration branch.
7. **Record.** `/update-arch` rewrites `.desk/architecture/<slug>.md` from what was actually committed, applying the spec's Supersedes list, and validates the record. `/check-arch` finds records that drifted after other people's commits.

## Skills

| Skill | Invoked by | Purpose | Output |
| --- | --- | --- | --- |
| `setup-desk` | user | Initialize the `.desk/` workspace | `.desk/AGENTS.md`, Git exclusion |
| `research` | user | Explain how reference projects implement a feature; suggest a fit | `.desk/research/<topic>/report.md`, `.desk/references/<project>/` |
| `grill-me` | model/user | Interview until decisions are settled | Confirmed decisions in the conversation |
| `grill-with-docs` | user | `grill-me` + `domain-modeling` | Decisions plus `.desk/CONTEXT.md` terms |
| `domain-modeling` | model | Challenge and record domain language | `.desk/CONTEXT.md`, confirmed constraints |
| `to-spec` | user | Turn the conversation into a spec | `.desk/features/<slug>/spec.md` |
| `to-tickets` | user | Split work into dependent vertical slices | `.desk/features/<slug>/tickets/NN-*.md` |
| `implement` | user | Implement, review, and commit focused work | One reviewed commit on the current branch |
| `implement-spec` | user | Deliver the full ticket graph in parallel | Verified local integration branch |
| `tdd` | model | Red → green loop at agreed seams | Tests and code in project directories |
| `code-review` | model | Two parallel axes: Standards (plus a Fowler smell baseline) and Spec | `## Standards` / `## Spec` findings |
| `codebase-design` | model | Deep-module vocabulary (module, interface, seam, depth) | Design guidance |
| `diagnosing-bugs` | model | Six-phase diagnosis for hard bugs and perf regressions | Fix, regression test, clean tree |
| `guidelines` | model | Stay in scope; follow arch record constraints | Behavioral guardrails |
| `check-arch` | user | Find stale arch records | Staleness report and suggested actions |
| `update-arch` | user | Write or refresh arch records after commits; bootstrap them for existing code | Updated `.desk/architecture/*.md` |
| `handoff` | user | Save context so another session can resume | `.desk/handoffs/<session>.md` |
| `show-me` | user | Explain with the smallest visual that works | Inline diagram or HTML in `$TMPDIR/desk-reports/` |

"user" means `disable-model-invocation: true`: the skill runs only when the user calls it explicitly (`/name`).

## Workspace

```text
.desk/                         # untracked; excluded via .git/info/exclude
├── AGENTS.md                  # project-local conventions (from WORKSPACE.md)
├── CONTEXT.md                 # domain glossary, lasting, no implementation detail
├── architecture/<slug>.md     # architecture records of committed code, lasting
├── features/<slug>/           # work in progress, removed at close-out
│   ├── spec.md
│   └── tickets/NN-<slug>.md
├── handoffs/<session>.md      # kept until deleted
├── references/<project>/      # unmodified reference checkouts, kept until deleted
└── research/<topic>/          # research reports and diagrams, kept until deleted
```

Subdirectory names are unabbreviated. Each file type has one owner skill that creates it and defines its format; the table is under "Files" in `setup-desk/WORKSPACE.md`.

Temporary debug artifacts go to `${TMPDIR:-/tmp}/desk-debug/<bug>/`, and HTML visuals go to `${TMPDIR:-/tmp}/desk-reports/`. Permanent tests and fixtures always go in the project's normal source tree. Reference projects live in `.desk/references/`, are read-only, and are excluded from Git with the rest of the workspace.

## Arch records

An arch record keeps the rules a future agent could break when editing the same files. Each record has YAML front matter (`type`, `files`, `since`) and the sections **Feature**, **Constraints**, and **Architecture**, in under 60 lines. The format is defined in `update-arch/scripts/ARCH-FORMAT.md`.

A record describes **committed code as of `since:`**, never a plan. Records are binding by default, and changing one follows three steps:

1. **Plan.** The spec lists the rules the work will change under **Supersedes**, each confirmed by the user. Records stay untouched.
2. **Build.** Agents follow every record Constraint except those named in Supersedes. An unplanned conflict stops the work and goes to the user.
3. **Record.** After the commit, `/update-arch` rewrites the records from what was actually built.

So records never describe code that doesn't exist yet. During the in-between period, the spec states exactly which rules no longer apply. Drift caused by other commits is caught by comparing `since:` with `git log`. Full rules, including precedence, are under "Using arch records" in `setup-desk/WORKSPACE.md`.

## Parallel runs

In `/implement-spec`, each ticket worker gets its own branch and worktree, with a `.desk` symlink back to the owner workspace. Workers read shared files but only return proposed changes. The coordinator alone writes shared records, merges into the integration branch one at a time, and advances ticket states after verification. The procedure is under "Shared worktrees" in `setup-desk/WORKSPACE.md`.

## Origin

Several skills are adapted from Matt Pocock's skills (see `upstream/`). `research` adapts the first-principles method of `skills/teach/teach` to reference code. The arch record skills (`check-arch`, `update-arch`, `guidelines`) and the `.desk/` workspace are specific to this project.
