# Dev Skills

These skills make up a development workflow. It takes an idea through research, design, spec, tasks, implementation, review, and architecture records. All project state lives in a local, untracked `.desk/` workspace, so specs and notes never enter Git history.

Install the whole group with `skm add @dev`, or pick individual skills by name.

## Workflow

```text
/setup-desk → /check-arch → /research → grill-me / /grill-with-docs → /to-spec
                                                                          │
                                     ┌────────────────────────────────────┴──────────────┐
                                     ▼                                                   ▼
                                /implement                                   /to-tasks → /implement-spec
                         (current branch, one commit)                    (integration branch, worktrees)
                                     └────────────────────────┬──────────────────────────┘
                                                              ▼
                                                        /update-arch
```

Choose the small-work path (`/to-spec` → `/implement`) or the large-work path (`/to-spec` → `/to-tasks` → `/implement-spec`). `/update-arch` follows either path only when the change warrants an arch record. Invoke skills manually as needed; `grill-with-docs` composes its interview and domain-modeling dependencies.

Other entry points:

- **Bug:** `diagnosing-bugs` (feedback loop → reproduce → hypotheses → instrument → fix + regression test → cleanup) → `/update-arch` when the fix revealed a rule.
- **Design question:** `codebase-design` for deep-module vocabulary, plus `/show-me` for diagrams.
- **Pause:** `/handoff` writes `.desk/handoffs/<session>.md` so a fresh agent can pick up the work.

### Stages

1. **Set up.** `/setup-desk` creates the workspace directories, `.desk/AGENTS.md`, and an empty `.desk/CONTEXT.md`, and adds `/.desk` to Git's `info/exclude`. Existing content is preserved. It never touches the project's own `AGENTS.md` or `CLAUDE.md`.
2. **Research** (optional). `/research` takes a feature and reference projects, which it checks out under `.desk/refs/<project>/`. It reconstructs the design from first principles and grounds every step in cited reference code: the feature's position, inputs, outputs, considerations, and the reasons for its shape. It ends with suggestions for this project. The report goes to `.desk/research/<topic>/report.md`.
3. **Clarify.** `grill-me` asks rounds of numbered questions with recommended answers until every branch of the design tree is settled. `/grill-with-docs` adds `domain-modeling`, which records resolved terms in `.desk/CONTEXT.md` as they come up. Given a research report, it starts from the report's open questions.
4. **Specify.** `/to-spec` turns the conversation into `.desk/specs/<slug>/spec.md` without interviewing again. It collects every stated rule into **Constraints**, and every arch rule the work deliberately changes into **Supersedes**.
5. **Slice large work.** `/to-tasks` splits the spec into tracer-bullet vertical slices. Each slice is a task file with `Status`, `Blocked by`, acceptance criteria, and constraints. The user approves the breakdown, and the dependency graph is checked for cycles. Skip this stage for small work.
6. **Implement.**
   - `/implement` handles a spec directly: test-driven development and a review against the starting commit, then one commit on the current branch.
   - `/implement-spec` delivers the spec and its task graph. It schedules the frontier into per-task worktrees, then a coordinator merges, verifies, and reviews against the pinned base. It ends on a local integration branch.
7. **Record.** `/update-arch` rewrites `.desk/arch/<slug>.md` from what was actually committed, applying the spec's Supersedes list, and validates the record. `/check-arch` finds records that drifted after other people's commits.

## Skills

| Skill | Invoked by | Purpose | Output |
| --- | --- | --- | --- |
| `setup-desk` | user | Initialize the `.desk/` workspace | workspace skeleton, Git exclusion |
| `research` | user | Explain how reference projects implement a feature; suggest a fit | `.desk/research/<topic>/report.md`, `.desk/refs/<project>/` |
| `grill-me` | user/composition | Interview until decisions are settled | Confirmed decisions in the conversation |
| `grill-with-docs` | user | `grill-me` + `domain-modeling` | Decisions plus `.desk/CONTEXT.md` terms |
| `domain-modeling` | user/composition | Challenge and record domain language | `.desk/CONTEXT.md`, confirmed constraints |
| `to-spec` | user | Turn the conversation into a spec | `.desk/specs/<slug>/spec.md` |
| `to-tasks` | user | Split work into dependent vertical slices | `.desk/specs/<slug>/tasks/*.md` |
| `implement` | user | Implement, review, and commit focused work | One reviewed commit on the current branch |
| `implement-spec` | user | Deliver the full task graph in parallel | Verified local integration branch |
| `tdd` | user | Red → green loop at agreed seams | Tests and code in project directories |
| `code-review` | user | Two parallel axes: Standards (plus a Fowler smell baseline) and Spec | `## Standards` / `## Spec` findings |
| `codebase-design` | user | Deep-module vocabulary (module, interface, seam, depth) | Design guidance |
| `diagnosing-bugs` | user | Six-phase diagnosis for hard bugs and perf regressions | Fix, regression test, clean tree |
| `guidelines` | user | Stay in scope; follow arch record constraints | Behavioral guardrails |
| `check-arch` | user | Find stale arch records | Staleness report and suggested actions |
| `update-arch` | user | Write or refresh arch records after commits; bootstrap them for existing code | Updated `.desk/arch/*.md` |
| `handoff` | user | Save context so another session can resume | `.desk/handoffs/<session>.md` |
| `show-me` | user | Explain with the smallest visual that works | Inline diagram or visual artifacts in `.show-me/` |

Skills marked "user" disable implicit invocation. The two composition dependencies remain model-invocable for `grill-with-docs`.

## Workspace

```text
.desk/                         # untracked; excluded via .git/info/exclude
├── AGENTS.md                  # project-wide rules
├── CONTEXT.md                 # domain glossary, lasting, no implementation detail
├── arch/<slug>.md             # architecture records of committed code, lasting
├── specs/<slug>/              # work in progress, removed at close-out
│   ├── spec.md
│   └── tasks/<slug>.md
├── handoffs/<session>.md      # kept until deleted
├── refs/<project>/            # unmodified reference checkouts or links to local checkouts, kept until deleted
└── research/<topic>/          # research reports and diagrams, kept until deleted
```

Use concise, conventional names. Use plural nouns for collections and mass nouns for subject areas; widely understood abbreviations are allowed. Each file type has one owner skill that defines its format; other skills update shared task fields, `/implement-spec` records run metadata in the spec, and implementation and arch skills perform close-out.

Temporary debug artifacts go to `${TMPDIR:-/tmp}/desk-debug/<bug>/`, and generated visuals go to `.show-me/` in the project or workspace unless the user chooses another location. Permanent tests and fixtures always go in the project's normal source tree. Reference projects live in `.desk/refs/`, are read-only, and are excluded from Git with the rest of the workspace.

## Arch records

An arch record keeps the rules a future agent could break when editing the same files. Each record has YAML front matter (`type`, `files`, `since`) and the sections **Feature**, **Constraints**, and **Architecture**, in under 60 lines. The format is defined in `update-arch/scripts/ARCH-FORMAT.md`.

A record describes **committed code as of `since:`**, never a plan. Records are binding by default, and changing one follows three steps:

1. **Plan.** The spec lists the rules the work will change under **Supersedes**, each confirmed by the user. Records stay untouched.
2. **Build.** Agents follow every record Constraint except those named in Supersedes. An unplanned conflict stops the work and goes to the user.
3. **Record.** After the commit, `/update-arch` rewrites the records from what was actually built.

So records never describe code that doesn't exist yet. During the in-between period, the spec states exactly which rules no longer apply. Drift caused by other commits is caught by comparing `since:` with `git log`. Full rules, including precedence, are in `guidelines`.

## Parallel runs

In `/implement-spec`, each task worker gets its own branch and worktree, with a `.desk` symlink back to the owner workspace. Workers read shared files but only return proposed changes. The coordinator alone writes shared records, merges into the integration branch one at a time, and advances task states after verification. The procedure is in `implement-spec/WORKTREES.md`.

## Origin

Several skills are adapted from Matt Pocock's skills (see `upstream/`). `research` adapts the first-principles method of `skills/teach/teach` to reference code. The arch record skills (`check-arch`, `update-arch`, `guidelines`) and the `.desk/` workspace are specific to this project.
