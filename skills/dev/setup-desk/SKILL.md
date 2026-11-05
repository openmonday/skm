---
name: setup-desk
description: Initialize a local Desk workspace for specs, tickets, domain terms, architecture records, research, and handoffs.
disable-model-invocation: true
---

# Setup Desk

Set up the current project with fixed local defaults. Keep Desk configuration in `.desk/` and Git's local `info/exclude`. Treat project-level `AGENTS.md` and `CLAUDE.md` as read-only guidance; leave their contents and existence unchanged. Run the steps directly; ask only when existing content creates a conflict that cannot be resolved without choosing what to keep.

This skill owns one file, `.desk/AGENTS.md`. Every other `.desk` file is created later by the skill that owns it, as listed under "Files" in [WORKSPACE.md](WORKSPACE.md).

## 1. Inspect the project

Find the project root: in Git, `git rev-parse --show-toplevel`; outside Git, the current project directory. Read its `AGENTS.md`, `CLAUDE.md`, and any existing `.desk/AGENTS.md`.

Check whether `.desk` is a directory, a working symlink, a broken link, or another file. Reuse a working shared directory. Resolve a conflicting entry with the user before replacing it.

In Git, run `git ls-files -- .desk`. If Desk files are already tracked, explain that local exclusion cannot remove them from history, and ask how to handle them before changing their tracking.

**Done:** the project root, existing Desk content, and any conflicts are identified.

## 2. Write `.desk/AGENTS.md`

Create `.desk/` if absent. Seed `.desk/AGENTS.md` from [WORKSPACE.md](WORKSPACE.md). On reruns, add missing conventions and keep project-specific edits. Do not create any other file or subdirectory.

**Done:** `.desk/AGENTS.md` exists and matches the template, apart from preserved project edits.

## 3. Exclude the workspace from Git

In a Git project:

1. Resolve the shared exclude file with `git rev-parse --path-format=absolute --git-path info/exclude`. Run from the project root and keep paths quoted.
2. Create its parent directory if needed. Append `/.desk` as its own line only when that exact line is absent; keep all existing rules and make sure a newline separates the appended rule.

The pattern matches the root directory and a root symlink. The rule is local Git metadata shared by linked worktrees, so Desk material stays untracked. Use it instead of an inner ignore file.

Outside Git, skip this step; setup leaves repository creation to the user. Rerunning setup after `git init` adds the rule.

**Done:** the exclude file contains exactly one `/.desk` line, or the project is not a Git repository.

## 4. Verify

- `.desk/AGENTS.md` is readable.
- `.desk/` contains nothing that setup created besides `AGENTS.md`.
- In Git, `git check-ignore -v -- .desk/AGENTS.md` (or `.desk` when it is a symlink) matches the rule, and `git status --short --untracked-files=all -- .desk` is empty.
- Project-level `AGENTS.md` and `CLAUDE.md` were neither created nor modified.
- A rerun would preserve existing content and add no duplicate exclude rule.

**Done:** every check passes, or each failure is understood.

## 5. Summarize

Tell the user, in one short message:

- The workspace path, and whether `.desk/AGENTS.md` was created or updated.
- The Git exclusion result, or that it is pending because the project is not a Git repository.
- Any conflicts left for the user to resolve.
- When the repository already has source code and `.desk/architecture/` is empty: `/update-arch` can bootstrap architecture records from the existing code.
