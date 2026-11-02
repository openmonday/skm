---
name: to-spec
description: "Turn the current conversation into a local spec using the decisions already discussed."
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user; just synthesize what you already know.

Read `.assist/AGENTS.md` for workspace conventions; if it is missing, ask the user to run `/setup-assist`. Use the existing work directory when continuing work; otherwise choose a descriptive work slug. Ask only when the work reference is ambiguous. In a shared-worktree run, return the draft to the coordinator to save.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use `.assist/CONTEXT.md` vocabulary when present. Find the arch records for the areas the work will touch, following "Finding arch records" in `.assist/AGENTS.md`, and respect their Constraints.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations, honoring an agreement already reached in this conversation.

3. Write the spec using the template below and save it to `.assist/features/<feature-slug>/spec.md`. Collect every rule the user stated in the conversation, including during `grill-me` sessions, into the Constraints section; the spec is the only copy an implementing agent will see. Preserve existing confirmed decisions when updating a spec. Report its path and any unresolved assumptions. The spec is ready when its requirements, scope, and testing decisions are explicit enough to guide implementation.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

## Constraints

Rules the implementation must follow and later changes must keep, each with its reason. Include what must NOT be done, and rules for new modules that have no history yet. Architectural boundaries and hard-to-reverse choices belong here. The closing record is built from this section, so keep each rule to one line.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>
