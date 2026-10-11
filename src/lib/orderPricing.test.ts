import { describe, expect, it } from "vitest";
import {
  isPlausiblePhone,
  linePaise,
  MAX_QTY,
  noteValue,
  validateCartLines,
} from "../../supabase/functions/_shared/orderPricing.ts";

const PUJA = "puja-11111111-2222-3333-4444-555555555555-Couple";
const CHADHAVA = "chadhava-11111111-2222-3333-4444-555555555555";
const OFFERING = "offering-11111111-2222-3333-4444-555555555555";

const line = (id: string, category: string, quantity?: unknown) => ({ id, name: id, price: 1, category, quantity });

describe("validateCartLines", () => {
  it("accepts a normal puja + add-ons cart and defaults a missing quantity to 1", () => {
    const r = validateCartLines([line(PUJA, "puja", 2), line(OFFERING, "offering"), line("blessing-box", "addon", 1)]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.lines.map((l) => l.quantity)).toEqual([2, 1, 1]);
  });

  it.each([
    ["negative", -9],
    ["zero", 0],
    ["fractional", 0.5],
    ["a string", "2"],
    ["over the limit", MAX_QTY + 1],
  ])("rejects a %s quantity — it would bend the total", (_label, qty) => {
    expect(validateCartLines([line(PUJA, "puja", 1), line(CHADHAVA, "chadhava", qty)]).ok).toBe(false);
  });

  it("allows only a single unit of an add-on", () => {
    expect(validateCartLines([line(PUJA, "puja"), line(OFFERING, "offering", 2)]).ok).toBe(false);
    expect(validateCartLines([line(PUJA, "puja"), line("blessing-box", "addon", 3)]).ok).toBe(false);
  });

  it("rejects add-ons without a puja", () => {
    expect(validateCartLines([line("blessing-box", "addon")]).ok).toBe(false);
    expect(validateCartLines([line(CHADHAVA, "chadhava"), line(OFFERING, "offering")]).ok).toBe(false);
  });

  it("rejects duplicate lines, unknown categories and empty carts", () => {
    expect(validateCartLines([line(PUJA, "puja"), line(PUJA, "puja")]).ok).toBe(false);
    expect(validateCartLines([line(PUJA, "discount")]).ok).toBe(false);
    expect(validateCartLines([]).ok).toBe(false);
    expect(validateCartLines(null).ok).toBe(false);
  });
});

describe("linePaise", () => {
  it("converts rupees to whole paise", () => {
    expect(linePaise(1551, 2)).toBe(310200);
    expect(linePaise(19.99, 1)).toBe(1999); // never a float amount, which Razorpay rejects
  });

  it("throws on a broken price", () => {
    expect(() => linePaise(-5, 1)).toThrow();
    expect(() => linePaise("abc", 1)).toThrow();
  });
});

describe("isPlausiblePhone", () => {
  it("accepts Indian and international numbers", () => {
    expect(isPlausiblePhone("9876543210")).toBe(true);
    expect(isPlausiblePhone("+91 98765 43210")).toBe(true);
    expect(isPlausiblePhone("+1 415 555 0100")).toBe(true);
  });

  it("rejects too short or junk", () => {
    expect(isPlausiblePhone("12345")).toBe(false);
    expect(isPlausiblePhone(9876543210)).toBe(false);
  });
});

it("noteValue keeps Razorpay notes under their 256-char limit", () => {
  expect(noteValue("x".repeat(500)).length).toBe(200);
  expect(noteValue(undefined)).toBe("");
});
