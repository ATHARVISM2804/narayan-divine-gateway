import { describe, expect, it } from "vitest";
import { buildManualBooking, normalizeMobile, sameBooking } from "../../supabase/functions/_shared/manualBooking.ts";
import type { PricedItem } from "../../supabase/functions/_shared/priceOrderLines.ts";

const NOW = new Date("2026-10-14T10:00:00Z");
const ADMIN = "admin@example.com";
const puja: PricedItem = { id: "puja-x-Couple", category: "puja", quantity: 1, name: "Rudrabhishek (Couple)", price: 1251, verified: true };
const chadhava: PricedItem = { id: "chadhava-y", category: "chadhava", quantity: 2, name: "Bel Patra", price: 101, verified: true };
const priced = { items: [puja], totalPaise: 125100 };
const base = {
  customer: { name: " Ram  Kumar ", phone: "+91 98765 43210" },
  puja_details: { gotra: "Kashyap", member_names: ["Ram Kumar", "Sita Devi"] },
};

describe("normalizeMobile", () => {
  it.each(["9876543210", "+91 98765-43210", "919876543210", "09876543210"])("%s → 9876543210", (raw) => {
    expect(normalizeMobile(raw)).toBe("9876543210");
  });
  it.each(["12345", "1234567890", "", undefined])("rejects %s", (raw) => expect(normalizeMobile(raw)).toBeNull());
});

describe("buildManualBooking", () => {
  it("builds a pending, admin-marked order for a payment link", () => {
    const r = buildManualBooking({ ...base, payment: { mode: "link" } }, priced, ADMIN, NOW);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.mode).toBe("link");
    expect(r.row).toMatchObject({
      customer_name: "Ram Kumar", customer_phone: "9876543210", amount: 125100, status: "pending", source: "admin",
      puja_details: { gotra: "Kashyap", member_names: ["Ram Kumar", "Sita Devi"] },
      admin_booking: { created_by: ADMIN, payment_mode: "link", catalog_amount: 125100, amount_note: null },
    });
    expect(r.row.payment_method).toBeUndefined();
  });

  it("builds a paid order with the offline payment details", () => {
    const r = buildManualBooking(
      { ...base, payment: { mode: "paid", method: "upi", reference: "UTR123", paid_at: "2026-10-12T09:00:00Z" } },
      priced, ADMIN, NOW,
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.row).toMatchObject({
      status: "paid", payment_method: "upi", paid_at: "2026-10-12T09:00:00.000Z", amount: 125100,
      manual_payment: { method: "upi", reference: "UTR123", amount_received: 125100 },
    });
  });

  it("needs a UTR for UPI and refuses a payment time far in the past", () => {
    expect(buildManualBooking({ ...base, payment: { mode: "paid", method: "upi" } }, priced, ADMIN, NOW).ok).toBe(false);
    const old = buildManualBooking(
      { ...base, payment: { mode: "paid", method: "cash", paid_at: "2026-08-01T09:00:00Z" } }, priced, ADMIN, NOW,
    );
    expect(old.ok).toBe(false);
  });

  it("keeps a changed amount only with a reason, and records the catalog amount", () => {
    const noReason = buildManualBooking({ ...base, amount_override: "1100", payment: { mode: "link" } }, priced, ADMIN, NOW);
    expect(noReason).toMatchObject({ ok: false });
    const r = buildManualBooking(
      { ...base, amount_override: "1100", amount_note: "Family discount", payment: { mode: "paid", method: "cash" } },
      priced, ADMIN, NOW,
    );
    expect(r.ok && r.row).toMatchObject({
      amount: 110000, admin_booking: { catalog_amount: 125100, amount_note: "Family discount" },
      manual_payment: { amount_received: 110000 },
    });
  });

  it("needs a sankalp name for a pooja but not for a chadhava-only booking", () => {
    expect(buildManualBooking({ customer: base.customer, payment: { mode: "link" } }, priced, ADMIN, NOW).ok).toBe(false);
    const r = buildManualBooking({ customer: base.customer, payment: { mode: "link" } }, { items: [chadhava], totalPaise: 20200 }, ADMIN, NOW);
    expect(r.ok && r.row.puja_details).toBeNull();
  });

  it("asks how the customer pays", () => {
    expect(buildManualBooking(base, priced, ADMIN, NOW)).toMatchObject({ ok: false });
  });
});

describe("sameBooking", () => {
  it("matches the same phone and items in any order", () => {
    const prev = { customer_phone: "9876543210", items: [{ id: "a", quantity: 1 }, { id: "b", quantity: 2 }] };
    expect(sameBooking(prev, "9876543210", [{ id: "b", quantity: 2 }, { id: "a", quantity: 1 }])).toBe(true);
    expect(sameBooking(prev, "9876543210", [{ id: "a", quantity: 1 }])).toBe(false);
    expect(sameBooking(prev, "9000000000", prev.items)).toBe(false);
  });
});
