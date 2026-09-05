import type { GateRegistry } from "../gate/GateRegistry";
import type { PortDefinition, PortDirection } from "../gate/PortDefinition";
import type { CircuitDefinition } from "./Circuit";
import type { Connection, PortRef } from "./Connection";
import { BOUNDARY_ID } from "./Connection";

export interface ValidationIssue {
  readonly code:
    "missing-component" | "missing-port" | "invalid-source" | "invalid-destination" | "input-already-driven";
  readonly message: string;
}

/** The ports a circuit exposes to the outside world when it is a gate's internals. */
export interface BoundaryPorts {
  readonly inputs: PortDefinition[];
  readonly outputs: PortDefinition[];
}

export interface ConnectionValidationContext {
  readonly circuit: CircuitDefinition;
  readonly registry: GateRegistry;
  readonly connection: Connection;
  readonly boundary?: BoundaryPorts;
}

/**
 * One connection-level check. Kept as a plain function over a shared
 * context (rather than a method on `Connection` or `Circuit`) so new rules
 * can be added — or swapped out for a stricter/looser set — without
 * touching `Circuit` or the existing rules.
 */
export type ConnectionRule = (ctx: ConnectionValidationContext) => ValidationIssue | null;

type ResolvedEndpoint = { readonly direction: PortDirection };

function resolveEndpoint(ctx: ConnectionValidationContext, ref: PortRef): ResolvedEndpoint | ValidationIssue {
  if (ref.componentId === BOUNDARY_ID) {
    const boundary = ctx.boundary;
    if (!boundary) {
      return { code: "missing-component", message: "This circuit has no boundary ports" };
    }
    const isGateInput = boundary.inputs.some((port) => port.id === ref.portId);
    const isGateOutput = boundary.outputs.some((port) => port.id === ref.portId);
    if (!isGateInput && !isGateOutput) {
      return { code: "missing-port", message: `Unknown boundary port "${ref.portId}"` };
    }
    // Roles invert at the boundary: a gate input *supplies* a value to the
    // internal circuit (acts like a source/output), a gate output
    // *consumes* one (acts like a sink/input).
    return { direction: isGateInput ? "output" : "input" };
  }

  const component = ctx.circuit.components.find((c) => c.id === ref.componentId);
  if (!component) {
    return { code: "missing-component", message: `Unknown component "${ref.componentId}"` };
  }

  const ports = ctx.registry.getPorts(component.type);
  const port = ports.outputs.find((p) => p.id === ref.portId) ?? ports.inputs.find((p) => p.id === ref.portId);
  if (!port) {
    return { code: "missing-port", message: `Unknown port "${ref.portId}" on component "${ref.componentId}"` };
  }
  return { direction: port.direction };
}

function isIssue(value: ResolvedEndpoint | ValidationIssue): value is ValidationIssue {
  return "code" in value;
}

/** Both endpoints must reference a real component (or boundary) and a real port on it. */
export const ruleEndpointsExist: ConnectionRule = (ctx) => {
  const from = resolveEndpoint(ctx, ctx.connection.from);
  if (isIssue(from)) return from;
  const to = resolveEndpoint(ctx, ctx.connection.to);
  if (isIssue(to)) return to;
  return null;
};

/** A connection must run from an output-like port to an input-like port. */
export const ruleDirection: ConnectionRule = (ctx) => {
  const from = resolveEndpoint(ctx, ctx.connection.from);
  const to = resolveEndpoint(ctx, ctx.connection.to);
  if (isIssue(from) || isIssue(to)) return null; // reported by ruleEndpointsExist

  if (from.direction !== "output") {
    return { code: "invalid-source", message: "Connection source must be an output port" };
  }
  if (to.direction !== "input") {
    return { code: "invalid-destination", message: "Connection destination must be an input port" };
  }
  return null;
};

/** An input port can only ever be driven by one wire at a time. */
export const ruleSingleDriverPerInput: ConnectionRule = (ctx) => {
  const alreadyDriven = ctx.circuit.connections.some(
    (connection) =>
      connection.to.componentId === ctx.connection.to.componentId && connection.to.portId === ctx.connection.to.portId,
  );
  return alreadyDriven
    ? { code: "input-already-driven", message: "Input port already has a driving connection" }
    : null;
};

export const defaultConnectionRules: ConnectionRule[] = [ruleEndpointsExist, ruleDirection, ruleSingleDriverPerInput];

export function validateConnection(
  ctx: ConnectionValidationContext,
  rules: ConnectionRule[] = defaultConnectionRules,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const rule of rules) {
    const issue = rule(ctx);
    if (issue) issues.push(issue);
  }
  return issues;
}
