import type { ExampleDefinition } from "./types";
import { BASIC_CHIPS_EXAMPLE } from "./basicChips";
import { FOUR_BIT_ADDER_EXAMPLE } from "./fourBitAdder";

export type { ExampleDefinition } from "./types";

export const EXAMPLES: ExampleDefinition[] = [BASIC_CHIPS_EXAMPLE, FOUR_BIT_ADDER_EXAMPLE];

export function getExampleById(id: string): ExampleDefinition | undefined {
  return EXAMPLES.find((example) => example.id === id);
}
