---
name: teach
description: Explains a concept or workflow through a concrete problem and a coherent example, with diagrams where they clarify the mechanism.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

# Teach

## Teaching approach

Teach the subject through a concrete problem. Give the reader enough context to understand what must be accomplished and why the mechanism matters, then use the example to make its behavior visible.

Organize the explanation around the subject's causal structure: what problem exists, how the mechanism addresses it, and what consequences follow. A sequence of improving designs works well when each intermediate design reveals something essential. Other subjects are clearer through a direct comparison, a worked execution, or an explanation of how a small piece of code behaves.

Keep a coherent example throughout so the reader can connect each explanation to something already understood. Develop it only as far as needed to explain the requested subject; related mechanisms can be introduced briefly or left for further study.

Write the lesson as a finished explanation, rather than a record of the teaching process. Let section headings identify the ideas being explained. Use concrete behavior, code, and diagrams to carry the explanation, with prose connecting causes to consequences.

Produce two complementary files: a lesson that builds understanding and a reference that supplies the details needed in practice. The lesson is complete when the reader understands the problem, the mechanism, and why it works—not when every related detail has been covered.

## Example

The following excerpt illustrates the approach for the question: Why does a browser restrict cross-origin reads, and what is CORS for?

### Why the browser restricts cross-origin reads

You are building a dashboard at `https://dashboard.example` that reads data from `https://api.example`. These URLs have different origins: an origin consists of a scheme, host, and port.

The browser also runs scripts from sites you do not trust. If any script could read responses from any origin, a malicious page could read private data from another site whenever the browser sent credentials that authorized access. The same-origin policy restricts those reads, but it also prevents your dashboard from reading the API's responses by default.

### How the API permits the dashboard to read a response

CORS lets the API tell the browser which origins may read its responses. For a request from the dashboard, this response header permits that origin:

```http
Access-Control-Allow-Origin: https://dashboard.example
```

The browser checks the header before exposing the response to the dashboard's script. The API has granted read access to that origin; it has not authenticated the user. Requests that include credentials require additional configuration.

### Why blocking a response does not prevent a request

Some cross-origin requests can reach the server even when the browser will not let the script read the response. A server-side action is not undone by hiding its result, so CORS is not a substitute for protection against cross-site request forgery.

For methods and headers that require a preflight, the browser first sends an `OPTIONS` request to check permission. It sends the actual request only if that check succeeds. Whether a request needs preflight depends on its method, headers, and content type—not simply on whether it changes server state.

## Diagrams

Include a diagram, without being asked, when text alone would force the reader to mentally reconstruct a structure, track several relationships, or compare changing states. Skip it when prose, code, or a table is already clear.

Place each diagram beside the explanation it supports. Use it to expose the relevant structure, execution, or change in state. If a diagram names concrete rows, pages, states, or values, the prose must name the same ones.

Generate and show the visual; do not just suggest one. Default to Graphviz for static structures and flows. Use D3 with HTML/SVG for interaction or step-by-step state changes. Use ELK with SVG only when compound graphs or explicit ports need more layout control.

Check that the required tools are installed before rendering (`dot -V` for Graphviz, `npx --version` for D3 or ELK). If a tool or package is missing, stop and ask the user to install it; do not create environments, install packages, or add dependencies to the user's project. Convert SVG to PNG only if inspection or the user's format requires it.

Let the primary relationships determine the layout, and split crowded views or show successive states. Render and inspect the output, and fix misleading placement, overlaps, unreadable labels, and confusing connections before presenting it. If inspection is unavailable, say so. Do not substitute source code for the rendered visual unless asked.

## Output

Write two files for each lesson, both under `.lesson/<topic>/<lesson-slug>/`, creating directories when absent:

```
.lesson/database/b-plus-tree/
  b-plus-tree.md
  b-plus-tree-reference.md
  diagrams/
    tree-shape.dot
    tree-shape.svg
```

`<lesson-slug>.md` is the lesson: a focused explanation of the central idea through a coherent example. Include the details needed to follow the reasoning and avoid a misleading conclusion; leave exhaustive cases, API options, implementation variations, and secondary pitfalls to the reference. Link to it where a reader may want to go deeper.

`<lesson-slug>-reference.md` is the practical lookup: precise signatures, rules, formulas, cases, costs, limitations, and pitfalls relevant to the subject. It can go beyond the lesson's example without expanding the lesson itself. Organize it for consultation mid-task, using concise entries, tables, and short code examples in the lesson's terminology and notation. The two files complement each other rather than repeat the same coverage in different formats.

Use a kebab-case slug, such as `b-plus-tree`. Keep the topic coarse and kebab-case too — one category such as `database` or `cpp` — and put a later lesson on the same subject under the same topic rather than a new one. Name both Markdown files after the directory, and keep every generated diagram and artifact in a `diagrams/` subdirectory beside them, linked with relative paths (`diagrams/tree-shape.svg`). Create the subdirectory only when needed.

## Sources

Use high-trust sources for claims that are specialized, current, or easy to misremember. Name the primary source for further reading.
