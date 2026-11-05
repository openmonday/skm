# AGENTS.md: skills/dev

Instructions for agents editing the dev workflow skills. Read [README.md](README.md) first for the overall flow. The repository-level `AGENTS.md` still applies.

## Scope

- Each subdirectory with a `SKILL.md` is one skill. `skm` discovers skills by `SKILL.md`, so `README.md` and `AGENTS.md` in this directory are not skills.
- These are project-owned skills. Edit them in place. Never edit their references under `upstream/`.
- When you add, remove, or rename a skill, update the `dev` group in `skills/groups.json` and the tables in this directory's `README.md` and in `skills/README.md`.

## Contracts shared across skills

Many skills depend on the same conventions. A change to any of these must be applied to every skill that uses it:

- **Workspace root is `.desk/`, and the setup skill is `setup-desk`.** Its paths are `CONTEXT.md`, `architecture/`, `features/<slug>/spec.md`, `features/<slug>/tickets/NN-<slug>.md`, `handoffs/`, `references/<project>/`, and `research/<topic>/`. Subdirectory names are full words, never abbreviations. To find every place a path is used: `rg -n '\.desk/' skills/dev`.
- **`.desk/AGENTS.md` is generated from `setup-desk/WORKSPACE.md`.** Skills cite sections of it by name: "Files", "Tickets", "Ownership", "Shared worktrees", "Finding arch records", "Using arch records", and "Project-wide rules". Keep those names stable. If you rename one, update every citation (`rg -n '"[A-Z][a-z]+ [a-z ]+" in .desk/AGENTS.md' skills/dev`).
- **Arch record lifecycle.** A record describes committed code, never a plan. Planned changes go in the spec's **Supersedes** section. Agents treat records as binding except for Supersedes entries, and `/update-arch` rewrites records after commit. The rules are spread across `WORKSPACE.md` ("Using arch records"), `guidelines`, `to-spec`, `to-tickets`, `implement`, `implement-spec`, `code-review`, `update-arch`, `research` §7, and `ARCH-FORMAT.md`. Change them together.
- **One owner skill per `.desk` file.** The "Files" table in `WORKSPACE.md` names the owner skill, format, and lifetime of every path. Only the owner creates a file or changes its structure, and its format lives in the owner skill. When you add a path or change an owner, update that table and the owner skill together.
- **Missing workspace.** Workflow skills (`to-spec`, `to-tickets`, `implement`, `implement-spec`, `handoff`) ask the user to run `/setup-desk`. `research` names no other skill and only says the workspace is not initialized. Supporting skills (`tdd`, `diagnosing-bugs`, `domain-modeling`, `code-review`) continue silently.
- **Coordinator ownership.** In shared-worktree runs, workers return proposed changes and only the coordinator writes shared `.desk` files. Keep this sentence in every skill that writes to `.desk/`.
- **Arch record helpers are duplicated.** `find-arch.sh` exists in `check-arch/scripts/`, `guidelines/scripts/`, and `update-arch/scripts/`. `validate-arch.sh` and `ARCH-FORMAT.md` exist in `check-arch/scripts/` and `update-arch/scripts/`. Each skill must stay self-contained, so edit one copy, copy it over the others, and confirm they match with `diff`.
- **Spec → ticket → record chain.** `grill-with-docs` and `to-spec` read research reports; `research` itself does not name them. `to-spec` collects Constraints and Supersedes. `to-tickets` copies the ones that apply into each ticket. `update-arch` builds records from them, then removes the feature folder; `implement` and `implement-spec` keep the folder whenever they recommend `/update-arch`. Keep section names (`Constraints`, `Supersedes`, `Status`, `Blocked by`, `Verification`) consistent across these skills and `ARCH-FORMAT.md`.
- **Temp output** goes under `${TMPDIR:-/tmp}/desk-debug/` and `${TMPDIR:-/tmp}/desk-reports/`, never into the project.

## Invocation metadata

- Entry-point skills that change state set `disable-model-invocation: true` in front matter. Their `agents/openai.yaml` sets `policy.allow_implicit_invocation: false` to match.
- Supporting skills (`tdd`, `code-review`, `codebase-design`, `diagnosing-bugs`, `domain-modeling`, `grill-me`, `guidelines`) stay model-invocable. Their `description` must say when to trigger.
- Every skill has an `agents/openai.yaml` with `display_name` and `short_description`. Keep them in sync with `SKILL.md`.

## Writing style

- English, imperative, concise. Each workflow step ends with a **Done:** criterion that can be checked.
- Refer to other skills by name (`tdd`, `/update-arch`) instead of copying their content.
- Keep file paths and code out of spec and ticket templates. A trimmed prototype snippet is the only exception. Research reports are the exception the other way: they must cite reference code by `file:line`.

## Validation

After editing:

1. Check that `SKILL.md` front matter parses and `name` matches the directory name.
2. Grep for stale terms from earlier versions: `rg -n -i '\.assist|setup-assist|assist-|GLOSSARY|adr/|issues/|engineering/|desk/arch/|desk/reports|refs/' skills/dev skills/README.md`.
3. Check that every `openai.yaml` invocation policy matches its `SKILL.md`, and `diff` the duplicated arch scripts and formats listed above.
4. Run `bash -n` on changed shell scripts. Try `validate-arch.sh` on a sample record.
5. Run the repository tests (`npm test`) when discovery or `groups.json` changed.
