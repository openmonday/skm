---
name: teach
description: Teaches a concept or workflow in conversation through a concrete problem and a coherent example, then writes it up as a lesson.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

# Teach

Each lesson teaches one subject through a concrete problem and a coherent example: first in conversation, then recorded as a lesson file once the user understands.

When the request names a lesson from a roadmap, read [references/roadmap.md](references/roadmap.md) first; it supplies the objective and the extra final step.

## 1. Read the learner profile

Read `.lessons/learner.md` (see Learner profile). Name the prerequisites the lesson relies on (for CORS: HTTP requests and headers, cookies, what an origin is). A prerequisite is **settled** when the profile, the request, or this conversation shows whether the user knows it.

When every prerequisite is settled, open the teaching with one line naming what you assume the user knows, and continue. Otherwise ask about only the unsettled prerequisites, in one message, and wait.

## 2. Choose the objective

Pick one tangible **objective**: a single thing the user can do or explain after the lesson that they could not before, just beyond what they know. For CORS: explain why the browser blocks the dashboard from reading the API's response, and which header lets it.

State the objective before teaching. Include only the knowledge it requires; mention related material briefly or leave it for further study.

## 3. Teach in conversation

Start from what the user knows and define every term they lack.

Teach through a concrete problem: enough context to show what must be accomplished and why the mechanism matters, then one coherent example that makes its behavior visible, developed only as far as the objective needs.

Organize the explanation around the subject's causal structure: what problem exists, how the mechanism addresses it, and what consequences follow. A sequence of improving designs works when each intermediate design reveals something essential; other subjects are clearer as a direct comparison, a worked execution, or a walk through how a small piece of code behaves.

Present one step of that structure per message, then wait for the user's reply. Answer their questions and repair misunderstandings in the same example before moving on.

When text alone would force the reader to reconstruct a structure, track several relationships, or compare changing states, render an SVG diagram and explain with it, without being asked; read [references/diagrams.md](references/diagrams.md) before the first one.

The step is complete when the user can achieve the objective: ask one question that applies the objective to the example, and keep teaching until they answer it correctly in their own words, or until they ask for the files.

## 4. Write the lesson

Read [references/example-lesson.md](references/example-lesson.md), then write the lesson as a finished explanation of what the conversation taught, in the same example, terms, and diagrams. State the objective at the top, and fold in the questions the user asked and the explanations that resolved them.

Use headings that name the ideas being explained. Let concrete behavior, code, and diagrams carry the explanation, with prose connecting causes to consequences. Use high-trust sources for claims that are specialized, current, or easy to misremember, and name the primary source for further reading.

The lesson is complete when a reader without the conversation can achieve the objective: they understand the problem, the mechanism, and why it works.

## 5. Update the learner profile

The step is complete when `.lessons/learner.md` records every prerequisite the user confirmed or denied, whether they answered the check question, and every misreading this lesson repaired.

## Learner profile

`.lessons/learner.md` is one profile across all topics, so later lessons skip questions earlier ones answered. When it is absent, step 1 asks about every prerequisite; create the profile from [assets/learner.md](assets/learner.md) with those answers before teaching, replacing every placeholder line and dropping a section's placeholder when it has no entry yet. The lesson link on a Knows entry is optional.

- Each **Knows** entry ends with its evidence: `stated` (the user said so), `checked` (they answered the check question), or `covered` (taught, but they asked for the files before answering). Only `stated` and `checked` settle a prerequisite.
- **Gaps** holds prerequisites the user said they lack and misreadings they showed; move an entry to Knows once a later lesson resolves it.
- **Preferences** holds only what the user asked for or what held across two or more lessons.
- Edit entries in place: merge duplicates, upgrade evidence, delete what a later lesson disproved. Keep it under 80 lines; it is a summary, not a log.

## Files

```
.lessons/
  learner.md
  web/                         <topic>: one coarse kebab-case category; reuse an existing one
    cors/                      <lesson-slug>, kebab-case
      cors.md                  <lesson-slug>.md
      diagrams/                only when needed; link as diagrams/preflight-flow.svg
        preflight-flow.dot
        preflight-flow.svg
```
