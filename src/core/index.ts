export type { Bit } from "./bit";
export { createId } from "./id";

export {
  CoreError,
  ConnectionValidationError,
  EvaluationError,
  SerializationError,
  UnknownComponentTypeError,
} from "./errors";

export type { PortDefinition, PortDirection } from "./chip/PortDefinition";
export { createPortDefinition } from "./chip/PortDefinition";

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

export type { ChipDefinition } from "./chip/ChipDefinition";
export type { CreateChipDefinitionParams } from "./chip/createChipDefinition";
export { createChipDefinition } from "./chip/createChipDefinition";

export type { PrimitiveChipBehavior, ResolvedChipType, ResolvedCustomChip } from "./chip/ChipRegistry";
export { ChipRegistry } from "./chip/ChipRegistry";
export { createDefaultRegistry } from "./chip/createDefaultRegistry";

export { NAND_TYPE, nandChip } from "./primitives/nand";

export type { SimulationState, EvaluateCircuitOptions } from "./simulation/SimulationState";
export { evaluateCircuit, evaluateChip } from "./simulation/evaluateCircuit";

export type { SerializedChipDefinitionV1 } from "./serialization/types";
export { CHIP_DEFINITION_SCHEMA_VERSION } from "./serialization/types";
export { serializeChipDefinition } from "./serialization/serializeChipDefinition";
export { deserializeChipDefinition } from "./serialization/deserializeChipDefinition";
