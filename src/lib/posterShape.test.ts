import { describe, expect, it } from "vitest";
import { isPosterShape } from "./posterShape";

describe("isPosterShape", () => {
  it("accepts the standard poster size and the same shape at other sizes", () => {
    expect(isPosterShape(1483, 1061)).toBe(true);
    expect(isPosterShape(2966, 2122)).toBe(true);
    expect(isPosterShape(1400, 1000)).toBe(true); // 1.400 vs 1.398
  });

  it("refuses other shapes", () => {
    expect(isPosterShape(1000, 1000)).toBe(false);
    expect(isPosterShape(1920, 1080)).toBe(false);
    expect(isPosterShape(1061, 1483)).toBe(false);
    expect(isPosterShape(0, 0)).toBe(false);
  });
});
