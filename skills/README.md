# Assist Skills

Local engineering and productivity skills, including workflows adapted from Matt Pocock's skills. The upstream snapshot under `upstream/` is reference material; the editable skills in this directory define the Assist workflow.

This directory is SKM's default skill root: `engineering/` contains 15 skills, `productivity/` contains 6, and `groups.json` defines the groups. See the [SKM README](../README.md) for discovery, group configuration, and command behavior.

## Start a project

Install the skills you need, including `setup-assist`:

```sh
skm add @engineering @productivity
# Or select individual skills
skm add setup-assist implement handoff
```

Then run `/setup-assist` once in the target project. Setup writes `.desk/AGENTS.md` and excludes `/.desk` through Git's shared `info/exclude`. Installed Assist skills explicitly read the local instructions when invoked; setup leaves project-level `AGENTS.md` and `CLAUDE.md` unchanged.

Setup uses fixed local defaults and preserves existing content on reruns. It asks only when existing data creates a conflict. Domain docs and feature files are created when needed. A separate clone needs its own setup because Assist files are untracked.

## Workflow

| Skill | Purpose | Local result |
| --- | --- | --- |
| `grill-me` | Clarify and stress-test decisions | Confirmed decisions in the conversation |
| `grill-with-docs` | Combine the interview with domain modeling | Resolved terms and ADRs recorded during the conversation |
| `domain-modeling` | Resolve domain terms and significant decisions | Glossary and ADRs |
| `to-spec` | Synthesize the discussed requirements | A feature spec |
| `to-tickets` | Split a spec, plan, or conversation into verifiable slices | One file per ticket with dependencies |
| `implement` | Complete a focused piece of work | Reviewed commit on the current branch |
| `implement-spec` | Complete the ticket graph, optionally in parallel | Verified local integration branch |
| `tdd` | Build one tested behavior at a time | Tests and implementation in project source directories |
| `diagnosing-bugs` | Reproduce, isolate, diagnose, and fix a bug | Verified fix and appropriate regression coverage |
| `code-review` | Check standards and requirements separately | Findings covering committed and working-tree changes |
| `handoff` | Preserve enough context to resume | A local handoff |
| `show-me` | Explain with a focused visual | Inline visual or local HTML report |

A common sequence is `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement-spec`. Use `/grill-me` for an interview without domain-document updates. For focused work, use `/implement`; for a difficult failure, use `diagnosing-bugs`. `to-tickets` can also start from a clear plan or conversation and records a concise source spec for later implementation and review.

Model-invoked skills such as `domain-modeling`, `tdd`, and `code-review` can support a larger workflow. User-invoked skills remain explicit entry points.

## Productivity

`extract-skills` reviews a conversation's corrections, failed attempts, and verified workflows, then creates or updates reusable skills with checks that prevent the observed rework. Invoke it explicitly at the end of a session or after a useful portion of work. For example: “Use extract-skills to review this session, especially my corrections, and save the reusable workflow.” It uses the available history, reports gaps, and follows the established skill source layout. Install it with `skm add extract-skills` or as part of `@productivity`.

`find-skills` helps discover and install skills from the open agent skills ecosystem. Install it with `skm add find-skills` or as part of `@productivity`.

`skill-creator` creates, revises, and evaluates reusable agent skills with portable instructions and optional supporting resources. It follows the requested destination and target environment's conventions without assuming a particular agent platform. Install it with `skm add skill-creator` or as part of `@productivity`.

## Local workspace

The template [engineering/setup-assist/WORKSPACE.md](engineering/setup-assist/WORKSPACE.md) becomes the project's `.desk/AGENTS.md`. That generated file is the authoritative source for paths, ticket states, dependencies, language, and worktree sharing. Customize project conventions there.

```text
.desk/
├── AGENTS.md
├── GLOSSARY.md
├── adr/
├── features/<feature>/
│   ├── spec.md
│   └── issues/<NN>-<ticket>.md
├── handoffs/
├── debug/<bug>/
└── reports/
```

Skill definitions and instruction/configuration files are English. Teaching workspaces managed by `teach` keep their separate structure and vocabulary.

## Parallel implementation

Each ticket worker has its own branch and worktree. The coordinator creates a `.desk` symlink in that worktree to the owner workspace's actual directory, so all agents use the same project-relative paths. The shared Git exclusion ignores both the actual directory and these symlink entries. The coordinator alone changes shared records and advances task states after integration and verification.

Only project source, permanent tests, and required fixtures enter implementation commits. Specs and other Assist material remain outside Git history. Assist does not provide version history or backup of its local documents. Platforms unable to create directory symlinks use sequential implementation.

## Validation boundary

`setup-assist` and the other skills are instructions for agents, rather than deterministic installation scripts. Their completion criteria require checking actual paths, Git exclusion, dependencies, test results, and integration state during execution. Editing these skills does not initialize a project or run its implementation workflow.
