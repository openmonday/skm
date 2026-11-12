# AGENTS.md

## Project purpose

This project manages reusable agent skills. It collects reference skills, adapts other people's skills into project-owned versions, and organizes the resulting skills for use by general-purpose agents.

## Directory responsibilities

- `upstream/` contains upstream or reference skills. Treat this directory as read-only.
- `skills/` contains project-owned skills and all customized copies intended for use by agents.
- `scripts/` contains project automation and maintenance utilities.
- `src/` and `test/` contain project code and its tests.

## Skill design rules

- Give each skill one responsibility and one job. When a task needs a second job, create a second skill instead of broadening the first.
- Keep every skill self-contained. Never name or depend on another skill in any skill file; state the required setup, inputs, or outcome in the skill's own terms.
- Follow the standard skill layout, with `SKILL.md` as the execution guide:

  ```text
  skill-name/
  |-- SKILL.md
  |-- scripts/       Optional executable helpers
  |-- references/    Optional instructions or documentation loaded on demand
  `-- assets/        Optional templates or files used in generated output
  ```

- Place each supporting file in the directory that matches its role instead of leaving it beside `SKILL.md` or in `scripts/` when it is not executable.

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
5. Check the customized `SKILL.md` against the skill design rules and run relevant tests or validation scripts.

## General conventions

- Use English for project documentation and agent instructions unless a skill explicitly targets another language.
- Follow existing project patterns before introducing new structure or dependencies.
- Keep changes focused on the requested skill adaptation or project maintenance task.
