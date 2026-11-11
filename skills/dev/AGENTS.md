# AGENTS.md: skills/dev

Instructions for agents editing the dev workflow skills. Read [README.md](README.md) first for the overall flow. The repository-level `AGENTS.md` still applies.

## Scope

- Each subdirectory with a `SKILL.md` is one skill. `skm` discovers skills by `SKILL.md`, so `README.md` and `AGENTS.md` in this directory are not skills.
- These are project-owned skills. Edit them in place. Never edit their references under `upstream/`.
- When you add, remove, or rename a skill, update the `dev` group in `skills/groups.json` and the tables in this directory's `README.md` and in `skills/README.md`.

## Contracts shared across skills

Many skills depend on the same conventions. A change to any of these must be applied to every skill that uses it:

- **Workspace root is `.desk/`, and the setup skill is `setup-desk`.** Its paths are `CONTEXT.md`, `arch/`, `specs/<slug>/spec.md`, `specs/<slug>/tasks/<slug>.md`, `handoffs/`, `refs/<project>/`, and `research/<topic>/`. Use concise, conventional names. Use plural nouns for collections and mass nouns for subject areas; widely understood abbreviations are allowed. To find every place a path is used: `rg -n '\.desk/' skills/dev`.
- **Arch record lifecycle.** A record describes committed code, never a plan. Planned changes go in the spec's **Supersedes** section. Agents treat records as binding except for Supersedes entries, and `/update-arch` rewrites records after commit. The rules are spread across `guidelines`, `to-spec`, `to-tasks`, `implement`, `implement-spec`, `code-review`, `update-arch`, `research` §7, and `ARCH-FORMAT.md`. Change them together.
- **One owner skill per `.desk` file.** Each owner skill defines its file format; setup creates the empty workspace skeleton. Other skills update shared task fields, `/implement-spec` records run metadata in the spec, and implementation and arch skills perform close-out.
- **Missing workspace.** Workflow skills (`to-spec`, `to-tasks`, `implement`, `implement-spec`, `handoff`) report that the workspace is not initialized. `research` names no other skill and only says the workspace is not initialized. Supporting skills (`tdd`, `diagnosing-bugs`, `domain-modeling`, `code-review`) continue silently.
- **Coordinator ownership.** In shared-worktree runs, workers return proposed changes and only the coordinator writes shared `.desk` files. Keep this sentence in every skill that writes to `.desk/`.
- **Shared plain references are duplicated for standalone copies.** `guidelines/ARCH-RECORDS.md`, `codebase-design/VOCABULARY.md`, and `to-tasks/TASKS.md` are canonical. When changing one, update every same-named copy under `skills/dev/`; `npm test` checks equality and isolated Markdown links. Link to the copy inside each skill so individual `--copy` installs remain self-contained.
- **Arch record helpers are duplicated.** `find-arch.sh` exists in `check-arch/scripts/`, `guidelines/scripts/`, and `update-arch/scripts/`. `validate-arch.sh` and `ARCH-FORMAT.md` exist in `check-arch/scripts/` and `update-arch/scripts/`. Each skill must stay self-contained, so edit one copy, copy it over the others, and confirm they match with `diff`.
- **Spec → task → record chain.** `grill-with-docs` and `to-spec` read research reports; `research` itself does not name them. `to-spec` collects Constraints and Supersedes. `to-tasks` copies the ones that apply into each task. `update-arch` builds records from them, then removes the feature folder; `implement` and `implement-spec` keep the folder when architectural decisions need recording. Keep section names (`Constraints`, `Supersedes`, `Status`, `Blocked by`, `Verification`) consistent across these skills and `ARCH-FORMAT.md`.
- **Output locations.** Temporary debug artifacts go under `${TMPDIR:-/tmp}/desk-debug/`; `show-me` visuals go under `.show-me/` in the project or workspace unless the user chooses another location.

## Invocation metadata

- Dev skills are user-invoked: set `disable-model-invocation: true` and `policy.allow_implicit_invocation: false`. The `grill-me` and `domain-modeling` dependencies remain model-invocable so `grill-with-docs` can compose them.
- Every skill has an `agents/openai.yaml` with `display_name` and `short_description`. Keep them in sync with `SKILL.md`.

## Writing style

- English, imperative, concise. Each workflow step ends with a **Done:** criterion that can be checked.
- Skills do their own work without invoking or recommending other skills; `grill-with-docs` is the composition exception. Put shared reference in plain files.
- Keep file paths and code out of spec and task templates. A trimmed prototype snippet is the only exception. Research reports are the exception the other way: they must cite reference code by `file:line`.

## Validation

After editing:

1. Check that `SKILL.md` front matter parses and `name` matches the directory name.
2. Grep for stale terms from earlier versions: `rg -n -i '\.assist|setup-assist|assist-|GLOSSARY|adr/|issues/|engineering/|architecture/|features/|tickets/|reference/|desk/reports|to-tickets' skills/dev skills/README.md`.
3. Check that every `openai.yaml` invocation policy matches its `SKILL.md`, and `diff` the duplicated arch scripts and formats listed above.
4. Run `bash -n` on changed shell scripts. Try `validate-arch.sh` on a sample record.
5. Run the repository tests (`npm test`) when discovery or `groups.json` changed.
