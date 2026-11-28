# Development workflow

```text
/setup-context
      |
  /draw-map
      |
  /research (optional)
      |
  /grill-me
      |
  /to-issues
      |
  /implement  <-- once per ready issue, in blocker order
      |
  /draw-map
```

| Skill                  | Reads                        | Produces                                                                                    |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| `setup-context`        |                              | `.context/` workspace, excluded through `.git/info/exclude`                                 |
| `draw-map`             | committed code               | `.context/map/` module files that cover every file, with current `since` and logged violations |
| `research`             | reference projects           | `.context/issues/<slug>/research.md`                                                        |
| `grill-me`             | code, map                    | a shared understanding of the plan                                                          |
| `to-issues`            | the conversation, code, map  | `.context/issues/<slug>/spec.md` and `modules.md` for each small issue                      |
| `implement`            | one issue, its change set    | one commit on the current branch                                                            |
| `show-me`, `wait-what` | the conversation             | a visual or a simpler re-explanation, at any point                                          |

`spec.md` says what an issue changes and why. `modules.md` names the change set, the dependency chain around it, and the contracts of neighboring modules, so `/implement` reads only the modules it edits.

Each skill assumes the earlier ones have done their job. Run `/draw-map` after committing, so the map describes the new code.
