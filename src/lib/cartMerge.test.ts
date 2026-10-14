import { describe, expect, it } from "vitest";
import { mergeCartItem } from "./cartMerge";
import type { CartItem } from "@/context/CartContext";

const line = (price: number, quantity = 1): CartItem => ({
  id: "puja-1-Single", name: "Jaap (Single)", description: "20 October", price, category: "puja", quantity,
});

describe("mergeCartItem", () => {
  it("adds a new line", () => {
    const { quantity: _q, ...item } = line(1100);
    expect(mergeCartItem([], item)).toEqual([line(1100)]);
  });

  it("takes the current price when the same package is added again", () => {
    const { quantity: _q, ...now } = line(1100);
    expect(mergeCartItem([line(951)], now)).toEqual([line(1100, 2)]);
  });

  it("leaves other lines alone", () => {
    const other: CartItem = { ...line(251), id: "chadhava-x", name: "Flowers", category: "chadhava" };
    const { quantity: _q, ...now } = line(1100);
    expect(mergeCartItem([other, line(951)], now)).toEqual([other, line(1100, 2)]);
  });
});
