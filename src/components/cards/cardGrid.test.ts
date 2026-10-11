import { describe, expect, it } from "vitest";
import { cardGridClass, isWideGrid } from "./cardGrid";

describe("cardGridClass", () => {
  it("uses wide cards on laptops when there are only one or two", () => {
    expect(isWideGrid(1)).toBe(true);
    expect(isWideGrid(2)).toBe(true);
    expect(cardGridClass(1)).toContain("lg:grid-cols-1");
    expect(cardGridClass(2)).not.toContain("lg:grid-cols-3");
  });

  it("keeps three columns for three or more cards", () => {
    expect(isWideGrid(3)).toBe(false);
    expect(isWideGrid(0)).toBe(false);
    expect(cardGridClass(5)).toContain("lg:grid-cols-3");
  });

  it("never changes the phone and tablet columns", () => {
    for (const n of [1, 2, 3, 7]) expect(cardGridClass(n)).toMatch(/^grid gap-4 sm:grid-cols-2/);
  });
});
