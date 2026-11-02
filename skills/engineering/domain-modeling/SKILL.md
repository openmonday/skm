---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or settling rules the design must follow.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the glossary down the moment terms crystallise, while surfacing the rules the design must follow. (Merely *reading* `.assist/CONTEXT.md` for vocabulary is not this skill: that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## File structure

Read `.assist/AGENTS.md` when present for canonical runtime conventions and `.assist/CONTEXT.md` if it exists. Find the arch records for the areas under discussion, following "Finding arch records" in `.assist/AGENTS.md`. If these are missing, continue silently.

Use one project context file:

```
/
├── .assist/
│   ├── AGENTS.md
│   └── CONTEXT.md
└── src/
```

Create `.assist/CONTEXT.md` lazily, when the first real term is resolved. Before saving, require an initialized `.assist/AGENTS.md`; if it is missing, keep the proposed content in the conversation and ask the user to run `/setup-assist`.

For shared-worktree ownership, follow `.assist/AGENTS.md`: workers return proposed changes, and the coordinator applies the inline updates below.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `.assist/CONTEXT.md`, call it out immediately. "Your context file defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update the glossary inline

When a term is resolved, update `.assist/CONTEXT.md` right there. Don't batch these up: capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`.assist/CONTEXT.md` should be totally devoid of implementation details. Do not treat it as a spec, a scratch pad, or a repository for implementation decisions. It is a context and nothing else.

### Surface rules as constraints

Do not write decision files during design. When the user settles a rule that a future agent working in the area could otherwise get wrong (a boundary, a hard-to-reverse choice, a deliberate deviation from the obvious path, or something the code cannot show), say it back as a one-line constraint with its reason and confirm it. `to-spec` collects these into the spec's Constraints section, and the closing record keeps them after the work is done. Skip rules the code and tests already make obvious.
