---
name: skill-creator
description: Creates, revises, and evaluates reusable agent skills with SKILL.md instructions and supporting resources. Applies when turning a workflow into a skill or improving an existing skill's instructions or discovery.
---

# Skill Creator

Create self-contained Agent Skills that help agents make better decisions and complete defined tasks. Express workflows through portable Markdown instructions, explicit inputs and outputs, and optional supporting resources.

## Design principles

- **Teach what changes decisions.** Assume the agent is capable. Include non-obvious domain knowledge, operational constraints, decision criteria, and reusable procedures. Prune generic advice and repeated instructions.
- **Preserve intent and scope.** Carry forward the user's chosen outcome, tools, and authorization boundaries. A skill does not grant permission for unrelated configuration changes or external actions. Give retrying or mutating workflows stopping conditions proportional to their risk.
- **Match specificity to risk.** Choose the degree of freedom for each operation using the guidance below. Distinguish requirements from recommendations and local conventions.
- **Make discovery precise.** The name and description should identify the capability and the requests that need it. Add boundaries where they prevent likely confusion with adjacent skills.
- **Disclose detail progressively.** Keep shared purpose, essential constraints, and routing in `SKILL.md`. Move substantial conditional guidance into linked references and load only the relevant material.
- **Keep dependencies explicit.** Refer to tools or other skills only when they are needed and available in the target environment. Describe capability requirements without assuming a particular product's tool names or delegation API.

## Skill structure

A skill is a directory with a required `SKILL.md` and optional resources justified by its workflow:

```text
skill-name/
|-- SKILL.md
|-- scripts/       Optional executable helpers
|-- references/    Optional instructions or documentation loaded on demand
`-- assets/        Optional templates or files used in generated output
```

### Naming

Names and descriptions form the discovery entry point, so they must communicate the task without relying on the body to explain it. Describe when the skill applies without assuming a particular host's loading or invocation mechanism.

Use lowercase letters, digits, and single hyphens for names. Start and end with a letter or digit, keep the name under 64 characters, and give the directory the same name.

Prefer an action plus its object, often a gerund plus object: `processing-pdfs`, `summarizing-meeting-notes`, or `reviewing-pull-requests`. Choose a domain qualifier when it improves discovery. Preserve established names during updates unless renaming is requested or necessary; the grammatical pattern is a recommendation, not a reason to break existing references.

Set a semantic boundary that makes intended and adjacent requests distinguishable. For invoice extraction, `working-with-files` is too broad, `extracting-text-from-scanned-invoices-v2` encodes incidental detail, and `extracting-invoice-data` communicates a reusable task. Remove modifiers such as `smart`, `advanced`, `general`, `helper`, and `utils` when they add no routing information.

### SKILL.md

Use YAML frontmatter with `name` and `description`, followed by Markdown instructions:

```yaml
---
name: drafting-release-notes
description: Drafts release notes from merged changes, grouping user-visible updates and identifying breaking changes. Applies when preparing a release announcement or changelog entry.
---
```

The description is the discovery entry point. State the capability and concrete triggering contexts using terms likely to appear in real requests. Write in an objective third-person voice, such as "Extracts invoice fields … Applies when …", rather than "I can help …" or "You can use …". Include an exclusion only when it prevents likely confusion. Remove filler such as "This skill is designed to provide comprehensive assistance" and broad catchalls such as "anything related to documents". Put execution steps, examples, and detailed tool choices in the body or references.

The body should act as an execution guide and a resource map: give the desired outcome, essential workflow or decision criteria, non-obvious constraints, observable completion criteria, and conditional links. Use a structure suited to the work rather than imposing the same headings or number of steps on every skill. Keep the instructions needed for ordinary execution directly accessible; a short skill can be self-contained.

Treat information as three levels: name and description for discovery, the body for execution, and supporting resources for conditional detail. Keep the entry point as short as the task permits without hiding essential constraints. Aim to keep `SKILL.md` below roughly 500 lines, moving substantial branch-specific detail behind clear links well before that when useful. This is a writing guideline; it does not define how a host reads or loads the skill.

### Degrees of freedom

Choose constraints per operation according to the number of valid approaches and the consequences of error. A single skill may contain operations at different levels.

| Freedom | Task characteristics | Instruction design | Example |
| --- | --- | --- | --- |
| High | Several approaches can work; judgment depends on context | Give goals, decision criteria, and relevant checks; leave the method open | Code review guided by correctness, maintainability, and project conventions |
| Medium | A preferred pattern exists with legitimate variations | Give a template, pseudocode, or parameterized helper; identify configurable choices | Report generation with selectable output format and optional charts |
| Low | Order or parameters are fragile; deviation can cause concrete harm | Give verified commands or scripts, prerequisites, required order, failure handling, and stopping conditions | A database migration with prescribed backup and verification steps |

Explain why a restriction matters. Reserve fixed commands and narrow parameters for operations whose correctness depends on them; confirm that the prescribed script exists and supports the documented arguments. Authorization remains a separate prerequisite for consequential actions.

### Supporting resources

| Directory | Use when | Handling |
| --- | --- | --- |
| `scripts/` | Repeated logic or fragile operations benefit from deterministic execution | Document inputs, outputs, dependencies, and side effects; run new or changed scripts against representative inputs |
| `references/` | Substantial schemas, domain rules, examples, or mode-specific procedures are needed | Link each resource where relevant and state when to read it; keep each fact in one authoritative place |
| `assets/` | Templates, images, fonts, or starter files belong in generated output | Explain how to locate and use them; inspect them only when the task needs it |

Resolve bundled resource links relative to the skill directory. Distinguish those paths from paths in the user's working project, and state the base when ambiguity would affect execution. Make external dependencies discoverable without embedding machine-specific absolute paths.

For example, a deployment skill can keep provider selection in `SKILL.md` and link separate references for each provider. Read only the selected provider's guide. A short skill with one workflow can remain a single file.

Create resource directories only when they have concrete contents and a clear use. Include ancillary documentation only when the workflow or packaging requires it. Before removing an existing resource, inspect its callers and purpose.

### Portability and location

Use the destination supplied by the user. Otherwise follow the project's existing skill layout. Ask for a destination only when the available evidence cannot resolve a consequential choice; there is no universal installation directory.

Keep `name` and `description` as the frontmatter baseline and preserve relevant optional metadata during updates. Describe dependencies by their required capabilities and document how to supply them. Keep skill instructions independent of vendor configuration, UI manifests, proprietary invocation syntax, and fixed installation paths. Keep authorization requirements with the operations they govern.

## Create or update a skill

Scale the work to the request. A focused correction may need only an edit and validation; a new workflow may need examples, resources, and behavioral evaluation.

### 1. Establish the task and destination

Read the requested source material, existing skill if any, nearby conventions, and applicable project instructions before editing. Identify:

- The user requests that should activate the skill, and adjacent requests it should leave to other workflows.
- Required inputs, expected outputs, and observable conditions for completion.
- Constraints, tool capabilities, and authorization boundaries that affect execution.
- The destination, existing project layout, and dependencies required by the workflow.

Use examples already supplied by the user or available in real artifacts. Ask only for missing information that changes the design and cannot reasonably be inferred. If adapting an existing skill, separate reusable guidance from assumptions specific to its original runtime.

### 2. Choose the smallest useful package

Decide which instructions every execution needs and which belong in conditional references. Add a script when it removes repeated implementation work or materially improves reliability; add assets when they are part of the output.

Use an existing initializer if it is available, suitable, and produces only the required files. Otherwise create the directory and `SKILL.md` directly. Inspect generated scaffolding and replace or remove placeholders and unused files. Update an existing skill in place rather than reinitializing it.

Keep a portable skill self-contained. Consult available writing guidance when useful, but do not make its future execution depend on an unrelated local skill being installed.

### 3. Write actionable instructions

State what the agent should do, the decisions it must make, and how it knows the task is complete. Include a small example when it clarifies a real ambiguity. Keep essential invariants alongside the operations they constrain. Prefer a direct instruction and a minimal working example over explanations of familiar concepts or lengthy introductions to standard tools. Retain the reasons behind non-obvious constraints.

Route to substantial references at the point where they become relevant. Avoid duplicating their content in the entry point or loading every branch by default. For large references, add a short contents section or useful search terms.

When a workflow uses an external library, service, or unfamiliar tool capability, verify the relevant current API and usage against authoritative documentation. Reuse suitable existing implementations before adding a dependency. Document only the operational details the agent cannot reliably discover from the environment.

### 4. Validate the package and behavior

Use a suitable validator already provided by the repository when available. Inspect its coverage: structural validation does not prove that the instructions lead to good decisions. When no validator exists, check the files directly rather than assuming an unbundled command is available.

Before completing the work, verify that:

- Frontmatter is valid YAML, required fields are meaningful, and the name matches the directory and naming rules.
- The name communicates an action and object at a useful scope; the concise, third-person description identifies concrete triggering contexts and distinguishes adjacent requests.
- Instructions preserve scope, clarify completion, assign appropriate freedom to each operation, and avoid unsupported runtime assumptions. Conditional detail is linked and familiar background is pruned.
- Relative links resolve, referenced resources exist, and required tools or dependencies are identified.
- Scaffolding is complete, unused placeholders are removed, and scripts behave correctly on representative inputs, including relevant failure cases.
- Repository catalogs, groups, or indexes include the skill where the existing layout requires them.

For a complex or risky skill, evaluate a realistic request when the available environment permits it. If independent delegation is available, give the evaluator the skill, request, and minimum raw artifacts without supplying an intended answer or prior conclusions. Otherwise perform a bounded walkthrough of the same scenario. Use an isolated workspace for generated artifacts and keep side effects within the user's authorization.

Assess observable results and meaningful invariants rather than tests that merely match headings or wording. Report what was actually validated and any behavior that remains untested.

### 5. Iterate from evidence

Improve the skill using real usage or demonstrated failures. Diagnose whether the problem lies in discovery, missing context, ambiguous instructions, resource organization, or execution support. Prefer a focused correction over turning each observed failure into a universal rule.

Finish by reporting the skill's location, the meaningful changes, validation results, and any unresolved prerequisites or limitations.
