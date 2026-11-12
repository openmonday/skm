---
name: setup-context
description: Create the local `.context/` workspace and exclude it from Git.
disable-model-invocation: true
---

# Set up the context workspace

Run `scripts/setup-context.sh` from the project root. It creates the following and excludes `.context/` through `.git/info/exclude`:

- `.context/GLOSSARY.md`: domain terms.
- `.context/map/`: records of the committed code.
- `.context/issues/`: specs, tasks, and research, one folder per issue.
- `.context/reference/`: checkouts of reference projects.

Existing content is kept. If the script reports a conflict, show it to the user and rerun once they resolve it.
