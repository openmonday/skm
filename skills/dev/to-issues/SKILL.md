---
name: to-issues
description: Split the decisions in the current conversation into small local issues, each with a spec and a module map of the code it changes and the contracts around it.
disable-model-invocation: true
---

# To issues

Turn the current conversation and your understanding of the code into one or more small issues. Synthesize what was decided; skip the interview. Each issue is a folder of two files:

```text
.context/issues/<issue-slug>/
├── spec.md      # what and why: scenarios, decisions, rules, blockers
└── modules.md   # where: change set, dependency chain, neighbor contracts
```

`spec.md` follows [the spec format](references/SPEC.md), and `modules.md` follows [the module format](references/MODULES.md). Together they let an implementer read and edit only the modules being changed, and use every other module through its contract. Use the terms in `.context/GLOSSARY.md`.

## 1. Trace the change

Find the modules the decided change touches and read their code. Follow their callers up and their callees down, one hop beyond the modules that change. For every file you read, run `scripts/query-map.py <file>...` from the project root and read every record it lists. When the change would break a record's Constraint or Architecture statement that the conversation did not confirm, ask the user. `.context/map/` describes committed code; leave it as is.

For a wide area, dispatch one exploration subagent per area in parallel. Each returns call paths, declarations, and `path:symbol` citations.

**Done:** the modules to change, their callers and callees, and the map records covering them are known.

## 2. Split into issues

Cut the work into issues that each:

- change a small set of modules, and leave the project building with its tests passing;
- deliver behavior or a refactor that can be verified on its own;
- fit in one commit that a person can review in one sitting.

Put prefactoring first: make the change easy, then make the easy change. Spread a change that touches many callers over several issues with expand–contract: one issue adds the new form beside the old, one issue per batch migrates callers, and a last issue removes the old form. If a piece cannot be cut small enough to review, say so instead of writing one large issue.

Give each issue its blockers: the issues that must be done before it can start.

Present the split as a numbered list: slug, title, blockers, change set, and the behavior each delivers. Ask whether the granularity, blockers, and module boundaries are right, and iterate until the user approves. A single issue still gets this check.

**Done:** the user approved the issues and their blockers.

## 3. Write the files

For each approved issue, write `spec.md`, then `modules.md` with `Base:` set to the full hash of `HEAD`. If files in the change set or its contracts have uncommitted changes, say that the file describes them too.

- Put every rule the user stated under the Constraints of each issue it applies to, because the spec is the only copy an implementer sees.
- Write each contract from the code you read. Mark what you could not confirm as inferred.
- For a module that a blocker changes, describe the contract the blocker leaves and mark it `after <blocker-slug>`.

When updating existing issues, keep their confirmed decisions, Status, and Verification. Leave `done` issues unchanged unless the user reopens one. Refresh `modules.md` and its Base when the code has moved.

**Done:** every issue has both files; every blocker names an issue folder that holds a `spec.md`; the blocker graph has no cycles; every node of each dependency chain is in the change set or has a contract.

## Report

List each issue path with its blockers, the issues ready to start, inferred contracts for the user to check, and every decision the conversation left open, rather than filling it in.
