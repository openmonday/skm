---
name: show-me
description: Help the user understand the current topic visually with concise diagrams, code-shape sketches, and focused HTML artifacts.
disable-model-invocation: true
---

Help the user understand the current topic of conversation visually. Skip the preamble and keep prose brief. Pick the smallest view that makes the key point clear.

- Show logic or an algorithm as pseudocode:

```text
on(save)
  if content is unchanged
    return cached result
  write new content
  return fresh result
```

- Show runtime control flow as a call tree:

```text
submitForm
  createSession
    persistPrompt
    launchAgent
  navigateToSession
```

- Show UI structure as a component tree, including state and module boundaries that matter:

```tsx
<SessionPage> (apps/example/src/routes/session.tsx)
  useSessionEvents()
  <SessionToolbar>
    <RunSkillButton> (packages/ui)
```

- Show file responsibility or a broad refactor as a shallow file tree:

```text
src/
├── commands/       # parses user actions
├── sessions/       # owns session state
└── transport/      # sends API requests
```

- Show component interaction, control flow, or data flow with Mermaid when the conversation surface renders it:

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Daemon
    User->>UI: choose command
    UI->>Daemon: send expanded prompt
    Daemon-->>UI: stream result
```

- Use `diff` when the point is what changes and the surrounding shape already exists. Match the diff shape to the topic.

For a component change:

```diff
 <SessionPage>
   useSessionEvents()
   <SessionToolbar>
+    <RunSkillButton />
   <SessionTimeline>
+    <SkillResultCard />
```

For a file-layout change:

```diff
 src/
 ├── commands/
+│   └── show-me.ts       # expands the slash command
 ├── sessions/
-└── transport.ts
+└── transport/
+    ├── client.ts
+    └── stream.ts
```

For a call-tree or call-stack change:

```diff
 submitForm
   createSession
     persistPrompt
+    expandSkillMention
     launchAgent
-  navigateToSession
+  navigateToSession
+    subscribeToEvents
```

For a state or control-flow change:

```diff
 on(save)
-  write content
+  if content is unchanged
+    return cached result
+  write new content
+  invalidate cache
```

- Show the whole block when most of it is new, when omitted context would hide ownership or order, or when the user needs a copyable target shape:

```ts
function expandSkill(command: string): string {
  const skillName = command.slice(1)
  return `use the ${skillName} skill`
}
```

- For a visual UI, layout, state comparison, or concept too dense for Mermaid, write one focused HTML file: a diagram, an infographic, or a short slide deck. Match the product's colors, type, spacing, and components, use real labels and data, and support desktop and mobile.

## Diagrams

Draw a diagram when text would make the reader reconstruct a structure, track several relationships, or compare states. Render it rather than handing over diagram source:

- Mermaid for simple diagrams, when the conversation renders it.
- Graphviz for static structures and flows. Check `dot -V` first.
- D3 with HTML/SVG when interaction or step-by-step state changes help.
- ELK with SVG when compound graphs or explicit ports need layout control.

If a tool is missing, ask the user to install it or pick an available format. Leave the user's project dependencies unchanged. Render and inspect the result, and fix overlaps, unreadable labels, and misleading placement. If you cannot inspect it, say so.

## Artifacts

Save HTML and rendered diagrams under `.show-me/` with descriptive kebab-case names, such as `.show-me/session-event-flow.html`, and keep their assets beside them. Open HTML for the user (`open` on macOS, `xdg-open` on Linux), or give the path.

## Guidance

Place each visual next to the short text it supports, using the same names and values in both. Keep only the calls, files, props, states, and boundaries the current question needs. Use one view or several, whichever the point needs.
