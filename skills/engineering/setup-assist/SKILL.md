---
name: setup-assist
description: Initialize a local Assist workspace for specs, tickets, domain docs, and handoffs.
disable-model-invocation: true
---

# Setup Assist

Set up the current project with fixed local defaults. Keep Assist configuration in `.assist/` and Git's local `info/exclude`. Treat project-level `AGENTS.md` and `CLAUDE.md` as read-only guidance; leave their contents and existence unchanged. Run the steps directly; ask only when existing content creates a conflict that cannot be resolved without choosing what to keep.

## 1. Inspect the workspace

Find the project root and read its `AGENTS.md`, `CLAUDE.md`, and existing `.assist/AGENTS.md`. In Git, use `git rev-parse --show-toplevel`; outside Git, use the current project directory.

Check whether `.assist` is a directory, a working symlink, a broken link, or another file. Reuse a working shared directory. Preserve existing files; resolve a conflicting entry with the user before replacing it.

In Git, check `git ls-files -- .assist` before relying on ignore rules. If Assist files are already tracked, explain that local exclusion cannot remove them from history. Ask how to handle them before changing their tracking; keep existing content intact.

**Done:** the workspace root, existing Assist content, and any conflicts are identified.

## 2. Create the local workspace

Create `.assist/` if absent. Use [WORKSPACE.md](WORKSPACE.md) as the seed for `.assist/AGENTS.md`, the single source of truth for project-local conventions. On reruns, fill missing conventions while preserving project-specific edits. Create the glossary, ADRs, feature directories, handoffs, and debug material only when they have content.

For a Git project:

1. Resolve the shared exclude file with `git rev-parse --path-format=absolute --git-path info/exclude`. Run from the project root and keep paths quoted.
2. Create its parent directory if needed. Append `/.assist` as its own line only when that exact line is absent; preserve all existing rules and ensure a newline separates the appended rule.
3. Verify with `git check-ignore -v -- .assist/AGENTS.md` (or `.assist` when it is a symlink), and check `git status --short --untracked-files=all -- .assist` is empty.

The pattern matches the root directory and a root symlink. The rule is local Git metadata shared by linked worktrees. Assist material remains untracked. Use this exclusion instead of generating an inner ignore file.

Outside Git, create the same workspace and report that Git exclusion is pending. Rerun setup after `git init` to add it; setup itself leaves repository creation to the user.

**Done:** `.assist/AGENTS.md` exists, existing content is preserved, and Git exclusion is verified where Git is available.

## 3. Verify and report

Check that `.assist/AGENTS.md` is readable, no empty domain documents were scaffolded, and rerunning would preserve existing content and avoid duplicate exclude rules. Verify that project-level instruction files were neither created nor modified. Report the workspace and exclusion result. The installed `to-spec`, `to-tickets`, `implement`, `implement-spec`, `code-review`, and `domain-modeling` skills explicitly read `.assist/AGENTS.md` when invoked.

Setup initializes the workspace. Later `implement-spec` runs create linked worktrees using the sharing procedure in `.assist/AGENTS.md`.
