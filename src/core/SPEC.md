# Core specification

This documents the decisions behind `src/core`, not just what it contains.
Update it as the model grows (sequential logic, memory, CPU).

## 1. Layering

```
Bit → PortDefinition → ComponentDefinition/Connection → CircuitDefinition
                                                              ↓
                                                       GateDefinition
                                                     (name + inputs/outputs
                                                      wrapped around a
                                                      CircuitDefinition)
                                                              ↓
                                                   GateRegistry resolves
                                                   component.type to either
                                                   a built-in primitive or
                                                   a GateDefinition
                                                              ↓
                                                    evaluateCircuit walks
                                                    the graph, recursing
                                                    into custom gates
```

The core has no dependency on React, the DOM, Canvas/Konva/WebGPU, or
`localStorage`. Persistence is the caller's job: `serializeGateDefinition`
produces plain JSON, `deserializeGateDefinition` validates and rebuilds —
what happens to those bytes (localStorage, IndexedDB, a file, a server) is
outside the core entirely.

## 2. Definitions are data, not classes

A `GateDefinition` (custom AND, HalfAdder, ALU, …) is a plain record: id,
name, `PortDefinition[]` for its interface, and a `CircuitDefinition` for
its internals. There is no `AndGate` class and no growing `Component` →
`Gate` → `BinaryGate` inheritance chain. `NAND` is the sole exception: it's
a built-in `PrimitiveGateBehavior` with a direct truth-table function,
because it has no internal circuit to decompose into.

`GateRegistry.resolve(type)` is the single place that tells a primitive
from a custom gate apart. Everywhere else — `Circuit`, `validateConnection`,
`evaluateCircuit` — only sees the resulting `ResolvedGateType` union and
branches on `.kind`, never on a hardcoded list of gate names. Adding a new
custom gate never requires touching the evaluator.

## 3. The boundary convention

**The problem.** A `GateDefinition` for, say, a custom `AND` gate has two
input ports (`A`, `B`) and one output port (`Y`) — that's its interface to
the outside world. Internally, `AND` is built from two `NAND`s, and that
internal wiring needs to connect *something* to `A`, `B`, and `Y`. But
`A`/`B`/`Y` aren't ports on any component inside the circuit — they're the
circuit's own edges. `BOUNDARY_ID` (`circuit/Connection.ts`) is a fake
component id that stands in for "the gate's own interface," so the
internal wiring can address `A`/`B`/`Y` with the exact same
`{ componentId, portId }` shape used for every real component.

**Concrete example** — the textbook two-NAND `AND` gate
(`AND(A,B) = NAND(NAND(A,B), NAND(A,B))`), as built in
`createGateDefinition.test.ts`:

```
  BOUNDARY_ID.A ─────────────────► nand1.A
  BOUNDARY_ID.B ─────────────────► nand1.B

  nand1.Y ────────┬──────────────► nand2.A
                  └──────────────► nand2.B

  nand2.Y ───────────────────────► BOUNDARY_ID.Y
```

Every arrow is a `Connection`, and `validateConnection`'s `ruleDirection`
requires every arrow to run from something typed **output** to something
typed **input** (`validateConnection.ts`). That rule is what forces the
inversion:

- `BOUNDARY_ID.A` is the *source* of an arrow (it feeds `nand1.A`), so for
  this check it must count as an **output** — even though `A` is declared
  an **input** port on the `AND` gate's own `PortDefinition`.
- `BOUNDARY_ID.Y` is the *destination* of an arrow (it receives `nand2.Y`),
  so it must count as an **input** — even though `Y` is declared an
  **output** port externally.

So: **from outside the gate**, `A`/`B` are inputs you feed values into and
`Y` is an output you read a value from — completely ordinary. **From
inside the internal wiring**, that's flipped: the gate's own inputs behave
like sources (things that hand a value in, i.e. outputs), and the gate's
own outputs behave like sinks (things that consume a value, i.e. inputs).

**What actually changes in code, and what doesn't.** A `PortDefinition`'s
`direction` field is never mutated — `A` stays `"input"` forever, that's
its real, external identity. The inversion lives entirely in one place:
`resolveEndpoint` in `validateConnection.ts`, which — only when
`ref.componentId === BOUNDARY_ID` — reports the *opposite* of the port's
declared direction (`direction: isGateInput ? "output" : "input"`) purely
so `ruleDirection` sees a valid output→input arrow. Nothing about the
`PortDefinition` itself, or how the gate looks from outside, changes.

This is the trickiest part of the model; if a connection or validation
change here doesn't work the way you expect, re-read this section before
"fixing" it.

A plain `Circuit` built with no `inputs`/`outputs` (see the NAND-chain
tests) simply has no boundary, and any connection naming `BOUNDARY_ID` is
rejected as a missing component.

## 4. Definition vs. runtime state

- **Definition** (`GateDefinition`, `CircuitDefinition`, `ComponentDefinition`,
  `Connection`, `PortDefinition`): what a circuit _is_. Everything here is
  plain, JSON-serializable data with stable string IDs — never a live
  object reference. This is the only thing a saved custom gate contains.
- **Runtime state** (`SimulationState`): what a circuit is _currently
  doing_ — computed values per component/port. Never persisted.

The evaluator is currently pure/stateless: `evaluateCircuit` recomputes a
full `SimulationState` from a `CircuitDefinition` and a set of input
values on every call, with no memory of the previous pass. There is no
mutable "Port" object holding a live value. This is deliberately the
simplest thing that works for combinational logic; a sequential evaluator
(latches, registers, a clock) will need to carry state _between_ ticks,
which is why `SimulationState` and `evaluateCircuit`'s options are kept as
plain, extensible records rather than baked into a fixed function
signature.

## 5. Validation vs. evaluation cycle handling

Connection validation (`validateConnection`) checks _one wire_ in
isolation: do both endpoints exist, is the direction right, is the input
already driven. It is a list of independent `ConnectionRule`s specifically
so more rules can be added later without touching existing ones.

Cycle detection is **not** a connection rule — it's a property of
`evaluateCircuit`'s topological sort, checked only at evaluation time.
This is intentional: a two-NAND SR-latch-style feedback loop is a set of
individually-valid connections that only becomes a problem for a purely
combinational evaluator. Keeping cycle rejection inside `evaluateCircuit`
(as `EvaluationError`) rather than inside `Circuit.connect()` means a
future sequential evaluator can allow the same wiring and simply resolve
it over ticks instead of rejecting it outright.

## 6. Floating inputs

An input port with no driving connection (and no override, for a raw test
circuit) evaluates as `false`, rather than throwing. This matches the
"floating input" behavior of `componentInputOverrides`/`boundaryInputs`
defaults in `evaluateCircuit` and keeps partially-wired circuits evaluable
during editing rather than erroring on every intermediate state. Revisit
this if the UI needs to distinguish "explicitly false" from "unconnected."

## 7. Serialization format

`serializeGateDefinition`/`deserializeGateDefinition` (in
`src/core/serialization/`) define a deliberate versioned format
(`SerializedGateDefinitionV1`, `version: 1`), not `JSON.stringify(gate)`.
Deserialization validates every field's shape against `unknown` input
rather than casting, since the input is assumed to come from outside the
program (localStorage, a file, …). A future format change should add a
new `SerializedGateDefinitionV*` and branch in `deserializeGateDefinition`
on `record.version`, rather than mutating the V1 shape in place.

## 8. What's still open

Not yet modeled, on purpose (see the domain model in this file's history):
clocks, latches/registers, memory, an instruction set, CPU. The evaluator
signature (`boundaryInputs` / `componentInputOverrides` in, `SimulationState`
out) and the definition/runtime-state split above were both chosen so that
sequential logic can be layered on without reshaping `GateDefinition` or
`CircuitDefinition`.
