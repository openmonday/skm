# Assist Instructions

Project-local conventions for engineering skills. Installed Assist skills load this file explicitly when invoked. Paths below resolve from the project root, including when `.assist` is a symlink in a linked worktree. Read this file before planning, implementing, debugging, reviewing, or changing the domain model.

## Files

Create files when there is content to record:

```text
.assist/
├── AGENTS.md                      # these conventions and the project-wide rules
├── CONTEXT.md                     # domain terms (lasting)
├── arch/                          # architecture records (lasting)
│   └── <descriptive-slug>.md
├── features/                      # work in progress (temporary)
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
