# CLI output design reference

These recipes capture the visual language of skm's list/action output, desk's file list and startup report, and the Pi setup script. The examples show visible characters; styling instructions specify what plain text cannot show. Adapt the nouns and actual data, not the visual grammar. Pick the recipe that fits the command rather than combining all of them.

## Inventory: skm and desk

```text
Repository  ~/work/skills
Target      ~/project/.agents/skills

Skills (2 of 4 installed)
  ● code-review  installed
  ○ research
  ● tdd  installed
  ○ to-spec

Groups (2)
  dev:    code-review, research, tdd, to-spec
  teach:  teach
```

- The metadata labels are dim and padded to a shared column; their values are normal. Use only metadata that helps interpret the list.
- Section name is bold; its parenthesized count is dim. There is no section icon, colon, box, or divider.
- Indent rows two spaces. The active marker is green, its item name bold, and its trailing status green; inactive marker is dim and name normal. There are two spaces before the status. Do not repeat `not installed` on every inactive row.
- Group names including their colons are cyan, aligned by the longest name; members are normal and comma separators dim. Empty lists show an indented dim `(none)` and empty groups show dim `(empty)`.
- Desk uses this same row treatment for `Files (N detected)`, with `opened` for the active file. Use a stable, meaningful order; do not add headings for absent sections merely to imitate this example.

## Batch changes: Pi setup

```text
▸ pi
  ✔ installed  ~/.pi/agent/settings.json
  ✔ updated  ~/.pi/agent/models.json
  • unchanged  ~/.pi/agent/AGENTS.md

  1 new · 1 updated · 1 unchanged
```

- Start a batch section with a blank line, then `▸ ` and a short lowercase label in bold cyan. Indent rows two spaces. Color only `✔` green; keep the action and path normal. Render the entire unchanged row after its indentation dim. Use `!` yellow for warnings and `✘` red for failures, with an informative normal-text message.
- Use exactly two spaces between the short action and its target. Do not pad verbs to form a table. Shorten a home path to `~` only for display, never by changing the underlying value.
- Separate the summary from rows with one blank line; indent it two spaces and dim the whole line. Show it when it adds useful batch information, not for a single trivial action. If a dry run is supported, say `would install`/`would update` and prefix the summary `dry run · `. Report backup location separately when relevant.
- An isolated action can be one line without a section or summary: skm uses a green `✔`, a colored action and bold item name, e.g. `✔ linked code-review`. These are alternative treatments, not a reason to mix styles within a single batch.

## Startup report: desk

```text
desk  http://localhost:3000  (live)
  ~/project/.desk

Files (3 detected)
  ○ CONTEXT.md
  ● architecture/search.md  opened
  ○ features/login/spec.md

  2 features · 3 tickets (1 done) · 1 architecture record
```

Keep the first line compact: program, address, then state separated by two spaces. Put the root on the next line, indented two spaces. Use the inventory styling above for the list and a single indented summary line below it. This is a startup snapshot, not a template for every command.

## Tables, empty states, help and errors

For rows with multiple equal-status fields, use a borderless table: uppercase headers, columns separated by two spaces, width derived from the visible cell contents, no trailing padding on the last column. Do not embed ANSI escapes in width calculations; account for display width where the project supports wide characters. For an empty server list desk instead prints `desk: no running servers`—not an empty table, success icon and summary together. A one-off result can be `desk: stopped 1234 (http://localhost:3000)`.

Help uses plain `Usage:`, `Commands:` and `Options:` blocks with aligned descriptions; do not wrap every option in decorative punctuation. A failure is brief and actionable, e.g. `desk: no running server with PID 1234; run "desk list"`. Preserve the project's existing stderr and exit-code contract.

## Restraint and checks

- Use one visual accent per purpose. Do not color whole lines of successful actions, every value, or every heading; avoid emoji, boxes, banners, excessive icons, borders, gradients and progress animation unless explicitly requested.
- Color is emphasis, not content. A redirected/plain-text version must convey the same states. TTY color should follow the program's existing `NO_COLOR`, `FORCE_COLOR` and terminal policies, evaluated per output stream. Do not require ANSI or Unicode for meaning.
- Inspect actual rendered output, not just the source. Compare the result with the relevant recipe line by line: indentation, blank lines, alignment, density, marker placement and styled spans. Verify both TTY color and redirected plain text where the environment permits. Do not replace color with literal markup in the output.
