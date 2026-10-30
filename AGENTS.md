# AGENTS.md

## Project purpose

This project manages reusable agent skills. It collects reference skills, adapts other people's skills into project-owned versions, and organizes the resulting skills for use by general-purpose agents.

## Directory responsibilities

- `upstream/` contains upstream or reference skills. Treat this directory as read-only.
- `skills/` contains project-owned skills and all customized copies intended for use by agents.
- `scripts/` contains project automation and maintenance utilities.
- `src/` and `test/` contain project code and its tests.

## Skill customization rules

- Never modify a skill directly under `upstream/`.
- When a reference skill needs to be changed, copy its complete directory into the appropriate location under `skills/` first, then modify the copy.
- Preserve the reference skill's structure and supporting files unless the customization explicitly requires a change.
- Keep the original skill available for comparison and future updates.
- When adapting a skill for general-purpose agents, remove tool- or platform-specific metadata that does not apply, and keep the skill's invocation behavior explicit.
- Keep each customized skill self-contained and ensure its `SKILL.md` accurately describes the customized behavior.

## Change workflow

1. Inspect the reference skill and its supporting files.
2. Copy the complete skill directory from `upstream/` to the target location under `skills/`.
3. Make all customizations only in the copied directory.
4. Verify that the reference directory has not changed.
5. Check the customized `SKILL.md` and run relevant tests or validation scripts.

## General conventions

- Use English for project documentation and agent instructions unless a skill explicitly targets another language.
- Follow existing project patterns before introducing new structure or dependencies.
- Keep changes focused on the requested skill adaptation or project maintenance task.
