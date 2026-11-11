---
name: to-spec
description: "Turn the current conversation into a local spec using the decisions already discussed."
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user; just synthesize what you already know.

## Process

Write the spec using the template below and save it to `.context/issues/<issue-slug>/spec.md`. Synthesize the previous discussion, including agreed testing decisions and confirmed conflicts with map constraints. Collect every rule the user stated into the Constraints section; the spec is the only copy an implementing agent will see. Preserve existing confirmed decisions when updating a spec. Report its path and any unresolved assumptions. Do not invent missing decisions.

Each spec has its own issue directory:

```text
.context/issues/
└── <issue-slug>/
    └── spec.md
```

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

### Supersedes

Map record Constraints this work deliberately changes, each confirmed by the user. One line each:

- `<record>.md`: "<old rule>" → "<new rule or removed>": <reason>

Write "None" when no record constraint changes. During implementation, these entries override only the rules they name; every other map record Constraint stays binding.

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
