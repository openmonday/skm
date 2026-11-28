---
name: research
description: Explain how reference projects implement a feature and assess how their approaches fit the current project.
disable-model-invocation: true
argument-hint: "Which feature or architecture change? Optional: reference paths or URLs."
---

# Research

Produce a research report that explains how a feature works by reconstructing it from the problem up, then grounding every step in real reference code. Then recommend how to build it in this project. The goal is that the user understands the design well enough to make their own decisions about it.

## Reader

The reader has a solid computer foundation but no software development experience. They understand how computers work (files, processes, memory, networks, the command line) but have never built or maintained a software project. Adjust if the user says otherwise.

- Explain programming constructs (types, interfaces, callbacks, error values, async code) the first time the story needs them, in one or two plain sentences tied to the running example.
- Explain how a software project is organized (modules, layers, tests, build and dependency tooling) only as far as the feature requires.
- Introduce engineering terms (dependency injection, event loop, back-pressure, idempotency) only when the story needs them, and define each in one sentence when it first appears.
- Prefer analogies to how the operating system, files, or networks behave over analogies to other programming languages.

## Workspace

Use the terms in `.context/GLOSSARY.md`. Keep new reference checkouts under `.context/reference/`. Leave existing references and the user's code unmodified.

Save the report as `.context/issues/<issue-slug>/research.md`. Put each diagram's Graphviz source (`.dot`) and rendered `.svg` in `.context/issues/<issue-slug>/assets/`, and link the SVG from the report as `assets/<diagram>.svg`. Save a concepts file, when one is needed, as `.context/issues/<issue-slug>/concepts.md`, beside `research.md`. Use the relevant issue directory or choose a descriptive slug; ask if the intended issue is ambiguous.

## 1. Choose references

- State the feature in one sentence, in the user's terms. Ask only if the feature is ambiguous.
- Start with the paths or URLs the user explicitly provided. Read local files and folders in place, whether or not they are Git repositories. Read supplied project pages and documentation at their URLs. For a supplied Git repository URL, reuse a matching checkout or clone it into `.context/reference/<project-slug>/`.
- If the user supplied no references, inspect `.context/reference/` and read the projects relevant to the feature. A missing or empty directory is not a blocker.
- After a first pass, list the important mechanisms or questions the current references cannot explain. Unless the user restricts the scope, search GitHub for those gaps and clone the best matching public projects into `.context/reference/`. Prefer maintained projects with clear code, tests or documentation, a clear license, and substantial adoption or many stars. Relevance comes before stars: a popular project that doesn't implement the missing mechanism is not evidence. Reuse a matching local checkout; never overwrite, pull, or switch an existing one without asking. Clone only what you need, and don't install dependencies or run setup scripts just to inspect it.
- Use legible project labels and cite the files and lines you actually read. Record a URL, version, or short revision only if it helps the reader find or distinguish the evidence. A source inventory and full commit SHAs are not required, including for local snapshots.

**Done:** the feature is stated, the available references have been read or queued for exploration, and gaps have either led to useful additional references or been explicitly noted.

## 2. Locate the feature in each reference

Find where the feature lives before reading deeply. Search by user-visible names (commands, config keys, error messages, flags), then follow callers and callees. Read the feature's **tests** early: they show the contract (inputs, outputs, edge cases) more reliably than comments. Read design docs, architecture decision documents, or well-known talks and posts about the project when they exist, and cite them.

For several or large references, run one exploration subagent per reference in parallel. Each returns entry points, the call tree, key types, and `<project-slug>:<file>:<line>` citations, but no conclusions about the user's project.

Tag every claim internally as **verified** (you read the code or ran it) or **inferred** (from names, docs, or partial reading). Running a reference's existing tests to confirm behavior is fine. Do not install dependencies or change the reference to do it.

**Done:** for each reference, the entry points and main call path are identified with citations, and the relevant tests are cited or the test search and its result are noted.

## 3. Explain the references

Write `## The problem`, `## How the references solve it`, and (when there are several references) `## Comparison`, following the report format below. Base them only on the references, before looking at the user's project, so the analysis is not bent toward the current code.

- If the core mechanism or algorithm cannot be explained in a few sentences in `## How the references solve it`, move the key concepts and core algorithms into `concepts.md` and link it from there.
- Draw a diagram of where the feature sits in the reference, and of any flow with more than three hops or changing state. Write each as a `.dot` file in `assets/`, render it with `dot -Tsvg`, and inspect the SVG for overlaps, unreadable labels, and misleading connections; fix and re-render. Check `dot -V` first. If Graphviz is missing, ask the user whether to install it or continue with a hand-written minimal SVG. Never install tools.

**Done:** `## The problem`, `## How the references solve it`, and `## Comparison` (when applicable) are filled, every code claim has a file-and-line citation, diagrams are rendered and inspected, and any limitation or evidence gap is stated. Diagrams that could not be verified are reported in the summary.

## 4. Map onto this project

Write `## Options for this project`, `## Recommendation`, `## Files to create and modify`, `## Open questions`, and `## Glossary`. Read the parts of the user's project the feature would touch. For those files, run `scripts/query-map.py <file>...` from the project root and read every module file it lists. Name each Constraint or Architecture statement an option would break. If the project has no relevant code yet, say so and design the smallest starting shape.

Compare at least two options for this project, weighing pros and cons against the project's scale and constraints. Recommend one, then give its module structure and the files to create or modify. Recommend, but do not write specs or change code.

**Done:** every option cites the relevant project files and `.context/map/` module files where they exist, or says what was checked and what is missing; `## Recommendation` gives the module structure and `## Files to create and modify` lists the files; `## Open questions` lists every decision left to the user.

## 5. Save and summarize

Save the report as `.context/issues/<issue-slug>/research.md` and its diagrams and concepts file alongside it. Update an existing report on the same topic instead of starting a second one.

Then tell the user the report path, the key design idea and recommendation in three to five lines, and the open questions. Stop there. Answer follow-up questions inline, and update the report when an answer changes it.

**Done:** the report is saved and the user has the summary.

## Report format

```markdown
# <Feature>: research

Date: <YYYY-MM-DD>
References:

- <local path or URL of each reference>

## The problem

What the feature must accomplish, from the user's point of view, with one concrete example used through the whole report.

## How the references solve it

The solution in plain words, built up from the problem: each part, why it is needed, and what breaks without it. Start with where the feature lives: its entry point and the call path to its effect (diagram: `assets/<diagram>.svg`). Cite code as `<project-slug>:<file>:<lines>` and say what the code does. Quote only short excerpts. Mark inferred claims as inferred. Link `concepts.md` when it exists.

## Comparison

Only when there are several references: a short table of the decisions that differ, and what drives each one.

## Options for this project

At least two options, each as:

### Option <letter>: <name>

- Idea: one or two sentences.
- Pros:
- Cons:
- Constraints it would break: the `.context/map/` statements, or none.
- Files it touches: project files and `.context/map/` module files.

## Recommendation

The option to build and why, in a few sentences. Then the module structure as a tree, with one line per module on its responsibility. Mark new modules `(new)`.

## Files to create and modify

- Create: `path` — purpose.
- Modify: `path` — change.

## Open questions

Decisions the user must make, each with the options and your recommended answer.

## Glossary

Terms introduced in the report, one line each, in plain language.
```
