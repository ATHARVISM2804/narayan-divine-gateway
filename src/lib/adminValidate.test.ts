import { describe, expect, it } from "vitest";
import { isDirty, isWholeRupees, missingField, priceInput, tierProblem } from "./adminValidate";

describe("isWholeRupees", () => {
  it("accepts whole rupees of 1 or more only", () => {
    expect(isWholeRupees(1100)).toBe(true);
    expect(isWholeRupees(1)).toBe(true);
    for (const bad of [0, -100, 951.5, NaN, Infinity, "951", null]) expect(isWholeRupees(bad)).toBe(false);
  });
});

describe("tierProblem", () => {
  const ok = [{ label: "Single", price: 1100 }, { label: "Couple", price: 1551 }];
  it("passes good tiers", () => expect(tierProblem(ok)).toBeNull());
  it("needs a tier", () => expect(tierProblem([])).toMatch(/at least one/));
  it("needs a name", () => expect(tierProblem([{ label: " ", price: 951 }])).toMatch(/tier 1 needs a name/));
  it("rejects zero, negative and decimal prices", () => {
    expect(tierProblem([{ label: "Single", price: 0 }])).toMatch(/Single/);
    expect(tierProblem([{ label: "Single", price: -1 }])).toMatch(/whole number/);
    expect(tierProblem([{ label: "Single", price: 951.5 }])).toMatch(/whole number/);
  });
  it("rejects two tiers with the same name, ignoring case and spaces", () => {
    expect(tierProblem([...ok, { label: " couple ", price: 2000 }])).toMatch(/Two package tiers are called "couple"/);
  });
});

describe("missingField", () => {
  it("names the first empty field", () => {
    expect(missingField([["Name", "Jaap"], ["Date", " "], ["Location", ""]])).toBe("Date");
    expect(missingField([["Name", "Jaap"]])).toBeNull();
  });
});

describe("isDirty / priceInput", () => {
  it("compares form copies", () => {
    expect(isDirty({ a: 1 }, { a: 1 })).toBe(false);
    expect(isDirty({ a: 2 }, { a: 1 })).toBe(true);
  });
  it("reads price boxes", () => {
    expect(priceInput("1100")).toBe(1100);
    expect(priceInput("")).toBe(0);
    expect(priceInput("951.5")).toBe(951.5); // kept, so validation can name the problem
  });
});
