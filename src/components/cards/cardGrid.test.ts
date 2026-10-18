import { describe, expect, it } from "vitest";
import { cardGridClass } from "./cardGrid";

describe("cardGridClass", () => {
  it("keeps the normal 1 / 2 / 3 columns for any number of cards", () => {
    for (const n of [1, 2, 3, 7]) expect(cardGridClass(n)).toBe("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3");
  });
});
