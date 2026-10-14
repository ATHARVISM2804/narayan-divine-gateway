import { describe, expect, it } from "vitest";
import { bookingLines, bookingTotal, matchLeadPuja, memberCountFor, mobileInput, type BookingSelection } from "./manualBooking";
import { validateCartLines } from "../../supabase/functions/_shared/orderPricing.ts";

const PUJA = "11111111-2222-3333-4444-555555555555";
const sel: BookingSelection = {
  puja: { id: PUJA, tier: { label: "Couple", price: 1251 }, addons: [{ id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", name: "Deep Daan", price: 51 }] },
  blessingBox: true,
  chadhava: {
    offerings: [
      { id: "66666666-7777-8888-9999-000000000000", name: "Bel Patra", price: 101, qty: 2 },
      { id: "66666666-7777-8888-9999-000000000001", name: "Dhoop", price: 21, qty: 0 },
    ],
  },
};

describe("bookingLines", () => {
  it("builds the same lines a website checkout sends, which the server accepts", () => {
    const lines = bookingLines(sel);
    expect(lines.map((l) => [l.id, l.category, l.quantity])).toEqual([
      [`puja-${PUJA}-Couple`, "puja", 1],
      ["offering-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", "offering", 1],
      ["blessing-box", "addon", 1],
      ["chadhava-66666666-7777-8888-9999-000000000000", "chadhava", 2],
    ]);
    expect(validateCartLines(lines).ok).toBe(true);
  });

  it("leaves out add-ons when no pooja is chosen", () => {
    expect(bookingLines({ ...sel, puja: null }).map((l) => l.category)).toEqual(["chadhava"]);
  });
});

describe("bookingTotal", () => {
  it("adds package, add-ons, Blessing Box and chadhava quantities", () => {
    expect(bookingTotal(sel)).toBe(1251 + 51 + 200 + 2 * 101);
  });
});

describe("memberCountFor", () => {
  it.each([["Single", 1], ["Couple", 2], ["4 Family", 4], ["Joint Family (6)", 6], ["Special", 1]])("%s → %i", (label, n) => {
    expect(memberCountFor(label as string)).toBe(n);
  });
});

describe("matchLeadPuja", () => {
  const pujas = [{ id: "p1", name: "Rudrabhishek", prices: [{ label: "Single", price: 851 }, { label: "Couple", price: 1251 }] }];
  it("finds the pooja and package a lead asked about", () => {
    expect(matchLeadPuja(pujas, " rudrabhishek ", "couple")).toEqual({ puja: pujas[0], tier: pujas[0].prices[1] });
  });
  it("keeps the pooja when the package changed, and gives up on an unknown pooja", () => {
    expect(matchLeadPuja(pujas, "Rudrabhishek", "Family")?.tier).toBeNull();
    expect(matchLeadPuja(pujas, "Other", "Single")).toBeNull();
  });
});

describe("mobileInput", () => {
  it.each([["+91 98765 43210", "9876543210"], ["098765-43210", "9876543210"], ["98765", "98765"], ["919876543210", "9876543210"]])(
    "%s → %s", (raw, want) => expect(mobileInput(raw)).toBe(want),
  );
});
