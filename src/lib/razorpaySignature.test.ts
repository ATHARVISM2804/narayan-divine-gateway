import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  timingSafeEqual,
  toPaymentError,
  verifyPaymentSignature,
} from "../../supabase/functions/_shared/razorpay.ts";

const SECRET = "test_key_secret";
const sign = (orderId: string, paymentId: string) =>
  createHmac("sha256", SECRET).update(`${orderId}|${paymentId}`).digest("hex");

describe("verifyPaymentSignature", () => {
  it("accepts Razorpay's signature: HMAC-SHA256(order_id|payment_id, key secret)", async () => {
    expect(await verifyPaymentSignature(SECRET, "order_A", "pay_B", sign("order_A", "pay_B"))).toBe(true);
  });

  it("rejects a signature for another order, payment or secret", async () => {
    const sig = sign("order_A", "pay_B");
    expect(await verifyPaymentSignature(SECRET, "order_X", "pay_B", sig)).toBe(false);
    expect(await verifyPaymentSignature(SECRET, "order_A", "pay_X", sig)).toBe(false);
    expect(await verifyPaymentSignature("other_secret", "order_A", "pay_B", sig)).toBe(false);
    expect(await verifyPaymentSignature(SECRET, "order_A", "pay_B", "")).toBe(false);
  });
});

describe("timingSafeEqual", () => {
  it("compares strings, including different lengths", () => {
    expect(timingSafeEqual("abc", "abc")).toBe(true);
    expect(timingSafeEqual("abc", "abd")).toBe(false);
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
    expect(timingSafeEqual("", "")).toBe(true);
  });
});

describe("toPaymentError", () => {
  const now = new Date("2026-10-11T10:00:00Z");

  it("reads a webhook payment entity", () => {
    const e = toPaymentError(
      { id: "pay_1", method: "upi", error_code: "BAD_REQUEST_ERROR", error_description: "Payment was cancelled by user", error_source: "customer", error_step: "payment_authentication", error_reason: "payment_cancelled" },
      { method: "upi", payment_id: "pay_1" },
      now,
    );
    expect(e).toEqual({
      code: "BAD_REQUEST_ERROR",
      description: "Payment was cancelled by user",
      source: "customer",
      step: "payment_authentication",
      reason: "payment_cancelled",
      method: "upi",
      payment_id: "pay_1",
      at: now.toISOString(),
    });
  });

  it("reads a checkout error object (redirect callback) and its metadata", () => {
    const e = toPaymentError({ code: "BAD_REQUEST_ERROR", description: "Bank declined", reason: "payment_failed", metadata: { payment_id: "pay_2" } }, {}, now);
    expect(e.reason).toBe("payment_failed");
    expect(e.payment_id).toBe("pay_2");
    expect(e.method).toBeNull();
  });

  it("tolerates junk", () => {
    expect(toPaymentError(undefined, {}, now).code).toBeNull();
  });
});
