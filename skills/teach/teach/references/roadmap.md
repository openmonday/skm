# Roadmap lessons

A roadmap is `.lessons/<topic>/roadmap.json`: an ordered list of planned lessons, each with a `slug`, `title`, `objective`, `requires` (slugs of earlier lessons), and `status` (`planned`, `done`, or `skipped`).

Find the requested entry by slug or title. If none matches, list the `planned` entries and ask which one.

- The entry's `objective` is the lesson's objective (step 2), and its `slug` is the lesson slug.
- Lessons in its `requires` with status `done` are settled prerequisites (step 1). Read their lesson files and reuse their example and terms where they fit.
- Lessons in its `requires` with status `skipped` remain unsettled until checked in step 1.
- If step 1 or step 3 reveals a missing prerequisite, repair a small concept inline; if an entire prerequisite lesson's capability is missing, pause the current lesson, record the gap in `.lessons/learner.md`, and recommend taking that prerequisite lesson first.
- After step 5, mark the entry done using the script in this skill's folder (`<skill-dir>`):

  ```bash
  node <skill-dir>/scripts/mark-done.mjs <project>/.lessons/<topic>/roadmap.json <slug>
  ```

  It changes only that entry's `status`, and refuses when the slug is unknown or the lesson file is missing.
