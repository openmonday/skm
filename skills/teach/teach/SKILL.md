---
name: teach
description: Explains a concept or workflow through a concrete problem and a coherent example, with diagrams where they clarify the mechanism.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

# Teach

Each lesson teaches one subject through a concrete problem and a coherent example, and produces two files: a lesson and a reference.

## 1. Ask about the user's knowledge

Before writing, ask what the user already knows about the subject and wait for the answer. Name the prerequisites the lesson would rely on (for CORS: HTTP requests and headers, cookies, what an origin is) so the user can answer about each one. If the request already states their level, use that instead of asking.

## 2. Choose the win

Pick one tangible **win**: a single thing the user can do or explain after the lesson that they could not before, just beyond what they said they know. For CORS, the win might be: explain why the browser blocks the dashboard from reading the API's response, and which header lets it.

State the win at the top of the lesson. Include only the knowledge the win requires; everything else goes to the reference.

## 3. Write the lesson

Start from what the user knows. Define every term they lack, and skip what they said they already know.

Teach through a concrete problem. Give enough context to show what must be accomplished and why the mechanism matters, then use the example to make its behavior visible. Keep one coherent example throughout, developed only as far as the win needs; mention related mechanisms briefly or leave them for further study.

Organize the explanation around the subject's causal structure: what problem exists, how the mechanism addresses it, and what consequences follow. A sequence of improving designs works when each intermediate design reveals something essential. Other subjects are clearer as a direct comparison, a worked execution, or a walk through how a small piece of code behaves.

Write a finished explanation, with headings that name the ideas being explained. Let concrete behavior, code, and diagrams carry the explanation, with prose connecting causes to consequences. Include the details needed to follow the reasoning and avoid a misleading conclusion, and link to the reference where the reader may want to go deeper.

The lesson is complete when the reader can achieve the win: they understand the problem, the mechanism, and why it works.

### Diagrams

Include a diagram, without being asked, when text alone would force the reader to reconstruct a structure, track several relationships, or compare changing states. Use prose, code, or a table when they are already clear.

Place each diagram beside the explanation it supports. If a diagram names concrete rows, pages, states, or values, the prose names the same ones.

Render the diagram and show it, rather than suggesting one or showing its source:

- Graphviz for static structures and flows.
- D3 with HTML/SVG for interaction or step-by-step state changes.
- ELK with SVG only when compound graphs or explicit ports need more layout control.

Check the tools first (`dot -V` for Graphviz, `npx --version` for D3 or ELK). If a tool or package is missing, stop and ask the user to install it; never create environments, install packages, or add dependencies to the user's project. Convert SVG to PNG only if inspection or the user's format requires it.

Let the primary relationships determine the layout; split crowded views or show successive states. Inspect the rendered output and fix misleading placement, overlaps, unreadable labels, and confusing connections before presenting it. If inspection is unavailable, say so.

## 4. Write the reference

The reference is the practical lookup for using the subject mid-task: precise signatures, rules, formulas, cases, costs, limitations, and pitfalls. It holds the exhaustive cases, API options, implementation variations, and secondary pitfalls the lesson leaves out, and can go beyond the lesson's example. Use concise entries, tables, and short code examples in the lesson's terminology and notation. The lesson and reference complement each other; each covers what the other does not.

## Files

```
.lesson/database/b-plus-tree/
  b-plus-tree.md
  b-plus-tree-reference.md
  diagrams/
    tree-shape.dot
    tree-shape.svg
```

- Path: `.lesson/<topic>/<lesson-slug>/`, created when absent.
- `<topic>` is one coarse kebab-case category, such as `database` or `cpp`. Put later lessons on the same subject under the existing topic.
- `<lesson-slug>` is kebab-case, such as `b-plus-tree`. The lesson is `<lesson-slug>.md` and the reference is `<lesson-slug>-reference.md`.
- Diagrams and other generated artifacts go in `diagrams/`, created only when needed and linked with relative paths (`diagrams/tree-shape.svg`).

## Sources

Use high-trust sources for claims that are specialized, current, or easy to misremember. Name the primary source for further reading.

## Example

An excerpt for the question: Why does a browser restrict cross-origin reads, and what is CORS for?

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

For methods and headers that require a preflight, the browser first sends an `OPTIONS` request to check permission. It sends the actual request only if that check succeeds. Whether a request needs preflight depends on its method, headers, and content type, not simply on whether it changes server state.
