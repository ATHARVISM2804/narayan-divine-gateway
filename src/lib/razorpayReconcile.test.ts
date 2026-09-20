import { describe, expect, it } from "vitest";
import { pickCapturedPayment, unixToIso, type RazorpayPayment } from "../../supabase/functions/_shared/razorpay.ts";
import { purchaseEventTime } from "../../supabase/functions/_shared/metaCapi.ts";

const payment = (over: Partial<RazorpayPayment>): RazorpayPayment => ({
  id: "pay_1",
  amount: 95100,
  status: "captured",
  created_at: 1_789_867_600,
  ...over,
});

describe("pickCapturedPayment", () => {
  it("returns the captured payment that matches the order amount", () => {
    const picked = pickCapturedPayment([payment({ id: "pay_ok" })], 95100);
    expect(picked?.id).toBe("pay_ok");
  });

  it("ignores failed, created and merely authorized payments", () => {
    const list = [
      payment({ id: "pay_failed", status: "failed" }),
      payment({ id: "pay_created", status: "created" }),
      payment({ id: "pay_auth", status: "authorized" }),
    ];
    expect(pickCapturedPayment(list, 95100)).toBeNull();
  });

  it("rejects a captured payment whose amount differs from the order", () => {
    expect(pickCapturedPayment([payment({ amount: 20000 })], 95100)).toBeNull();
  });

  it("prefers the earliest captured payment when there are several", () => {
    const list = [payment({ id: "pay_later", created_at: 200 }), payment({ id: "pay_first", created_at: 100 })];
    expect(pickCapturedPayment(list, 95100)?.id).toBe("pay_first");
  });

  it("handles missing lists", () => {
    expect(pickCapturedPayment(undefined, 95100)).toBeNull();
    expect(pickCapturedPayment(null, 95100)).toBeNull();
  });
});

describe("unixToIso", () => {
  it("converts Razorpay unix seconds to ISO", () => {
    expect(unixToIso(1_700_000_000)).toBe("2023-11-14T22:13:20.000Z");
  });
});

describe("purchaseEventTime", () => {
  const now = Date.parse("2026-09-20T12:00:00Z");

  it("uses the payment time so late reconciliation reports when the money arrived", () => {
    expect(purchaseEventTime("2026-09-20T01:26:50Z", now)).toBe(Math.floor(Date.parse("2026-09-20T01:26:50Z") / 1000));
  });

  it("falls back to now when paid_at is unknown", () => {
    expect(purchaseEventTime(null, now)).toBe(Math.floor(now / 1000));
  });

  it("returns null when the payment is older than Meta's 7-day window", () => {
    expect(purchaseEventTime("2026-09-01T00:00:00Z", now)).toBeNull();
  });

  it("never reports a future time", () => {
    expect(purchaseEventTime("2026-09-20T12:05:00Z", now)).toBe(Math.floor(now / 1000));
  });
});
