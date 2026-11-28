# Spec file

`spec.md` says what one issue changes and why, in terms that stay true while the code moves. Keep file paths and code out of it: they go stale, and they belong in the issue's `modules.md`, which is pinned to a commit.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim it to the decision-rich parts.

<spec-template>

# <Issue title>

Status: pending
Blocked by: None

## Problem Statement

The problem that the user is facing, from the user's perspective. List paths to research reports used, if any.

## Solution

The solution to the problem, from the user's perspective, limited to what this issue delivers.

## Scenarios

A numbered list of observable scenarios this issue must satisfy, covering normal cases, edge cases, and failure modes:

- For user-facing features, state who triggers each behavior and what they observe.
- For bug fixes or internal changes, state the trigger conditions, the broken or old behavior, and the expected behavior.

## Implementation Decisions

The decisions that were made and their reasons: behavior of the modules involved, schema changes, API contracts, specific interactions, and technical clarifications from the developer. State each decision once: exact signatures and the modules they live in belong in `modules.md`.

Testing: what makes a good test here (external behavior only, not implementation details) and which behavior each test pins.

## Constraints

Rules the implementation must follow and later changes must keep, each with its reason. Include what must NOT be done, and rules for new modules that have no history yet. Architectural boundaries and hard-to-reverse choices belong here. Keep each rule to one line, since map records are built from them.

**Supersedes:** map record Constraints or Architecture statements this issue changes, each confirmed by the user. One line each:

- `<record>.md`: "<old statement>" → "<new statement or removed>": <reason>

Write "None" when nothing changes. Only the statements listed here may be broken; every other one stays binding.

## Out of Scope

What this issue leaves out, naming the issue that covers it when there is one.

## Verification

Left empty when the issue is written. The implementer records the commit and the checks run, with their results.

</spec-template>

## Status

`Status` is one of:

- `pending`: not started, or decisions still open. New issues start here.
- `in-progress`: implementation has started.
- `done`: the issue's commit exists and its checks passed.
- `dropped`: the user dropped the issue. Say why under Out of Scope.

## Blocked by

`Blocked by:` is `None` or a comma-separated list of issue slugs, such as `session-store-expand, session-api-migrate`. Each names a folder under `.context/issues/` that holds a `spec.md`. An issue is ready when every blocker is `done`. The blocker graph has no cycles.
