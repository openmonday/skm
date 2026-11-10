---
name: code-review
description: "Review committed and working-tree changes against a fixed point on standards and local spec requirements. Use for branch reviews, work in progress, or requests to review since a commit, branch, or tag."
---

Two-axis review of committed and working-tree changes since a fixed point:

- **Standards**: does the code conform to this repo's documented coding standards?
- **Spec**: does the code faithfully implement the local spec and tickets?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

Read `.desk/AGENTS.md` when present for local source paths, domain docs, and shared-workspace rules. An explicit user-supplied spec remains valid without setup; if there is no initialized workspace, continue the Standards review and report any unavailable spec context.

## Process

### 1. Pin the fixed point

Whatever the user or calling workflow supplied is the fixed point (a commit SHA, branch name, tag, `main`, `HEAD~5`, etc.). Honor the starting commit already recorded by an implementation workflow; ask only if no baseline is available.

Resolve the fixed point (`git rev-parse --verify <fixed-point>`) and pin the review base once with `git merge-base <fixed-point> HEAD`. Capture:

- `git diff <review-base> --` for the net tracked changes relative to the base.
- `git diff --cached <review-base> --` for the staged snapshot and `git diff --` for unstaged changes. Review these separately too: unstaged edits can hide a defect still present in the staged snapshot.
- `git log <review-base>..HEAD --oneline` for the commit list.
- `git ls-files --others --exclude-standard` for new files; read relevant files explicitly because they are absent from `git diff`.

Scope the review to the requested work and account for every changed file in that scope, including new files. If the user explicitly requested committed changes only, review `git diff <review-base> HEAD --` and the commit list, leaving index, worktree, and untracked files outside that review. A bad ref fails here. An empty review requires all in-scope snapshots and new files to be empty.

### 2. Identify the spec source

Look for the originating requirements in this order:

1. Spec and ticket paths supplied by the user or calling implementation workflow.
2. Local `.desk/...` source pointers in the relevant commit messages or task context.
3. `.desk/specs/<feature-slug>/spec.md` and its tickets matching the branch or feature.
4. If nothing is found, ask the user where the spec is. If none exists, skip the Spec subagent and report "no spec available".

Pass the full spec and applicable tickets to the Spec reviewer. Read `.desk/CONTEXT.md` when present. Find the arch records for the changed files and their directories, following "Finding arch records" in `.desk/AGENTS.md`, and pass them to the Spec reviewer; a change that breaks a record's Constraint is a Spec finding unless the spec's Supersedes list names that Constraint. If a record has drifted (commits after its `since:`), tell the reviewer to check its Constraints against the code rather than assume the record is current. Reviewers read shared `.desk` files and return findings to the coordinator.

### 3. Identify the standards sources

Search the repo for every file that documents how code should be written. When `CODING_STANDARDS.md` or `CONTRIBUTING.md` exists, it must be on the list.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Issue both subagent calls concurrently and aggregate their completed reports. If subagents are unavailable, perform both reviews separately and report the execution limitation.

**Standards sub-agent prompt** should include:

- The pinned base, all applicable diff commands, commit list, and relevant untracked file paths.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full (the sub-agent has no other access to it).
- The brief: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls: documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** should include:

- The pinned base, all applicable diff commands, commit list, and relevant untracked file paths.
- The full local spec and applicable tickets, or their readable paths.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings, because the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes: that's the reranking the separation exists to prevent.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
