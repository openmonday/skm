# Skills

Local development, learning, and productivity skills, including workflows adapted from Matt Pocock's skills. The upstream snapshot under `upstream/` is reference material. The editable skills in this directory define the workflows.

This directory is SKM's default skill root. `dev/` contains 18 skills, `teach/` contains 5, and `meta/` contains 4. `groups.json` defines the groups (`dev`, `teach`, `meta`). See the [SKM README](../README.md) for discovery, group configuration, and command behavior.

## Start a project

Install the skills you need, including `setup-desk`:

```sh
skm add @dev
# Or select individual skills
skm add setup-desk implement handoff
```

Then run `/setup-desk` once in the target project. It writes `.desk/AGENTS.md` and excludes `/.desk` through Git's shared `info/exclude`. Installed dev skills read these local instructions when invoked. Setup leaves the project-level `AGENTS.md` and `CLAUDE.md` unchanged.

Setup uses fixed local defaults and preserves existing content on reruns. It asks only when existing data creates a conflict. Domain docs, research reports, and feature files are created when needed. Each clone needs its own setup, because `.desk` files are untracked.

## Dev workflow

| Skill | Purpose | Local result |
| --- | --- | --- |
| `research` | Explain how reference projects implement a feature, then map it onto this project | `.desk/research/<topic>/report.md` |
| `grill-me` | Clarify and stress-test decisions | Confirmed decisions in the conversation |
| `grill-with-docs` | Combine the interview with domain modeling | Resolved terms in `.desk/CONTEXT.md` |
| `domain-modeling` | Resolve domain terms and confirm rules | Glossary entries and one-line constraints |
| `to-spec` | Synthesize the discussed requirements | A feature spec with Constraints and Supersedes |
| `to-tickets` | Split a spec, plan, or conversation into verifiable slices | One file per ticket with dependencies |
| `implement` | Complete a focused piece of work | Reviewed commit on the current branch |
| `implement-spec` | Complete the ticket graph, optionally in parallel | Verified local integration branch |
| `tdd` | Build one tested behavior at a time | Tests and implementation in project source directories |
| `diagnosing-bugs` | Reproduce, isolate, diagnose, and fix a bug | Verified fix and appropriate regression coverage |
| `code-review` | Check standards and requirements separately | Findings covering committed and working-tree changes |
| `check-arch` / `update-arch` | Find stale arch records / record rules after commits | `.desk/arch/<slug>.md` |
| `handoff` | Preserve enough context to resume | A local handoff |
| `show-me` | Explain with a focused visual | Inline visual or temporary HTML report |

A common sequence is `/research` → `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement-spec` → `/update-arch`. Use `/grill-me` for an interview without domain-document updates. For focused work, use `/implement`. For a difficult failure, use `diagnosing-bugs`. See [dev/README.md](dev/README.md) for the full flow.

Model-invoked skills such as `domain-modeling`, `tdd`, and `code-review` can support a larger workflow. User-invoked skills remain explicit entry points.

## Teach

`teach` reconstructs a concept from a practical problem and writes lessons to `.lesson/<topic>/`. `wait-what` re-explains the last message that didn't land, `learn-by-doing` offers exercises after architectural work, `anatomy` draws technical ideas as isometric figures, and `show-me` (shared with `dev`) draws focused visuals. Install them with `skm add @teach`.

## Meta

`extract-skills` reviews a conversation's corrections, failed attempts, and verified workflows, then creates or updates reusable skills with checks that prevent the same rework. Invoke it explicitly at the end of a session or after a useful portion of work. For example: “Use extract-skills to review this session, especially my corrections, and save the reusable workflow.” It works from the available history, reports gaps, and follows the established skill source layout.

`find-skills` helps discover and install skills from the open agent skills ecosystem. `skill-creator` creates, revises, and evaluates reusable agent skills with portable instructions and optional supporting resources. `writing-for-agents` guides writing skills and `AGENTS.md` files. Install them with `skm add @meta`.

## Local workspace

The template [dev/setup-desk/WORKSPACE.md](dev/setup-desk/WORKSPACE.md) becomes the project's `.desk/AGENTS.md`. That generated file is the authoritative source for paths, ticket states, dependencies, language, worktree sharing, and how arch records are applied. Customize project conventions there.

```text
.desk/
├── AGENTS.md
├── CONTEXT.md
├── arch/<slug>.md
├── research/<topic>/report.md
├── features/<feature>/
│   ├── spec.md
│   └── tickets/<NN>-<ticket>.md
├── handoffs/
└── reports/
```

Debug captures go to `${TMPDIR:-/tmp}/desk-debug/`. Skill definitions and instruction or configuration files are in English. Teaching workspaces managed by `teach` keep their own structure and vocabulary.

## Parallel implementation

Each ticket worker has its own branch and worktree. The coordinator creates a `.desk` symlink in that worktree pointing to the owner workspace's actual directory, so all agents use the same project-relative paths. The shared Git exclusion ignores both the actual directory and these symlink entries. Only the coordinator changes shared records, and it advances ticket states after integration and verification.

Only project source, permanent tests, and required fixtures enter implementation commits. Specs and other `.desk` material stay out of Git history. The workspace has no version history or backup of its own. Platforms that cannot create directory symlinks use sequential implementation.

## Validation boundary

`setup-desk` and the other skills are instructions for agents, not deterministic installation scripts. Their completion criteria require checking actual paths, Git exclusion, dependencies, test results, and integration state during execution. Editing these skills does not initialize a project or run its implementation workflow.
