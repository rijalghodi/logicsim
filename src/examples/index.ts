import type { ExampleDefinition } from "./types";
import { HALF_ADDER_EXAMPLE } from "./halfAdder";

export type { ExampleDefinition } from "./types";

export const EXAMPLES: ExampleDefinition[] = [HALF_ADDER_EXAMPLE];

export function getExampleById(id: string): ExampleDefinition | undefined {
  return EXAMPLES.find((example) => example.id === id);
}
