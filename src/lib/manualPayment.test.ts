import { describe, expect, it } from "vitest";
import {
  buildCancelPatch,
  buildMarkPaidPatch,
  buildReopenPatch,
  buildUndoPaidPatch,
  type OrderState,
} from "../../supabase/functions/_shared/manualPayment.ts";
import { findPaidDuplicates, type DupOrder } from "./orderDuplicates";

const NOW = new Date("2026-09-27T10:00:00Z");
const pending: OrderState = { id: "o1", status: "pending", amount: 155100, created_at: "2026-09-26T07:07:39Z" };

describe("buildMarkPaidPatch", () => {
  it("records a UPI payment with its reference, time and who marked it", () => {
    const r = buildMarkPaidPatch(pending, { method: "upi", amount_received: 1551, reference: " 426912345678 ", note: "paid on call" }, "admin@x.in", NOW);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.patch).toMatchObject({ status: "paid", payment_method: "upi", paid_at: NOW.toISOString(), amount: 155100 });
    expect(r.patch.manual_payment).toMatchObject({
      method: "upi", reference: "426912345678", amount_received: 155100, original_amount: 155100,
      note: "paid on call", marked_by: "admin@x.in", previous_status: "pending",
    });
  });

  it("uses the amount actually received (discount on the call)", () => {
    const r = buildMarkPaidPatch(pending, { method: "cash", amount_received: "1100" }, "a", NOW);
    expect(r.ok && r.patch.amount).toBe(110000);
    expect(r.ok && (r.patch.manual_payment as { original_amount: number }).original_amount).toBe(155100);
  });

  it("accepts a past payment time and rejects a future one", () => {
    expect(buildMarkPaidPatch(pending, { method: "cash", amount_received: 1551, paid_at: "2026-09-26T09:00:00Z" }, "a", NOW).ok).toBe(true);
    const future = buildMarkPaidPatch(pending, { method: "cash", amount_received: 1551, paid_at: "2026-09-28T09:00:00Z" }, "a", NOW);
    expect(future).toEqual({ ok: false, error: "Payment time cannot be in the future." });
  });

  it("refuses bad input", () => {
    const e = (input: object, o = pending) => { const r = buildMarkPaidPatch(o, input, "a", NOW); return "error" in r ? r.error : "ok"; };
    expect(e({ method: "upi", amount_received: 1551 })).toMatch(/reference/);
    expect(e({ method: "cheque", amount_received: 1551 })).toMatch(/how the customer paid/);
    expect(e({ method: "cash", amount_received: 0 })).toMatch(/amount/);
    expect(e({ method: "cash", amount_received: "abc" })).toMatch(/amount/);
    expect(e({ method: "cash", amount_received: 5_000_000 })).toMatch(/too large/);
    expect(e({ method: "cash", amount_received: 1551 }, { ...pending, status: "paid" })).toMatch(/already paid/);
    expect(e({ method: "cash", amount_received: 1551 }, { ...pending, status: "refunded" })).toMatch(/cannot be marked paid/);
  });

  it("allows paying a cancelled or failed order", () => {
    expect(buildMarkPaidPatch({ ...pending, status: "cancelled" }, { method: "cash", amount_received: 951 }, "a", NOW).ok).toBe(true);
    expect(buildMarkPaidPatch({ ...pending, status: "failed" }, { method: "cash", amount_received: 951 }, "a", NOW).ok).toBe(true);
  });
});

describe("buildUndoPaidPatch", () => {
  it("restores a manual payment to pending with the original amount and keeps an audit trail", () => {
    const paid: OrderState = { ...pending, status: "paid", amount: 110000, payment_method: "cash", manual_payment: { method: "cash", original_amount: 155100 } };
    const r = buildUndoPaidPatch(paid, "a", NOW);
    expect(r.ok && r.patch).toMatchObject({ status: "pending", payment_method: null, paid_at: null, amount: 155100 });
    expect(r.ok && (r.patch.manual_payment as { undone: { method: string } }).undone.method).toBe("cash");
  });

  it("never undoes a Razorpay payment", () => {
    const r = buildUndoPaidPatch({ ...pending, status: "paid", payment_method: "razorpay", razorpay_payment_id: "pay_1" }, "a", NOW);
    expect(r.ok).toBe(false);
  });
});

describe("cancel / reopen", () => {
  it("cancels a pending duplicate with a reason, and reopens it", () => {
    const c = buildCancelPatch(pending, "Duplicate — paid in 7B5B8A57", "7b5b8a57", "a", NOW);
    expect(c.ok && c.patch).toMatchObject({ status: "cancelled" });
    expect(c.ok && c.patch.manual_payment).toMatchObject({ cancel_reason: "Duplicate — paid in 7B5B8A57", duplicate_of: "7b5b8a57" });
    expect(buildCancelPatch(pending, "  ", null, "a", NOW).ok).toBe(false);
    expect(buildCancelPatch({ ...pending, status: "paid" }, "x", null, "a", NOW).ok).toBe(false);
    expect(buildReopenPatch({ ...pending, status: "cancelled" }, "a", NOW)).toMatchObject({ ok: true, patch: { status: "pending" } });
    expect(buildReopenPatch(pending, "a", NOW).ok).toBe(false);
  });
});

describe("findPaidDuplicates", () => {
  const line = (pujaId: string, tier = "Couple") => ({ id: `puja-${pujaId}-${tier}`, name: "P", price: 1551, quantity: 1, category: "puja", puja_id: pujaId });
  const SEPT = "9b2efc21-adb5-4d95-a0f5-c5abba7b13a6";
  const OCT = "494ce3ba-975f-492e-a457-938aba3ec840";
  const orders: DupOrder[] = [
    // Umed singh negi: first attempt pending, second attempt paid 5 min later
    { id: "first", status: "pending", customer_phone: "9560499484", created_at: "2026-09-26T07:07:39Z", items: [line(SEPT)] },
    { id: "paid", status: "paid", customer_phone: "+91 95604 99484", created_at: "2026-09-26T07:12:30Z", items: [line(SEPT)] },
    // same phone, different puja date → not a duplicate
    { id: "other-date", status: "pending", customer_phone: "9560499484", created_at: "2026-09-26T08:00:00Z", items: [line(OCT)] },
    // different phone → not a duplicate
    { id: "stranger", status: "pending", customer_phone: "9000000000", created_at: "2026-09-26T08:00:00Z", items: [line(SEPT)] },
  ];

  it("links a pending retry to the paid order and nothing else", () => {
    const d = findPaidDuplicates(orders);
    expect(d.get("first")?.id).toBe("paid");
    expect(d.has("other-date")).toBe(false);
    expect(d.has("stranger")).toBe(false);
    expect(d.has("paid")).toBe(false);
    expect(d.size).toBe(1);
  });
});
