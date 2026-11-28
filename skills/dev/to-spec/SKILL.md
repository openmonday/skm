---
name: to-spec
description: "Turn the current conversation into a local spec using the decisions already discussed."
disable-model-invocation: true
---

Turn the current conversation and your understanding of the code into a spec. Synthesize what was decided; skip the interview.

Save it to `.context/issues/<issue-slug>/spec.md` using the template below. Put every rule the user stated under Constraints, because the spec is the only copy an implementer sees. When updating a spec, keep its confirmed decisions and its Status. Report the path and every decision the conversation left open, rather than filling it in.

`Status` is the line under the title and is one of:

- `pending`: not started, or decisions still open. New specs start here.
- `in-progress`: implementation has started. Set by `implement` and `implement-tasks`.
- `done`: the issue is complete. Set by `implement` after its commit, or by `implement-tasks` at closeout.
- `dropped`: the user dropped the issue. Say why under Out of Scope.

`implement-tasks` also adds `Review base:` and `Integration branch:` lines under Status. Leave them alone.

<spec-template>

# <Issue title>

Status: pending

## Problem Statement

The problem that the user is facing, from the user's perspective. List paths to research reports used, if any.

## Solution

The solution to the problem, from the user's perspective.

## Scenarios

A numbered list of observable scenarios the change must satisfy, covering normal cases, edge cases, and failure modes:

- For user-facing features, state who triggers each behavior and what they observe.
- For bug fixes or internal changes, state the trigger conditions, the broken or old behavior, and the expected behavior.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Schema changes
- API contracts
- Specific interactions
- Testing: what makes a good test (external behavior only, not implementation details), which modules will be tested, and prior art in the codebase

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

## Constraints

Rules the implementation must follow and later changes must keep, each with its reason. Include what must NOT be done, and rules for new modules that have no history yet. Architectural boundaries and hard-to-reverse choices belong here. Keep each rule to one line, since map records are built from them.

**Supersedes:** map record Constraints or Architecture statements this work changes, each confirmed by the user. One line each:

- `<record>.md`: "<old statement>" → "<new statement or removed>": <reason>

Write "None" when nothing changes. Only the statements listed here may be broken; every other one stays binding.

## Out of Scope

A description of the things that are out of scope for this spec. Name dependencies on other issues here.

</spec-template>
