---
name: teach
description: Teaches a concept or workflow in conversation through a concrete problem and a coherent example, then writes it up as a lesson.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

# Teach

Each lesson teaches one subject through a concrete problem and a coherent example: first in conversation, then recorded as a lesson file once the user understands.

## 1. Check the user's knowledge

Read `.lessons/learner.md` if it exists to see the user's approximate knowledge level. Name the prerequisites the lesson relies on (for CORS: HTTP requests and headers, cookies, what an origin is).

If `.lessons/learner.md`, the request, or the conversation already makes their level clear, state what you assume they know in one line and continue. Otherwise ask what they already know about those prerequisites and wait for the answer.

## 2. Choose the objective

Pick one tangible **objective**: a single thing the user can do or explain after the lesson that they could not before, just beyond what they know. For CORS: explain why the browser blocks the dashboard from reading the API's response, and which header lets it.

State the objective before teaching. Include only the knowledge it requires; mention related material briefly or leave it for further study.

## 3. Teach in conversation

Teach the lesson as a dialogue, and write the lesson file only after this step is complete.

Start from what the user knows, define every term they lack, and skip what they already know.

Teach through a concrete problem: give enough context to show what must be accomplished and why the mechanism matters, then use one coherent example to make its behavior visible, developed only as far as the objective needs.

Organize the explanation around the subject's causal structure: what problem exists, how the mechanism addresses it, and what consequences follow. A sequence of improving designs works when each intermediate design reveals something essential; other subjects are clearer as a direct comparison, a worked execution, or a walk through how a small piece of code behaves.

Present one step of that structure per message, ending with a lightweight check or prediction prompt, then wait for the user's reply. Answer their questions and repair misunderstandings in the same example before moving on; if they already grasp a step or ask to move faster, advance directly.

When a step involves structure, relationships, flows, or changing states, render an SVG diagram to `assets/` **first** and explain with it—do not wait to be asked, and do not fall back to text-only descriptions or ASCII art when an SVG can be rendered. Read [references/assets.md](references/assets.md) before rendering the first diagram.

The step is complete when the user can achieve the objective: ask one question that applies the objective to the example, and continue teaching until they answer it correctly in their own words, or until they ask for the files. For hands-on coding, config, or debugging objectives, see [references/lab.md](references/lab.md).

## 4. Write the lesson

Read [references/example-lesson.md](references/example-lesson.md), then write the lesson as a finished explanation of what the conversation taught, in the same example, terms, and diagrams. State the objective at the top, and fold in the questions the user asked and the explanations that resolved them.

Use headings that name the ideas being explained. Let concrete behavior, code, and diagrams carry the explanation, with prose connecting causes to consequences. Use high-trust sources for claims that are specialized, current, or easy to misremember, and name the primary source for further reading.

The lesson is complete when a reader without the conversation can achieve the objective: they understand the problem, the mechanism, and why it works.

## 5. Update the learner profile

Update `.lessons/learner.md` (creating it from [assets/learner.md](assets/learner.md) if absent) with a brief note of the user's approximate knowledge level (for example, `C++: familiar with syntax` or `HTTP: knows requests and headers`). Keep it short and high-level—just a rough summary of what they know.

## Files

```
.lessons/
  learner.md
  web/                         <topic>: one coarse kebab-case category; reuse an existing one
    cors/                      <lesson-slug>, kebab-case
      cors.md                  <lesson-slug>.md
      assets/                  only when needed; link as assets/preflight-flow.svg
        preflight-flow.dot
        preflight-flow.svg
      lab/                     only when needed for hands-on exercises (see references/lab.md)
```
