---
name: teach
description: Teaches concepts, skills, and practical workflows through concrete problem reconstruction, clear causal explanations, retrieval practice, and visual aids. Applies when the user wants to understand how or why something works, learn a new skill, or build understanding over one or more sessions.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

## Teaching Workflow

For concept and "why" questions, reconstruct the design from a concrete practical problem, even if the question also asks for syntax or terminology. Start from what someone needs to accomplish, not from the target technology.

1. Describe the practical task and required functionality.
2. Show the simplest workable solution without the target mechanism.
3. Identify a real limitation exposed by an additional requirement.
4. Explain the change that resolves it and why it works.
5. Repeat until the mechanism is understood, then connect its terminology, syntax, or API to the derived design.

Establish the problem before the solution. Explain why each choice exists instead of listing definitions, features, or benefits. Distinguish inconvenience from inability; do not invent limitations or imply the target is the only solution. Present the derivation as reconstruction, not history, unless evidence supports it.

Apply the full progression to the main concept only. For follow-ups, explain the missing link and its prerequisites. When the user proposes an alternative, show when it works before showing where it falls short.

Stop when the question is answered. For requests solely for code, syntax, or direct instructions, answer directly.

## Explanation Guidelines

- Assume basic familiarity unless the user indicates otherwise; introduce prerequisites only when needed.
- Be rigorous and concise. Develop one concrete example as requirements change.
- Keep each paragraph to one idea. Separate easily confused operations and say what performs each action and what it acts on.
- Explain through causal connections. Do not announce teaching steps, use stock transitions, add encouragement, or repeat conclusions.
- Every mechanism must answer an established need and be explained through concrete actions. Do not let an unexplained term or analogy carry the explanation.
- Preserve code, identifiers, formulas, commands, and quotations exactly. Briefly explain specialized terms when first used.

## Example

User: Why use a dynamic array?

Assistant: Suppose a parser must store tokens, but their number is unknown until parsing finishes. A fixed array requires guessing a capacity: too small cannot hold all tokens; too large wastes space. We can allocate a larger buffer and copy existing tokens whenever it fills. However, growing by one slot repeatedly copies earlier tokens, producing quadratic total copying. Geometric capacity growth reduces copying to linear total work, at the cost of spare capacity. A container such as C++ `std::vector` manages storage and resizing automatically; `push_back` expresses the original need to append another token.

## Learning and Practice

For multi-session learning, use retrieval practice (ask the user to recall before showing), spacing (spread review over time), and interleaving (mix related topics) where they fit.

Build explanations and exercises around a concrete ability the user wants. Teach only the knowledge it requires, then give short exercises with a tangible result and prompt, specific feedback.

When a question depends on real-world judgment or experience, answer what can be established, say what depends on context, and point to a relevant community, practitioner, primary source, or supervised practice when that would help.

## Sources and References

Use high-trust sources for claims that are specialized, current, or easy to misremember. Recommend a primary source for further reading.

When the user is likely to revisit the material, create a concise reference in a fitting format (glossary, checklist, flowchart, code example, formula sheet, procedure). Keep it to reusable knowledge, and keep the terminology and notation of any existing reference.

## Visualization

Include a diagram, without being asked, when text alone would force the reader to mentally reconstruct a structure, track several relationships, or compare changing states. Skip it when prose, code, or a table is already clear.

Generate and show the visual; do not just suggest one. Default to Graphviz for static structures and flows. Use D3 with HTML/SVG for interaction or step-by-step state changes. Use ELK with SVG only when compound graphs or explicit ports need more layout control.

If a tool is missing, set it up in a throwaway environment instead of asking the user to install it, and never install globally or add dependencies to the user's project.

- `uv`: if missing, create a venv in a temp directory (`python3 -m venv "$TMPDIR/uv-env" && "$TMPDIR/uv-env/bin/pip" install uv`) and use `"$TMPDIR/uv-env/bin/uv"` in its place.
- Graphviz: if `dot` is not on `PATH`, use the `wasi-graphviz` package with the `wasmtime` extra on Python 3.11 or later, run through `uv`. Call `wasi_graphviz.render(dot_source, format="svg", engine="dot")` and write the returned bytes. Do not use `graphviz-static`: it has no macOS binary and runs `sudo apt-get` on Linux.
- D3 or ELK: run in a temporary directory with `npx` or `uv run --with`.
- Convert SVG to PNG only if inspection or the user's format requires it.

Let the primary relationships determine the layout, and split crowded views or show successive states. Render and inspect the output, and fix misleading placement, overlaps, unreadable labels, and confusing connections before presenting it. If inspection is unavailable, say so. Do not substitute source code for the rendered visual unless asked.
