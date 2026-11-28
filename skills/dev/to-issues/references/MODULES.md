# Module file

`modules.md` says where one issue's change lands and what surrounds it. Its purpose is narrow reading: the implementer reads and edits only the **change set**, and uses every other module through its **contract** here instead of reading its code. Paths, symbols, and signatures describe the code at the `Base` commit.

<modules-template>

# <Issue title>: modules

Base: <full commit hash the file describes>

## Change set

One entry per module this issue edits or creates. The tests for these files belong to the change set.

### <module name>

- Files: `path/to/module.ts`, `path/to/module.test.ts`
- Responsibility: what the module owns today, in one line, or "new".
- Change: what this issue changes in it.
- Map records: the `.context/map/` records covering its files, or none.

## Dependency chain

A call tree from the trigger down to the effect, passing through every module in the change set. Mark change-set modules with `*`, and give each node its symbol and file:

```text
cli: runCommand (src/cli.ts)
  * sessions: createSession (src/sessions/create.ts)
      store: saveSession (src/store/index.ts)
      events: emit (src/events/bus.ts)
```

Include each caller whose behavior the change can affect, and each module, schema, configuration, or event the change set uses. Stop one hop beyond the change set: deeper modules matter only through the contracts of the ones listed. Add data dependencies, such as a file or table another module writes, as separate lines.

## Contracts

One entry per node in the chain outside the change set: enough to call it, or to be called by it, without reading its code.

### <module>: <symbol>

- Location: `path/to/file.ts`, `symbol`
- Direction: called by the change set, or calls into it.
- Signature: the exact declaration, schema, or message shape, copied from the code.
- Inputs: each parameter or field, its type, allowed values, and who owns it after the call.
- Outputs: the return value or produced data, and what it means in each case.
- Errors: what can fail and how it is reported (exception, error value, status code, event).
- Side effects: state changes, I/O, emitted events, and their order.
- Invariants: preconditions, async or concurrency behavior, idempotency, and limits that a caller must respect.
- Evidence: the code or tests the contract was read from, marking each unconfirmed point as inferred.

Omit lines that do not apply.

## Interface changes

Each signature, schema, or message shape in the change set that this issue adds or changes, before and after, with every caller it affects. Write "None" when the change set keeps its interfaces.

## Tests

The existing test files for the change set, the seam each new test should use, and the commands that run them. Name reusable fixtures and helpers, with their contracts when they live outside the change set.

</modules-template>

## Rules

- Copy declarations only: signatures, types, schemas, and message shapes. Never function bodies.
- A contract describes behavior a caller can rely on, not how the module achieves it.
- When a blocking issue changes a neighbor, its contract describes the state the blocker leaves, marked `after <blocker-slug>`.
- A neighbor that cannot be used correctly from a contract belongs in the change set, or the issue is too large.
