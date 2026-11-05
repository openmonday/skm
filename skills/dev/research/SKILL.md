---
name: research
description: Explain how well-known reference projects implement a feature, starting from first principles and pointing into their real code, then map the findings onto the current project. Use before building a feature or changing architecture when the user supplies reference projects (for example `refs/<project>`).
disable-model-invocation: true
argument-hint: "Which feature or architecture change, and which reference projects (e.g. refs/redis)?"
---

# Research

Produce a research report that explains how a feature works by reconstructing it from the problem up, then grounding every step in real reference code. It is `teach` applied to code: the user learns the design so they can make the decisions in `/grill-with-docs` and `/to-spec`.

Read `.desk/AGENTS.md`; if it is missing, ask the user to run `/setup-desk`. Read `.desk/CONTEXT.md` when present. Use only the reference projects the user named, and read them; never modify a reference project or the user's code.

## Reader

By default the reader knows C, Java, and Git but is not a professional developer. Adjust if the user says otherwise.

- Introduce professional terms (dependency injection, event loop, back-pressure, idempotency) only when the story needs them, and define each in one sentence when it first appears.
- Relate unfamiliar language constructs to C or Java equivalents (a Go interface is like a Java interface satisfied implicitly; a Rust `Result` is a return code the compiler forces you to check).
- Use Git vocabulary freely.

## 1. Pin the inputs

- State the feature in one sentence, in the user's terms. Ask only if the feature is ambiguous.
- For each reference project, record its path, its upstream URL if known, and its commit: `git -C <ref> rev-parse --short HEAD`. Every citation in the report refers to this commit.
- If a reference path is inside the user's repository and `git check-ignore -q <ref>` fails, add `/<ref-path>` to the shared exclude file (`git rev-parse --path-format=absolute --git-path info/exclude`), only if that exact line is absent, and tell the user. Reference code must never enter the project's commits.

**Done:** feature sentence, and each reference pinned to a commit.

## 2. Locate the feature in each reference

Find where the feature lives before reading deeply. Search by user-visible names (commands, config keys, error messages, flags), then follow callers and callees. Read the feature's **tests** early: they show the contract (inputs, outputs, edge cases) more reliably than comments. Read design docs, ADRs, or well-known talks and posts about the project when they exist, and cite them.

For several or large references, run one exploration subagent per reference in parallel. Each returns entry points, the call tree, key types, and file:line citations, but no conclusions about the user's project.

Tag every claim internally as **verified** (you read the code or ran it) or **inferred** (from names, docs, or partial reading). Running a reference's existing tests to confirm behavior is fine. Do not install dependencies or change the reference to do it.

**Done:** for each reference, the entry points, main call path, and tests that define the feature are identified with citations.

## 3. Write the report

Save to `.desk/research/<topic-slug>/report.md`, and put diagrams in the same directory, linked by relative path. Reuse and update an existing report on the same topic instead of starting a second one. In a shared-worktree run, return the report to the coordinator to save.

Use this structure:

```markdown
# <Feature>: research

References: `<ref>` @ <commit> (<url>), ...
Date: <YYYY-MM-DD>

## 1. The problem
What the feature must accomplish, from a user's point of view, with one concrete running example used through the whole report.

## 2. Simplest workable version
A minimal solution in pseudocode or small C/Java-style code, written by you, not taken from a reference.

## 3. From simple to real
Repeat for each pressure the references actually handle:
### 3.n <Pressure>: <what breaks>
- The new requirement and how the previous version fails it (inability vs. mere inconvenience).
- The change that fixes it and why it works.
- Where the reference does this: `path/to/file.c:120-148` with a short quoted excerpt (only the lines that carry the idea), and what each part does.

## 4. Where it sits in the reference
- Position: a module/layer diagram showing the feature and its neighbors.
- Entry points and call tree from the trigger down to the effect.
- Inputs: what arrives, from whom, in what form.
- Outputs and side effects: return values, state changes, I/O, events.
- State and invariants it owns or relies on.
- Considerations in between: errors and recovery, concurrency, performance, resource limits, compatibility, security, configuration.

## 5. Why it is designed this way
The forces behind the shape: what each boundary protects, what the design makes cheap and what it makes expensive. Alternatives the reference rejected, or that another reference chose, and when each would be better. Mark inferences as inferred.

## 6. Comparison (several references only)
A table of the decisions that differ between references, and what drives each choice.

## 7. Fit with this project
Suggestions, not decisions:
- Where the feature would sit in this project, and what it would touch (cite files and arch records).
- Which reference approach fits this project's scale and constraints, and what to leave out.
- Arch record Constraints the feature would conflict with. These are candidates for the spec's Supersedes list.
- Risks, and the smallest first slice worth building.

## 8. Open questions
Decisions the user must make, phrased for `/grill-with-docs`.

## Glossary
Terms introduced in the report, one line each, related to C/Java/Git where it helps.
```

Writing rules:

- **Problem before mechanism.** Every mechanism answers a need already established in the running example. Never present a component before the reader knows why it exists.
- **Explain code, not just paths.** For each excerpt, say what calls it, what it receives, what it returns or changes, and why it is shaped that way. A citation without an explanation is not enough.
- **Quote sparingly.** Use the shortest excerpt that shows the idea, preserved exactly, with an ellipsis comment for skipped lines. Cite `file:line` at the pinned commit.
- **Present it as reconstruction, not history.** Say "a simpler version would fail because...", not "the authors first tried...", unless commit history or docs show it.
- **Stay honest.** Do not invent limitations, overstate a reference, or imply its design is the only correct one. Keep verified and inferred claims distinguishable.
- **Visualize when structure matters.** Draw the module position (§4) and any flow with more than three hops or changing state. Default to Graphviz. Check `dot -V` first. If it is missing, use Mermaid in the Markdown and tell the user. Never install tools. Render, inspect, and fix overlaps or misleading layout before saving.

## 4. Map to this project

Write §7 after the reference analysis, so the analysis is not bent toward the current code. Read the relevant parts of the user's project, `.desk/CONTEXT.md`, and the arch records for the areas involved, following "Finding arch records" and "Using arch records" in `.desk/AGENTS.md`. If the project has no relevant code yet, say so and describe the minimal starting shape instead.

Keep §7 to suggestions with trade-offs. Do not decide, write specs, or change code.

**Done:** every section is filled or explicitly marked not applicable, every code claim has a pinned citation, and diagrams render.

## 5. Report back

Give the report path, a three-to-five line summary of the key design idea, the open questions, and the next step: `/grill-with-docs` with the report, then `/to-spec`. Stop when the report is saved; follow-up questions are answered inline and added to the report when they change it.
