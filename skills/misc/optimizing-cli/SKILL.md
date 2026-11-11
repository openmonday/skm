---
name: optimizing-cli
description: Redesigns human-facing command-line output in the restrained style of skm, desk, and the Pi setup script. Applies when improving CLI lists, status messages, reports, help, errors, and terminal styling without breaking scripting interfaces.
disable-model-invocation: true
---

# Optimizing CLI

Make CLI output look deliberate, quiet and easy to scan—not merely colorful. Use the concrete visual recipes in [style-recipes.md](references/style-recipes.md): they encode the spacing, hierarchy, symbols and exact styling of the reference programs. The target project's established conventions and an explicit user preference take precedence, but when asked to improve an inconsistent style, apply these recipes rather than preserving the inconsistency.

## 1. Inspect and choose

Find the relevant commands, shared formatters, help, tests and existing output. Safely capture representative success, empty, warning and error cases, or use fixtures; do not run destructive commands to inspect output. Identify structured output, stdout/stderr routing, exit codes, color controls and known script consumers.

Read [style-recipes.md](references/style-recipes.md), then choose a primary pattern per command: **inventory**, **batch changes**, **startup report**, **table**, or **single result**. Sketch the actual output with representative data before editing. Include the TTY styling of each element, not just the uncolored text. Prefer one cohesive treatment over a mixture of decorative elements. For a design-only request, present the sketch; for an implementation request, implement it.

Treat existing output as a compatibility surface: preserve structured output, stream routing and exit codes. If a visual change would break a known consumer or a documented contract, explain the tradeoff and ask before changing it. Do not alter operations, prompts, or permissions just to restyle them.

**Done:** The output contract and chosen visual pattern are clear, and a concrete sample covers the important states.

## 2. Implement the visual design

Follow the selected recipe's actual spacing and styling, including the distinction between a bold heading with dim count, a green marker with normal action text, and a dim unchanged row. Use only meaningful sections, rows and summaries. Keep states intelligible without color; use accurate action words and distinguish dry runs from completed work. Reuse existing formatters and libraries where suitable, and keep presentation separate from operations where practical.

Render colors only under the project's terminal and color-control policy; never add decoration to structured output. Keep JSON and similar machine-readable stdout free of progress and diagnostics. Do not add a new output mode or dependency unless needed and in scope.

**Done:** The actual result matches the chosen recipe's visual hierarchy and reflects real operation outcomes.

## 3. Compare and verify

Run the command with representative fixture data and **inspect the rendered output** against the chosen recipe, including blank lines, two-space indentation and gaps, alignment, density, symbols and color placement. Inspect both colored terminal output and redirected plain output when available; if terminal rendering cannot be inspected, say so rather than claiming visual validation. Refine the result if it looks cluttered or inconsistent. Avoid relying solely on unit tests or uncolored snapshots to judge appearance.

Add or update focused tests for relevant success, empty, warning and failure cases, dry runs where applicable, and redirected output without ANSI escapes. Verify stream routing, exit codes, structured output, and long or varied values. Exercise color-enabled output when supported. Run the relevant suite and report the visual checks, tests and any remaining limitations.

**Done:** The presentation has been visually compared with the recipe and its behavioral and machine-interface contracts are verified, or any unverified check is explicitly reported.
