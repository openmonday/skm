---
name: plan-roadmap
description: Plans a learning roadmap for a subject as ordered lessons with prerequisites, saved to .lessons/<topic>/roadmap.json.
disable-model-invocation: true
argument-hint: "What subject should the roadmap cover?"
---

# Plan roadmap

A roadmap splits one subject into lessons, each with one objective, ordered so every lesson comes after the lessons it builds on. It records the plan only: lessons are taught and written later, one at a time, and each finished lesson marks its own entry `done`.

## 1. Gather context

Read `.lessons/learner.md` when it exists: it records what the user already knows, the gaps they have shown, and how they prefer to learn. Read `.lessons/<topic>/` for an existing roadmap and lesson folders.

Ask the user only when the subject's end goal is ambiguous enough to change the lessons ("Rust" for embedded firmware versus web services). Otherwise assume the most likely goal and state it in the report.

## 2. Draft the lessons

Write the roadmap's **goal**: what the user can do after the last lesson.

Split the subject into 4–12 lessons. Each lesson has one **objective**: a single thing the user can do or explain afterwards that they could not before, phrased as a checkable action ("explain why the browser blocks the read", "write a generator that streams a file"). Size each lesson to fit one conversation; split a lesson that needs two objectives.

`requires` lists only the lessons whose objectives this one builds on directly, not their prerequisites in turn. Order the list so every lesson appears after everything it requires; within that, put the lessons that unlock the most first.

Leave out lessons for material the profile shows the user already knows, and name those prerequisites in the report instead.

When a roadmap already exists, extend or reorder it as asked. Keep every existing entry's `slug` and `status`; a `done` entry already has a lesson file. When a lesson folder `.lessons/<topic>/<slug>/` exists for a new entry, mark that entry `done`.

## 3. Save and check

Save to `.lessons/<topic>/roadmap.json`, creating the folders when absent. `<topic>` is one coarse kebab-case category, such as `database` or `python`; reuse an existing topic folder for the same subject. A topic has one roadmap: extend it rather than starting a second.

```json
{
  "title": "Python iteration",
  "goal": "Write and debug generator pipelines over large files",
  "lessons": [
    {
      "slug": "list-comprehension",
      "title": "List comprehensions",
      "objective": "Explain the evaluation order of a nested list comprehension",
      "requires": [],
      "status": "planned"
    },
    {
      "slug": "generators",
      "title": "Generators",
      "objective": "Write a generator that streams a large file line by line",
      "requires": ["list-comprehension"],
      "status": "planned"
    }
  ]
}
```

- `slug` is kebab-case and unique in the roadmap. The lesson for it lives at `.lessons/<topic>/<slug>/<slug>.md`.
- `status` is `planned`, `done`, or `skipped` (the user chose not to take the lesson; its edges stay so the order still reads).
- These five lesson fields are the whole format. Lesson content, dates, and scores stay out of the roadmap.

Run the checker from this skill's folder:

```bash
node scripts/check-roadmap.mjs <project>/.lessons/<topic>/roadmap.json
```

**Done** when the checker passes: every field is valid, slugs are unique, every `requires` names an earlier lesson, and every `done` lesson has its file. Report the goal, each lesson with its objective in order, the known prerequisites left out, and the lessons ready to teach first (those whose `requires` are all `done` or `skipped`).
