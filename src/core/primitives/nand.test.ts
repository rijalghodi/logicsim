import { describe, expect, it } from "bun:test";
import type { Bit } from "../bit";
import { nandGate } from "./nand";

describe("NAND primitive", () => {
  const cases: [Bit, Bit, Bit][] = [
    [false, false, true],
    [false, true, true],
    [true, false, true],
    [true, true, false],
  ];

  for (const [a, b, expected] of cases) {
    it(`${a} NAND ${b} = ${expected}`, () => {
      expect(nandGate.evaluate({ A: a, B: b }).Y).toBe(expected);
    });
  }
});
