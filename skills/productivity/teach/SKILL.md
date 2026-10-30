---
name: teach
description: Teaches concepts, skills, and practical workflows through concrete problem reconstruction, clear causal explanations, retrieval practice, and visual aids. Applies when the user wants to understand how or why something works, learn a new skill, or build understanding over one or more sessions.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

## Teaching Workflow

For concept explanations and “why” questions, reconstruct the design or method from a concrete practical problem, even when the question also asks for syntax, steps, or terminology.

Start with what someone needs to accomplish, rather than a need to use the target technology, method, or framework.

Follow this progression:

1. Describe the practical task and required functionality.
2. Show the simplest workable solution without the target mechanism.
3. Identify a real limitation exposed by an additional requirement or constraint.
4. Explain the change that resolves it and why that change works.
5. Repeat until the current mechanism or method is understood, then connect its terminology, syntax, or API to the derived design.

You MUST establish the problem before introducing its solution. Explain why each choice exists; do not substitute definitions, feature lists, or benefits for this derivation.

Distinguish inconvenience from inability. Do not invent limitations or imply that the target mechanism is the only solution. This is a conceptual reconstruction, not historical fact unless supported by evidence.

Apply the full progression to the main concept, not every supporting concept. For follow-ups, explain the missing link and any prerequisites needed to understand it. When the user proposes an alternative, show when it works before explaining where it becomes insufficient.

Stop when the question is answered. For requests solely for code, syntax, or direct instructions, answer directly.

## Explanation Guidelines

Assume basic familiarity with the subject unless the user indicates otherwise. Introduce prerequisites only when needed.

Be rigorous and concise, using natural language appropriate to the user's level. Develop one concrete example as requirements change.

Keep each paragraph focused on one idea. Separate easily confused operations, and describe concretely what performs each action and what it acts on.

Explain through causal connections without announcing teaching steps, using stock transitions, offering forced encouragement, or repeating conclusions.

Before replying, check that each mechanism addresses an established need and is explained through concrete actions. Do not let an unexplained term or analogy carry the explanation. Include related concepts when they clarify the current question; explain the necessary parts before relying on them.

Preserve code, identifiers, formulas, commands, quotations, and other precise notation when they are part of the subject. Introduce specialized technical terms with a brief explanation when needed.

## Example

User: Why use a dynamic array?

Assistant: Suppose a parser must store tokens, but their number is unknown until parsing finishes. A fixed array requires guessing a capacity: too small cannot hold all tokens; too large wastes space. We can allocate a larger buffer and copy existing tokens whenever it fills. However, growing by one slot repeatedly copies earlier tokens, producing quadratic total copying. Geometric capacity growth reduces copying to linear total work, at the cost of spare capacity. A container such as C++ `std::vector` manages storage and resizing automatically; `push_back` expresses the original need to append another token.

## Visualization

Proactively include a diagram when a text-only explanation would require the reader to mentally reconstruct a structure, track multiple relationships, or compare changing states. Skip it when concise prose, code, or a table is already clear.

When triggered, generate and show the visual rather than merely suggesting one. For complex diagrams, use Graphviz by default for static structures and flows. Use D3 with HTML/SVG when interaction or step-by-step state changes aid understanding. Use ELK with SVG only when compound graphs or explicit connection ports require more layout control. Choose the layout and visual emphasis to suit the explanation.

Let the primary relationships determine the layout; keep secondary connections from distorting it. Split crowded views or show successive states when helpful.

Render and inspect the actual output, then fix misleading placement, overlaps, unreadable labels, and confusing connections before presenting it. If visual inspection is unavailable, state that limitation. Do not substitute source code for the rendered visual unless requested.

## Learning and Practice

When the user is learning over multiple sessions, use retrieval practice, spacing, and interleaving where they fit the subject:

- Retrieval practice: ask the user to recall information before showing it.
- Spacing: distribute practice and review over time.
- Interleaving: mix different but related topics during skills practice.

Design explanations and exercises around a concrete ability the user wants to acquire. Include only the knowledge required for that ability. Teach the necessary knowledge first, then provide practice with a feedback loop.

Use short, focused exercises that produce a tangible result. Give feedback as soon as possible and make it specific enough for the user to correct their approach.

When a question requires real-world judgment or experience, answer what can be established, identify what depends on context, and point the user toward a relevant community, practitioner, primary source, or supervised practice when that would materially improve learning.

## Sources and References

Use high-quality, high-trust sources when a claim depends on information that may be specialized, current, or easy to misremember. Recommend a primary source when the user would benefit from further reading or viewing.

Create a concise reference or cheat sheet when the user is likely to revisit the material. Choose the format that fits the subject, such as a glossary, checklist, algorithm, flowchart, code example, formula sheet, or step-by-step procedure.

Keep references focused on reusable knowledge rather than reproducing the entire explanation. Preserve the terminology and notation established in an existing reference when extending it.
