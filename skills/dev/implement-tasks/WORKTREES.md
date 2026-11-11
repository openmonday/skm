# Ownership

One agent, the **coordinator**, writes every shared `.context` file during a run: `GLOSSARY.md`, `map/`, `issues/`, and `reference/`. Subagents and task workers may read them, but they return proposed changes as text, and the coordinator applies them. In a single-agent session, that agent is the coordinator.

## Shared worktrees

`/implement-tasks` gives each task its own branch and worktree. The coordinator prepares each one:

1. Create it from the current integration tip, outside the project directory:
   ```bash
   git worktree add "../<repo>.worktrees/<feature-slug>-<task-slug>" -b "<feature-slug>-<task-slug>" <integration-tip>
   ```
   Name the integration branch `<feature-slug>`. Task branches use hyphens, not `/`, because Git cannot hold both `<feature-slug>` and `<feature-slug>/...` as branch names.
2. Link the owner's real workspace, resolving any existing symlink first:
   ```bash
   CONTEXT="$(cd .context && pwd -P)"
   ln -s "$CONTEXT" "../<repo>.worktrees/<feature-slug>-<task-slug>/.context"
   ```
3. Verify: `.context/` is readable from the worktree, `git -C <worktree> check-ignore -q .context` succeeds, and `git -C <worktree> status --short` is empty.
4. To clean up after the task is integrated, remove the link first (`rm <worktree>/.context`, with no trailing slash and never `-r`), then run `git worktree remove <worktree>` and `git branch -d <task-branch>`.

If directory symlinks or worktrees are unavailable, work through the tasks sequentially in the owner workspace.
