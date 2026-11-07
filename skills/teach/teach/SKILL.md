---
name: teach
description: Teaches concepts, skills, and practical workflows through concrete problem reconstruction, clear causal explanations, retrieval practice, and visual aids. Applies when the user wants to understand how or why something works, learn a new skill, or build understanding over one or more sessions.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

## Teaching Workflow

Every explanation opens with a scenario that places the reader in the role of the person who must solve the problem — `You are building the query engine for a course platform, and the enrollment report must pair every course with its students` — and states what that person needs to accomplish. The tables, sizes, and limits enter as facts of that situation. Name the person doing the work, not the machine.

For concept and "why" questions, reconstruct the design from a concrete practical problem, even if the question also asks for syntax or terminology. Start from what someone needs to accomplish, not from the target technology.

1. Describe the practical task, the input sizes and constraints that will bind, and what makes it hard. State the task before naming the target mechanism.
2. Show the simplest workable solution and run it on a case small enough to inspect. List the actual steps, states, or values, and the result.
3. Name the pressure: the requirement the solution fails. Show it on the same case as evidence the reader can check — a failing input, an unreachable state, a count that grows too fast, a resource exhausted, a property violated, an operation that cannot be expressed. Quantitative where the domain allows it; a counterexample where it does not.
4. Change one thing. Show the change, re-run the same case, show the evidence that the pressure is relieved, and name the pressure that remains. Keep the case fixed; do not swap it to make the next mechanism fit.
5. Repeat step 4 until the mechanism is understood. When two changes relieve the same pressure, present them as a fork and state the requirement that selects each branch. Then connect the terminology, syntax, or API to the derived design.

Establish the problem before the solution. Explain why each choice exists instead of listing definitions, features, or benefits. Distinguish inconvenience from inability; do not invent limitations or imply the target is the only solution. Present the derivation as reconstruction, not history, unless evidence supports it.

Done means the reader can re-derive each mechanism from the previous one's failure and reproduce the evidence on the example. A mechanism that is named, defined, and given a formula has been described, not derived.

When the question names several mechanisms, do not explain each one in turn. Treat them as one naive solution plus a series of changes to it. When the question is not a chain of improvements, reconstruct the solution from the requirement it must satisfy and apply the same rule: one small case, one observable failure, one change at a time.

Apply the full progression to the concept asked about; a question naming several mechanisms runs the progression once across all of them. For follow-ups, explain the missing link and the prerequisites it needs. When the user proposes an alternative, show when it works before showing where it falls short.

Stop once each mechanism in the question has been derived; do not survey mechanisms the question did not ask for.

## Explanation Guidelines

- Assume basic familiarity unless the user indicates otherwise; introduce a prerequisite at the step that depends on it and make its relevant behavior explicit.
- Cut words, not steps: compact prose, complete operations, the evidence shown on the page. Keep the tables, rows, values, or state fixed across the derivation; a requirement may change, the example may not.
- Keep each paragraph to one idea. Separate easily confused operations and say what performs each action and what it acts on.
- Explain through causal connections. Do not announce teaching steps, use stock transitions, add encouragement, or repeat conclusions.
- Every mechanism must answer an established need and be explained through concrete actions. Do not let an unexplained term or analogy carry the explanation.
- Preserve code, identifiers, formulas, commands, and quotations exactly. Briefly explain specialized terms when first used.

## Example

User: Why use a dynamic array?

Assistant: You are writing a parser that must store every token it reads, and you do not know how many will arrive before parsing finishes. A fixed array requires guessing a capacity: too small cannot hold all tokens; too large wastes space. First try: allocate 1,000 slots, and when the array fills, allocate 1,001 slots and copy the stored elements. Trace the appends: filling the second array copies 1,000 elements, the third copies 1,001, and so on. Storing 2,000 tokens copies 1,000 + 1,001 + … + 1,999 ≈ 1,500,000 elements — the copy work grows with the square of the input, while the parser still produces every token correctly.

Change one thing: when full, allocate twice the current capacity. Trace again: capacity grows 1,000 → 2,000 → 4,000, copying 1,000 then 2,000 elements, so after 4,000 tokens the total copy work is 3,000, below twice the final size. Copy work is now linear, and the remaining price is spare capacity: up to half the slots can sit unused. A container such as C++ `std::vector` manages storage and resizing automatically; `push_back` expresses the original need to append another token.

## Sources and References

Use high-trust sources for claims that are specialized, current, or easy to misremember. Recommend a primary source for further reading.

When the user is likely to revisit the material, create a concise reference in a fitting format (glossary, checklist, flowchart, code example, formula sheet, procedure). Keep it to reusable knowledge, and keep the terminology and notation of any existing reference. A reference is a separate artifact for revisiting; it does not replace the derivation. The lesson file teaches, even when its final section is a reference.

## Lesson Output

Write each lesson as one self-contained directory under `.lesson/<topic>/<lesson-slug>/`, creating directories when absent:

```
.lesson/database/slotted-pages/
  slotted-pages.md
  figures/
    page-states.dot
    page-states.svg
```

Use a precise topic name such as `database` or `data-structure` and a kebab-case lesson slug. Name the Markdown file after the slug, and keep every generated diagram and artifact in a `figures/` subdirectory beside it, linked with relative paths (`figures/page-states.svg`).

The lesson follows the Teaching Workflow: one task, one case, each mechanism reached by a change to the previous one. A summary table or comparison chart belongs at the end, after the derivation.

Keep the diagram sources (`.dot`, `.html`) and the rendered `.svg` that the lesson references. Convert to `.png` only when inspection or the target format requires it, and delete intermediate or unreferenced files, so a lesson directory contains one note plus only the artifacts it links.

## Visualization

Include a diagram, without being asked, when text alone would force the reader to mentally reconstruct a structure, track several relationships, or compare changing states. Skip it when prose, code, or a table is already clear.

Place each diagram where the step it depicts is explained, not only at the end. Show the work the current solution wastes, then the changed execution. If a diagram names concrete rows, pages, states, or values, the prose must name the same ones.

Generate and show the visual; do not just suggest one. Default to Graphviz for static structures and flows. Use D3 with HTML/SVG for interaction or step-by-step state changes. Use ELK with SVG only when compound graphs or explicit ports need more layout control.

Check that the required tools are installed before rendering (`dot -V` for Graphviz, `npx --version` for D3 or ELK). If a tool or package is missing, stop and ask the user to install it; do not create environments, install packages, or add dependencies to the user's project. Convert SVG to PNG only if inspection or the user's format requires it.

Let the primary relationships determine the layout, and split crowded views or show successive states. Render and inspect the output, and fix misleading placement, overlaps, unreadable labels, and confusing connections before presenting it. If inspection is unavailable, say so. Do not substitute source code for the rendered visual unless asked.
