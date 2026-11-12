# Worktrees

## Ownership

The **coordinator** is the only agent that writes shared `.context/` files. Workers read them and return proposed changes as text.

## Task worktree

Name the integration branch `<issue-slug>`. Each task gets the branch `<issue-slug>-<task-slug>`, with a hyphen rather than `/`, because Git cannot hold both `x` and `x/...` as branch names.

1. Create the worktree from the integration tip, outside the project:
   ```bash
   git worktree add "../<repo>.worktrees/<issue-slug>-<task-slug>" -b "<issue-slug>-<task-slug>" <integration-tip>
   ```
2. Link the real `.context/` into it:
   ```bash
   CONTEXT="$(cd .context && pwd -P)"
   ln -s "$CONTEXT" "../<repo>.worktrees/<issue-slug>-<task-slug>/.context"
   ```
3. Verify that `.context/` is readable from the worktree, `git -C <worktree> check-ignore -q .context` succeeds, and `git -C <worktree> status --short` is empty.
4. After the task is integrated, remove the link with `rm <worktree>/.context` (no trailing slash, no `-r`), then run `git worktree remove <worktree>` and `git branch -d <task-branch>`.

If worktrees or directory symlinks are unavailable, run the tasks one at a time in the owner workspace.
