import type { GateDefinition } from "../gate/GateDefinition";
import type { PortDefinition, PortDirection } from "../gate/PortDefinition";
import type { ComponentDefinition } from "../circuit/Component";
import type { Connection, PortRef } from "../circuit/Connection";
import { SerializationError } from "../errors";

/**
 * Rebuilds a `GateDefinition` from `unknown` data (e.g. `JSON.parse` output
 * from a persistence adapter), validating the shape field by field rather
 * than trusting a cast. Only schema version 1 exists so far; a future
 * version bump should branch here rather than changing this function's
 * output shape.
 */
export function deserializeGateDefinition(data: unknown): GateDefinition {
  const record = expectRecord(data, "gate definition");

  if (record.version !== 1) {
    throw new SerializationError(`Unsupported gate definition schema version: ${String(record.version)}`);
  }

  return {
    id: expectString(record.id, "id"),
    name: expectString(record.name, "name"),
    inputs: expectPortDefinitions(record.inputs, "inputs"),
    outputs: expectPortDefinitions(record.outputs, "outputs"),
    circuit: {
      components: expectComponents(record.components, "components"),
      connections: expectConnections(record.connections, "connections"),
    },
  };
}

function expectRecord(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new SerializationError(`Expected "${field}" to be an object`);
  }
  return value as Record<string, unknown>;
}

function expectString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new SerializationError(`Expected "${field}" to be a string`);
  }
  return value;
}

function expectArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new SerializationError(`Expected "${field}" to be an array`);
  }
  return value;
}

function expectPortDefinitions(value: unknown, field: string): PortDefinition[] {
  return expectArray(value, field).map((entry, index) => {
    const record = expectRecord(entry, `${field}[${index}]`);
    const direction = record.direction;
    if (direction !== "input" && direction !== "output") {
      throw new SerializationError(`Invalid port direction at "${field}[${index}]"`);
    }
    return {
      id: expectString(record.id, `${field}[${index}].id`),
      name: expectString(record.name, `${field}[${index}].name`),
      direction: direction as PortDirection,
    };
  });
}

function expectComponents(value: unknown, field: string): ComponentDefinition[] {
  return expectArray(value, field).map((entry, index) => {
    const record = expectRecord(entry, `${field}[${index}]`);
    return {
      id: expectString(record.id, `${field}[${index}].id`),
      type: expectString(record.type, `${field}[${index}].type`),
    };
  });
}

function expectPortRef(value: unknown, field: string): PortRef {
  const record = expectRecord(value, field);
  return {
    componentId: expectString(record.componentId, `${field}.componentId`),
    portId: expectString(record.portId, `${field}.portId`),
  };
}

function expectConnections(value: unknown, field: string): Connection[] {
  return expectArray(value, field).map((entry, index) => {
    const record = expectRecord(entry, `${field}[${index}]`);
    return {
      from: expectPortRef(record.from, `${field}[${index}].from`),
      to: expectPortRef(record.to, `${field}[${index}].to`),
    };
  });
}
