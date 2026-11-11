---
name: research
description: Explain how reference projects implement a feature and assess how their approaches fit the current project.
disable-model-invocation: true
argument-hint: "Which feature or architecture change, and which reference projects (name with Git URL, or local path)?"
---

# Research

Produce a research report that explains how a feature works by reconstructing it from the problem up, then grounding every step in real reference code. The goal is that the user understands the design well enough to make their own decisions about it.

## Reader

The reader has a solid computer foundation but no software development experience. They understand how computers work (files, processes, memory, networks, the command line) but have never built or maintained a software project. Adjust if the user says otherwise.

- Explain programming constructs (types, interfaces, callbacks, error values, async code) the first time the story needs them, in one or two plain sentences tied to the running example.
- Explain how a software project is organized (modules, layers, tests, build and dependency tooling) only as far as the feature requires.
- Introduce engineering terms (dependency injection, event loop, back-pressure, idempotency) only when the story needs them, and define each in one sentence when it first appears.
- Prefer analogies to how the operating system, files, or networks behave over analogies to other programming languages.

## Workspace

If `.desk/AGENTS.md` is missing, stop and tell the user that the Desk workspace is not initialized. Read `.desk/CONTEXT.md` when present.

This skill owns `.desk/refs/` reference checkouts and `.desk/research/` reports. Never modify a reference checkout or the user's code. In a shared-worktree run, return the report and any new reference to the coordinator to save.

## 1. Pin the inputs

- State the feature in one sentence, in the user's terms. Ask only if the feature is ambiguous.
- For each reference project the user named, choose a `<project-slug>` (the project's own name, lowercase) and make sure `.desk/refs/<project-slug>/` is a checkout of that project:
  - Already present: verify it is a Git repository and that its source matches the requested project. If its identity is unclear or it is the wrong project, ask the user before proceeding. Reuse it at its current commit; ask before pulling or switching commits, because existing reports cite that commit.
  - Given as a Git URL: `git clone <url> .desk/refs/<project-slug>`.
  - Given as a local Git repository: create a symbolic link at `.desk/refs/<project-slug>` to its absolute path. Keep the linked repository unmodified, including its branch and commit.
  - Given as a local path that is not a Git repository, or by name only: ask the user for a Git repository URL or path; never guess one.
- Record each reference's source and full commit SHA (`git -C <ref> rev-parse HEAD`). Use `git -C <ref> remote get-url origin` when available; otherwise record the supplied source or state that it is unavailable. A local origin is a local source, not necessarily an upstream URL. Every code citation in the report identifies the reference and refers to its pinned commit.
- Use only the references the user named.

**Done:** a feature sentence, and every reference checked out under `.desk/refs/` and pinned to a commit.

## 2. Locate the feature in each reference

Find where the feature lives before reading deeply. Search by user-visible names (commands, config keys, error messages, flags), then follow callers and callees. Read the feature's **tests** early: they show the contract (inputs, outputs, edge cases) more reliably than comments. Read design docs, decision records, or well-known talks and posts about the project when they exist, and cite them.

For several or large references, run one exploration subagent per reference in parallel. Each returns entry points, the call tree, key types, and `<project-slug>:<file>:<line>` citations, but no conclusions about the user's project.

Tag every claim internally as **verified** (you read the code or ran it) or **inferred** (from names, docs, or partial reading). Running a reference's existing tests to confirm behavior is fine. Do not install dependencies or change the reference to do it.

**Done:** for each reference, the entry points and main call path are identified with citations, and the relevant tests are cited or the test search and its result are recorded.

## 3. Explain the references

Write sections 1 to 6 of the report, following the format and writing rules below. Base them only on the references, before looking at the user's project, so the analysis is not bent toward the current code.

**Done:** sections 1 to 6 are filled or marked not applicable, every code claim has a pinned citation, and diagrams have been rendered and inspected where possible; any limitation is reported.

## 4. Map onto this project

Write sections 7 and 8. Read the relevant parts of the user's project, `.desk/CONTEXT.md`, and the arch records for the areas involved, following [arch record discovery and compliance](ARCH-RECORDS.md). If the project has no relevant code yet, say so and describe the minimal starting shape instead.

Keep section 7 to suggestions with trade-offs. Do not decide, write specs, or change code.

**Done:** section 7 cites relevant project files and arch records for each suggestion where they exist; otherwise it says what was checked and what is missing. Section 8 lists every decision left to the user.

## 5. Save and summarize

Save the report and diagrams in the workspace locations, with relative links to diagrams. Update an existing report on the same topic instead of starting a second one.

Then tell the user the report path, the key design idea in three to five lines, and the open questions. Stop there. Answer follow-up questions inline, and update the report when an answer changes it.

**Done:** the report is saved and the user has the summary.

## Report format

```markdown
# <Feature>: research

References: `.desk/refs/<project-slug>` @ <full commit SHA> (source: <URL or path, or unavailable>), ...
Date: <YYYY-MM-DD>

## 1. The problem
What the feature must accomplish, from a user's point of view, with one concrete running example used through the whole report.

## 2. Simplest workable version
A minimal solution in short, commented pseudocode, written by you, not taken from a reference.

## 3. From simple to real
Repeat for each pressure the references actually handle:
### 3.n <Pressure>: <what breaks>
- The new requirement and how the previous version fails it (inability vs. mere inconvenience).
- The change that fixes it and why it works.
- Where the reference does this: `<project-slug>:path/to/file.c:120-148` with a short quoted excerpt (only the lines that carry the idea), and what each part does.

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
- Arch record Constraints the feature would conflict with, as candidates to supersede.
- Risks, and the smallest first slice worth building.

## 8. Open questions
Decisions the user must make, each with the options and a recommended answer.

## Glossary
Terms introduced in the report, one line each, in plain language.
```

Writing rules:

- **Problem before mechanism.** Every mechanism answers a need already established in the running example. Never present a component before the reader knows why it exists.
- **Explain code, not just paths.** For each excerpt, say what calls it, what it receives, what it returns or changes, and why it is shaped that way. A citation without an explanation is not enough.
- **Quote sparingly.** Use the shortest excerpt that shows the idea, preserved exactly, with an ellipsis comment for skipped lines. Cite `<project-slug>:<file>:<lines>` relative to the reference root at its pinned commit.
- **Present it as reconstruction, not history.** Say "a simpler version would fail because...", not "the authors first tried...", unless commit history or docs show it.
- **Stay honest.** Do not invent limitations, overstate a reference, or imply its design is the only correct one. Keep verified and inferred claims distinguishable.
- **Show evidence gaps.** If tests or design rationale cannot be found, say what was searched and what remains unknown. Mark a report item not applicable when it does not fit the feature; do not treat missing evidence as not applicable.
- **Visualize when structure matters.** Draw the module position (section 4) and any flow with more than three hops or changing state. Default to Graphviz. Check `dot -V` first. If it is missing, use Mermaid in the Markdown and tell the user. Never install tools. Render and inspect diagrams when possible; fix overlaps or misleading layout. If rendering or inspection is unavailable, say what could not be verified in the report and summary.
