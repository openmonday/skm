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

Each location has a different lifetime:

| Location | Holds | Written | Read | Ends |
| --- | --- | --- | --- | --- |
| `CONTEXT.md` | Term definitions | When a term is resolved | Before any work | Never |
| `arch/` | What a finished change built, the rules it set, and its shape | At the end of a change | Before touching related files, found through Git | Never; a newer record can replace it |
| `features/<slug>/` | Spec and tickets for one piece of work | During design and implementation | By agents working on that feature | Deleted after its arch record is written |
| `handoffs/` | Session handoffs | When requested | By you or resuming agents | Manual cleanup |
| `reports/` | HTML visualizations | When requested | By you | Manual cleanup |

Use one stable feature slug for a spec and its tickets. Read and update an existing feature when continuing it. Ask when multiple features could match a reference; a bare ticket number is scoped to one feature.

Write local specs, tickets, arch records, context definitions, handoffs, and diagnostic notes in Chinese, keeping code identifiers and useful English technical terms. Instruction and configuration files, including this file, stay in English. Product or collaborative output follows its intended audience.

## The life of a change

1. **Before work:** find the arch records for the files in scope (see Finding arch records) and read `CONTEXT.md`.
2. **During design:** the rules settled with the user belong in the spec's **Constraints** section, not only in the conversation. A different agent may implement the work and will not see the conversation.
3. **During implementation:** follow the spec's Constraints and the arch records found in step 1. Surface a conflict with an arch record instead of silently overriding it.
4. **At the end:** write an arch record (see Arch records), commit with a conventional commit message (`feat:`, `fix:`, `refactor:`, etc.), then set the record's `since:` to the new commit hash. Delete the feature folder once the change is integrated and verified, and tell the user it was removed.

## Arch records

An arch record is the lasting memory of one finished change. It carries Git's file history forward: Git says which commits touched a file, and the arch record says what those changes meant.

**Write an arch record when a future agent editing the same files could do the wrong thing without it:** the change added behavior with rules attached, set a boundary, reshaped modules, or a fix revealed a rule the code did not enforce. Skip it for typo fixes, formatting, dependency bumps, and changes the code and tests already explain.

Name it with a descriptive slug: `payment-gateway-integration.md`, `event-sourcing-orders.md`, `api-versioning-strategy.md`. The name should make the topic clear without reading the file.

Template; omit any section with nothing to say:

```yaml
---
type: feat              # feat | fix | refactor
files:                  # lookup key: records are found by the files they describe
  - src/payments/stripe.ts
  - src/payments/paypal.ts
  - src/orders/create.ts
since: abc123f          # commit where this record was last confirmed accurate
---

# <What changed, in a short phrase>

## Feature
What users or callers can now do. One or two short paragraphs. Leave out for refactors.

## Constraints
Rules that future changes must keep. One line each: the rule, then the reason.
State what must not be done as well as what must. Cover rules for new modules that
have no history yet.

## Architecture
How it is built: the modules, their boundaries, data flow, and key interfaces.
Mention a rejected alternative only when someone would otherwise propose it again.
```

Guidance by type:

- `feat`: Feature, plus Constraints and Architecture when there is something to say.
- `refactor`: Architecture (the new shape) and Constraints (what the shape protects). No Feature.
- `fix`: usually no arch record. When the bug revealed a rule, write one Constraints entry that states the rule and the failure it prevents.

Keep an arch record under about 60 lines. Split unrelated topics into separate records. Do not put line numbers or code snippets in an arch record: Git already links commits to files and they go stale. Copy the spec's Constraints and adjust them for what was actually built; do not write a second version from memory.

The `files:` field is the **lookup key**: an agent finds a record by the paths it lists, so these survive any number of later commits. The `since:` field holds the commit hash where the record was last confirmed accurate; it lets an agent measure how much a file has drifted since then. Because the commit does not exist while the record is being written, set `since:` to the new commit hash right after committing, or run the `update-arch` skill to set it. Keep paths current: when a described file is renamed or moved, update its entry.

A new arch record that changes an earlier rule should note which record it supersedes in the content. Never edit an old arch record to match new behavior; create a new one or update the existing one with the new `since:` hash.

Commit with conventional commit format:

```text
feat: add payment gateway integration

Integrates Stripe and PayPal for order payments.
```

No special trailer is needed. The arch record's `files:` metadata links it to the code.

## Finding arch records

Before changing code, list the files you will edit and find the arch records that describe them:

```bash
# Search all arch records for a file path (-e stops the leading "- " being read as a flag)
grep -l -e '- src/payments/stripe.ts' .assist/arch/*.md
```

Or use the provided search helper (see Finding arch records script below).

- Read all matching arch records.
- Check drift: `git log --oneline <since>..HEAD -- <file>` shows what changed since a record was confirmed. Many commits means read the record critically; it may be stale.
- When two arch records disagree, the one with the newer `since:` wins.
- Silently continue when nothing is found or an arch record file is missing.
- A renamed file may be listed under its old path; `git log --follow` traces the rename if a direct match fails.

Arch records cover rules tied to code. Rules that apply to the whole project belong under Project-wide rules below.

Older workspaces may still contain `records/`, `adr/`, or other legacy paths. Treat them as read-only history: read relevant items when present, create nothing new there, and migrate only when the user asks.

## Finding arch records script

Save this as `.assist/find-arch.sh` for convenient lookup:

```bash
#!/usr/bin/env bash
# Usage: .assist/find-arch.sh path/to/file [path/to/another/file ...]
# Prints the arch records that describe any of the given paths.

set -euo pipefail

if [ $# -eq 0 ]; then
    echo "Usage: $0 <file-or-directory>..." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCH_DIR="$SCRIPT_DIR/arch"

[ -d "$ARCH_DIR" ] || exit 0

found=()
for record in "$ARCH_DIR"/*.md; do
    [ -f "$record" ] || continue
    for path in "$@"; do
        # Match the path as a list item in the record's front matter.
        if grep -qF -e "- $path" "$record" 2>/dev/null; then
            found+=("$record")
            break
        fi
    done
done

[ ${#found[@]} -eq 0 ] && exit 0
printf '%s\n' "${found[@]}"
```

Make it executable: `chmod +x .assist/find-arch.sh`

## Specs and tickets

A spec lives at `.assist/features/<feature-slug>/spec.md`. It records the problem, solution, user stories, implementation decisions, constraints, testing decisions, and scope.

Each ticket has its own file under the feature's `tickets/`, numbered from `01` in dependency order. Reuse existing numbers; assign the next unused number to a new ticket. Each ticket contains these metadata lines near the top:

```text
Status: pending
Blocked by: None
```

`Blocked by: 01, 02` references tickets in the same feature. Every reference must exist, self-dependencies are invalid, and the dependency graph must be acyclic. List all genuine prerequisites, including later-numbered tickets if an existing plan changes.

- `pending`: waiting to be started, including tickets with unfinished blockers.
- `in-progress`: claimed by one implementer.
- `done`: acceptance criteria verified, review findings addressed, and the implementation is committed to the target branch. In a worktree workflow, its changes must also be merged into the integration branch.

The **frontier** is pending tickets whose blockers are all done. Start in number order when several are ready. Claim a ticket before dispatching work. A failed or interrupted attempt stays in-progress with a brief note until the coordinator confirms the old worker has stopped, then resumes or releases it to pending.

Record verification evidence and implementation commit references in the ticket. Record the integration branch, owner workspace, original review-base commit, and arch record name in the spec when implementation starts; reuse that baseline when resuming. Completion includes rerunning affected checks on the target branch. When a final review finds a defect, reopen the affected ticket until the correction is integrated and verified. A feature is complete when every ticket and the spec's acceptance requirements are satisfied; the coordinator then writes its arch record and removes the feature folder.

## Handoffs

Save session handoffs to `.assist/handoffs/<session-slug>.md`, one per session or continuation. Use a descriptive slug. Handoffs are cleaned up manually by the user.

## Diagnostics and reports

Debug captures, reproduction scripts, and throwaway harnesses are saved under `${TMPDIR:-/tmp}/assist-debug/<bug-slug>/`, outside the project and `.assist/`. Redact secrets before writing or quoting them.

HTML reports and visualizations go to `.assist/reports/`. They are cleaned up manually by the user.

Keep whatever must last in a lasting place: a regression test in the project's test directory, a rule in an arch record, the cause in the commit message.

## Git and shared worktrees

Assist material is local, untracked data excluded by `/.assist` in Git's shared `info/exclude`. It belongs to the developer who maintains it and is outside project commit history; others who clone the project do not receive it. Back it up separately if desired. Commit messages and tracked files must stay understandable without it. The arch records in `.assist/arch/` are internal context; commit messages are public. Exclusion does not affect files already tracked. Preserve the local exclusion on setup reruns.

For a parallel implementation, the coordinator prepares every worktree before launching a worker:

1. Resolve the current `.assist/` to its physical absolute path. Keep this owner workspace available until all dependent worktrees are cleaned up.
2. Create a fresh branch and worktree from the current integration branch. Use `git worktree add -b <ticket-branch> <worktree-path> <integration-branch>` with concrete, quoted arguments; keep worktrees outside `.assist/` so their source files are not recursively included in the shared workspace.
3. Create `<worktree-path>/.assist` as a directory symlink to the resolved owner directory. An existing entry must resolve to that same directory; resolve conflicts before dispatch and preserve any existing data.
4. Verify the linked `.assist/AGENTS.md` is readable and matches the owner, and `git -C <worktree-path> check-ignore -v -- .assist` confirms the link is ignored. Check the shared exclusion if verification fails.

Workers use ordinary `.assist/...` paths. The coordinator handles the absolute link target once during setup. Symlink support is required for parallel worktrees; if the platform cannot create the link, use sequential implementation in the owner workspace and report the limitation.

Only the coordinator writes shared Assist files. Workers and reviewers read the spec, tickets, context, and arch records through the link and return findings, evidence, or proposed document updates to the coordinator. Workers commit with conventional commit messages. Keep durable source files, test fixtures, and regression tests in the normal tracked project directories.

On resume, inspect existing branches, worktrees, commits, and ticket notes before dispatching. Reconcile in-progress work and reuse valid links. Remove only worktrees created by this effort, after integration and verification; retain branches until their commits are known to be integrated. Preserve the owner `.assist/`.

Teaching workspaces managed by `teach` keep their own learning records and vocabulary. They are independent of these engineering paths.

## Project-wide rules

Add a rule here only when it applies to the whole project and cannot be tied to particular files. Keep the list short; every agent reads it. Prefer an automated check (a linter rule or dependency check) for anything a tool can enforce.

None yet.
