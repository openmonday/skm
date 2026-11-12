---
name: to-spec
description: "Turn the current conversation into a local spec using the decisions already discussed."
disable-model-invocation: true
---

Turn the current conversation and your understanding of the code into a spec. Synthesize what was decided; skip the interview.

Save it to `.context/issues/<issue-slug>/spec.md` using the template below. Put every rule the user stated under Constraints, because the spec is the only copy an implementer sees. When updating a spec, keep its confirmed decisions. Report the path and every decision the conversation left open, rather than filling it in.

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

Rules the implementation must follow and later changes must keep, each with its reason. Include what must NOT be done, and rules for new modules that have no history yet. Architectural boundaries and hard-to-reverse choices belong here. Keep each rule to one line, since map records are built from them.

### Supersedes

Map record Constraints or Architecture statements this work changes, each confirmed by the user. One line each:

- `<record>.md`: "<old statement>" → "<new statement or removed>": <reason>

Write "None" when nothing changes. Only the statements listed here may be broken; every other one stays binding.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature, including paths to research reports used.

</spec-template>
