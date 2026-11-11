---
name: setup-context
description: Initialize a local project context workspace for current-code map records, feature and refactoring issues, and reference code. Use when explicitly asked to prepare the context workspace.
disable-model-invocation: true
---

# Setup Context

Run `scripts/setup-context.sh` from the target project directory, resolving the script path relative to this skill. Report the workspace location and any Git exclusion status. Preserve existing content and resolve any reported conflicts with the user.

Use `.context/GLOSSARY.md` for the project domain glossary, `.context/map/` for maintained records of current code, behavior, and constraints, `.context/issues/` for feature and refactoring issues, plans, and tasks, and `.context/reference/` for reference code and libraries. Do not invent project documentation or add reference code without the user's direction.

Existing legacy folders are left untouched; do not move, merge, or delete their contents without the user’s approval.
