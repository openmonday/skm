# Diagrams

Render each diagram to SVG in the lesson's `assets/` folder and show it, rather than suggesting one or showing its source:

- Graphviz for static structures and flows.
- D3 for step-by-step state changes, rendered to one static SVG per state.
- ELK with SVG only when compound graphs or explicit ports need more layout control.

Check the tools first (`dot -V` for Graphviz, `npx --version` for D3 or ELK). If a tool or package is missing, ask the user whether they want to install it or continue with a hand-written minimal SVG or ASCII diagram; keep environments and project dependencies untouched.

Let the primary relationships determine the layout; split crowded views or show successive states. Place each diagram beside the explanation it supports, and when it names concrete rows, pages, states, or values, the prose names the same ones.

Inspect the rendered output and fix misleading placement, overlaps, unreadable labels, and confusing connections before presenting it. If inspection is unavailable, say so.

The lesson reuses the diagrams shown in conversation. Lessons are read as rendered Markdown, which strips scripts and embedded pages, so embed them as SVG images only.
