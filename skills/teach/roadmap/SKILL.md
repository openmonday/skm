---
name: roadmap
description: Plans a learning roadmap for a subject as ordered lessons with prerequisites, saved to .lessons/<topic>/roadmap.json.
disable-model-invocation: true
argument-hint: "What subject should the roadmap cover?"
---

# Plan roadmap

A roadmap splits one subject into lessons, each with one objective, ordered so every lesson comes after the lessons it builds on. It records the plan only: lessons are taught and written later, one at a time, and each finished lesson marks its own entry `done`.

## 1. Gather context

Read `.lessons/learner.md` when it exists: it records what the user already knows, the gaps they have shown, and how they prefer to learn. Read `.lessons/<topic>/` for an existing roadmap and lesson folders.

Ask the user to clarify anything not already stated in their prompt or `.lessons/learner.md`. Keep it to one concise turn of 2–4 focused questions:

- **Goal**: what they want to use the subject for or accomplish with it.
- **Target depth**: how far they need to go, with concrete options to pick from (such as conceptual overview, working proficiency, or deep internals).
- **Background**: any relevant experience or constraints that change which lessons to include.

When a roadmap already exists for the topic, skip re-asking the overall goal and depth; ask only about the scope and depth of the requested additions or changes.

Wait for the user's answers before drafting the roadmap.

## 2. Draft the lessons

Write the roadmap's **goal**: what the user can do after the last lesson.

Split the subject into 4–12 lessons. When the user's goal is narrower than 4 lessons or broader than 12, use fewer lessons or propose splitting into separate topics rather than padding or cramming. Each lesson has one **objective**: a single thing the user can do or explain afterwards that they could not before, phrased as a checkable action ("explain why the browser blocks the read", "write a generator that streams a file"). Size each lesson to fit one conversation; split a lesson that needs two objectives.

`requires` lists only the lessons whose objectives this one builds on directly, not their prerequisites in turn. Order the list so every lesson appears after everything it requires; within that, put the lessons that unlock the most first.

Leave out lessons for material the profile shows the user already knows, and name those prerequisites in the report instead.

When a roadmap already exists, extend or reorder it as asked. Keep every existing entry's `slug` and `status`; a `done` entry already has a lesson file. When a lesson folder `.lessons/<topic>/<slug>/` exists for a new entry, mark that entry `done`.

## 3. Confirm with the user

Present the drafted roadmap before writing any files: show the proposed save path (`.lessons/<topic>/roadmap.json`), the **goal**, each lesson in order with its **objective** and `requires`, and any known prerequisites left out. Ask the user to approve the plan or request changes. If they ask for revisions, update the draft and present it again for confirmation unless they explicitly tell you to apply the changes and save directly.

**Done** when the user explicitly approves the roadmap.

## 4. Save and check

Save to `.lessons/<topic>/roadmap.json`, creating the folders when absent. `<topic>` is one coarse kebab-case category, such as `web` or `database`; reuse an existing topic folder for the same subject. A topic has one roadmap: extend it rather than starting a second.

```json
{
  "title": "Web cross-origin security",
  "goal": "Diagnose and configure cross-origin browser requests safely",
  "lessons": [
    {
      "slug": "same-origin-policy",
      "title": "Same-origin policy",
      "objective": "Explain what makes two URLs cross-origin and why browsers block cross-origin reads",
      "requires": [],
      "status": "planned"
    },
    {
      "slug": "cors",
      "title": "CORS",
      "objective": "Explain why the browser blocks the dashboard from reading the API's response, and which header lets it",
      "requires": ["same-origin-policy"],
      "status": "planned"
    }
  ]
}
```

- `slug` is kebab-case and unique in the roadmap. The lesson for it lives at `.lessons/<topic>/<slug>/<slug>.md`.
- `status` is `planned`, `done`, or `skipped` (the user chose not to take the lesson; its edges stay so the order still reads).
- These five lesson fields are the whole format. Lesson content, dates, and scores stay out of the roadmap.

Run the checker using the script in this skill's folder (`<skill-dir>`):

```bash
node <skill-dir>/scripts/check-roadmap.mjs <project>/.lessons/<topic>/roadmap.json
```

**Done** when the checker passes: every field is valid, slugs are unique, every `requires` names an earlier lesson, and every `done` lesson has its file. Report the saved path and the lessons ready to teach first (those whose `requires` are all `done` or `skipped`).
