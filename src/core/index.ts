export type { Bit } from "./bit";
export { createId } from "./id";

export {
  CoreError,
  ConnectionValidationError,
  EvaluationError,
  SerializationError,
  UnknownComponentTypeError,
} from "./errors";

export type { PortDefinition, PortDirection } from "./gate/PortDefinition";
export { createPortDefinition } from "./gate/PortDefinition";

export type { ComponentDefinition } from "./circuit/Component";
export type { Connection, PortRef } from "./circuit/Connection";
export { BOUNDARY_ID } from "./circuit/Connection";

export type { CircuitDefinition, CircuitOptions } from "./circuit/Circuit";
export { Circuit } from "./circuit/Circuit";

export type {
  ValidationIssue,
  ConnectionRule,
  ConnectionValidationContext,
  BoundaryPorts,
} from "./circuit/validateConnection";
export {
  validateConnection,
  defaultConnectionRules,
  ruleEndpointsExist,
  ruleDirection,
  ruleSingleDriverPerInput,
} from "./circuit/validateConnection";

export type { GateDefinition } from "./gate/GateDefinition";
export type { CreateGateDefinitionParams } from "./gate/createGateDefinition";
export { createGateDefinition } from "./gate/createGateDefinition";

export type { PrimitiveGateBehavior, ResolvedGateType, ResolvedCustomGate } from "./gate/GateRegistry";
export { GateRegistry } from "./gate/GateRegistry";
export { createDefaultRegistry } from "./gate/createDefaultRegistry";

export { NAND_TYPE, nandGate } from "./primitives/nand";

export type { SimulationState, EvaluateCircuitOptions } from "./simulation/SimulationState";
export { evaluateCircuit, evaluateGate } from "./simulation/evaluateCircuit";

export type { SerializedGateDefinitionV1 } from "./serialization/types";
export { GATE_DEFINITION_SCHEMA_VERSION } from "./serialization/types";
export { serializeGateDefinition } from "./serialization/serializeGateDefinition";
export { deserializeGateDefinition } from "./serialization/deserializeGateDefinition";
