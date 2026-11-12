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
   /to-spec
      |
      +-- Small task --> /implement ------------------+
      |                                               |
      +-- Large task --> /to-tasks --> /implement-tasks
                                                      |
                                                 /draw-map
```

| Skill | Reads | Produces |
| --- | --- | --- |
| `setup-context` | | `.context/` workspace, excluded through `.git/info/exclude` |
| `draw-map` | committed code | `.context/map/` records that cover every file, with current `since` and recorded violations |
| `research` | reference projects | `.context/issues/<slug>/research.md` |
| `grill-me` | code, map | a shared understanding of the plan |
| `to-spec` | the conversation | `.context/issues/<slug>/spec.md` |
| `to-tasks` | spec, map | `.context/issues/<slug>/tasks/` |
| `implement` | spec, map | one commit on the current branch |
| `implement-tasks` | spec, tasks, map | an integration branch |
| `show-me`, `wait-what` | the conversation | a visual or a simpler re-explanation, at any point |

Each skill assumes the earlier ones have done their job. Run `/draw-map` after committing, so the map describes the new code.
