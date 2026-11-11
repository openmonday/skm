# Skills

This directory is SKM's default skill root. Skills are discovered recursively by `SKILL.md`; their directory basenames are their short names. `groups.json` defines the `dev`, `teach`, `meta`, and `misc` groups. A skill can belong to multiple groups: `show-me` lives in `dev/` and is also included in `teach`. See the [SKM README](../README.md) for discovery and commands.

## Development

Install with `skm add @dev` or select individual skills, such as `skm add setup-context grill-me implement`. Run `/setup-context` in the target project to initialize the local workspace. The setup script normally excludes `.context/` using Git's `info/exclude`; already tracked files remain tracked. Existing content and legacy directories are preserved.

| Skill | Purpose |
| --- | --- |
| `setup-context` | Initialize the context workspace |
| `research` | Investigate a topic using relevant code and reference material |
| `grill-me` | Clarify requirements and discuss relevant code and map constraints |
| `to-spec` | Turn the discussion into an issue specification |
| `to-tasks` | Break work into actionable tasks |
| `implement` | Implement focused work |
| `implement-tasks` | Implement a task plan, potentially with parallel workers |
| `draw-map` | Audit and, with approval, update current-code map records |
| `show-me` | Explain an idea with a focused visual |
| `wait-what` | Re-explain an idea that was unclear |

A possible workflow is `/research` → `/grill-me` → `/to-spec` → `/to-tasks` → `/implement-tasks` → `/draw-map`. Use `/implement` for focused work; consult each skill for prerequisites and verification.

```text
.context/
├── GLOSSARY.md          # when present
├── map/                 # current code, behavior, and constraints
├── issues/<issue-slug>/ # spec.md, tasks, and research as needed
└── reference/           # reference code and libraries
```

## Teach

Install with `skm add @teach`. `teach` creates lessons, `learn-by-doing` offers exercises, `anatomy` draws technical ideas, and `show-me` creates focused visuals.

## Meta

Install with `skm add @meta`. `extract-skills` captures reusable workflows, `find-skills` discovers skills, `skill-creator` develops and evaluates them, and `writing-for-agents` guides agent-facing instructions.

## Misc

Install with `skm add @misc`. `optimizing-cli` improves human-facing CLI output while preserving scripting interfaces.
