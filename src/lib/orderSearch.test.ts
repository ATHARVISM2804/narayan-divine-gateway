import { describe, expect, it } from "vitest";
import { orderMatchesSearch, phoneKey, searchText, type SearchableOrder } from "./orderSearch";

const order = (over: Partial<SearchableOrder> = {}): SearchableOrder => ({
  id: "3f2a9c1e-4b7d-4e2a-9f10-aa11bb22cc33",
  customer_name: "Amisha NIJESH shah",
  customer_phone: "9867205039",
  customer_email: null,
  razorpay_order_id: "order_PqR123",
  razorpay_payment_id: "pay_XyZ789",
  puja_details: { member_names: ["Nijesh Shah", "Riya Shah"] },
  ...over,
});

const matches = (q: string, o = order()) => orderMatchesSearch(o, q);

describe("phoneKey", () => {
  it.each([
    ["9867205039", "9867205039"],
    ["+91 98672 05039", "9867205039"],
    ["919867205039", "9867205039"],
    ["09867205039", "9867205039"],
    ["98672-05039", "9867205039"],
    [null, ""],
  ])("%s → %s", (raw, key) => expect(phoneKey(raw)).toBe(key));
});

describe("orderMatchesSearch — phone numbers", () => {
  it("finds the full number however it is typed", () => {
    for (const q of ["9867205039", "+91 9867205039", "+91 98672 05039", "09867205039", "98672-05039"]) {
      expect(matches(q)).toBe(true);
    }
  });

  it("finds a partly typed number, from the start or the end", () => {
    expect(matches("98672")).toBe(true);
    expect(matches("05039")).toBe(true);
    expect(matches("+91 9867")).toBe(true);
    expect(matches("09867")).toBe(true);
  });

  it("matches by phone even when that customer used a different name", () => {
    expect(matches("9867205039", order({ customer_name: "Someone Else" }))).toBe(true);
  });

  it("does not match another number", () => {
    expect(matches("9690888667")).toBe(false);
    expect(matches("12345")).toBe(false);
  });

  it("finds a stored +91 / 0-prefixed number by its 10 digits", () => {
    expect(matches("9867205039", order({ customer_phone: "+919867205039" }))).toBe(true);
    expect(matches("9867205039", order({ customer_phone: "09867205039" }))).toBe(true);
  });
});

describe("orderMatchesSearch — names and ids", () => {
  it("is case-insensitive and matches part of a name", () => {
    expect(matches("amisha")).toBe(true);
    expect(matches("NIJESH")).toBe(true);
    expect(matches("  Shah ")).toBe(true);
  });

  it("needs every word to match, in any field", () => {
    expect(matches("amisha shah")).toBe(true);
    expect(matches("amisha 9867")).toBe(true); // name + phone together
    expect(matches("amisha kumar")).toBe(false);
  });

  it("finds a sankalp member's name", () => {
    expect(matches("riya")).toBe(true);
  });

  it("finds long names that carry an address", () => {
    const o = order({ customer_name: "नमिता जोशी नितेश जोशी सुभाष नगर काशीपुर उत्तराखंड" });
    expect(matches("काशीपुर", o)).toBe(true);
    expect(matches("नमिता जोशी", o)).toBe(true);
  });

  it("finds an order by its ref, Razorpay ids and email", () => {
    expect(matches("3F2A9C1E")).toBe(true); // the ref shown in admin, upper-cased
    expect(matches("pay_xyz789")).toBe(true);
    expect(matches("order_pqr123")).toBe(true);
    expect(matches("amisha@example.com", order({ customer_email: "Amisha@Example.com" }))).toBe(true);
  });

  it("finds an order whose ref is all digits", () => {
    expect(matches("40213377", order({ id: "40213377-1111-4222-8333-444455556666" }))).toBe(true);
  });

  it("treats a short number as text (no phone mode under 3 digits)", () => {
    expect(matches("77")).toBe(false);
    expect(matches("98")).toBe(true); // still found in the phone digits
  });

  it("matches everything for an empty query", () => {
    expect(matches("")).toBe(true);
    expect(matches("   ")).toBe(true);
  });

  it("accepts a precomputed haystack", () => {
    const o = order();
    expect(orderMatchesSearch(o, "riya", searchText(o))).toBe(true);
  });
});
