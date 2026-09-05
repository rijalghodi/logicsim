import type { ValidationIssue } from "./circuit/validateConnection";

export class CoreError extends Error {}

export class ConnectionValidationError extends CoreError {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(`Invalid connection: ${issues.map((issue) => issue.message).join("; ")}`);
    this.issues = issues;
  }
}

export class EvaluationError extends CoreError {}

export class SerializationError extends CoreError {}

export class UnknownComponentTypeError extends CoreError {
  constructor(type: string) {
    super(`Unknown component type: "${type}"`);
  }
}
