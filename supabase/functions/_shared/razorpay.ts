// supabase/functions/_shared/razorpay.ts
// Razorpay is the source of truth for whether an order was paid.
//
// Three server-side paths confirm a payment, all funnelling into markOrderPaid():
//   1. verify-payment     — the browser's callback (fast, but the mobile UPI flow often kills the tab)
//   2. razorpay-callback  — redirect mode: Razorpay POSTs the result (used in in-app browsers)
//   3. razorpay-webhook   — Razorpay pushes payment.captured / order.paid
//   4. reconcile-orders   — asks Razorpay's API directly (cron every 10 min, admin "Sync", customer "Check")
//
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET.

import { runInBackground, sendPurchaseForOrder } from "./metaCapi.ts";

const RAZORPAY_API = "https://api.razorpay.com";
const FETCH_TIMEOUT_MS = 8000;

// deno-lint-ignore no-explicit-any
const runtime = globalThis as any;
const env = (key: string): string | undefined => runtime.Deno?.env?.get(key) || undefined;

/* ── Signatures ── */

export async function hmacSHA256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Compares two strings in time independent of where they first differ. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/** Checkout signature: HMAC-SHA256(`order_id|payment_id`, key secret), hex. */
export async function verifyPaymentSignature(
  keySecret: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): Promise<boolean> {
  const expected = await hmacSHA256(keySecret, `${razorpayOrderId}|${razorpayPaymentId}`);
  return timingSafeEqual(expected, signature);
}

/* ── Payment failures ── */

export interface PaymentError {
  code: string | null;
  description: string | null;
  source: string | null;
  step: string | null;
  reason: string | null;
  method: string | null;
  payment_id: string | null;
  at: string;
}

const str = (v: unknown, max = 300) => (typeof v === "string" && v ? v.slice(0, max) : null);

/**
 * Normalises a failure from either a webhook payment entity (`error_code`, `error_reason`, …)
 * or a checkout error object (`code`, `reason`, … — what Razorpay POSTs to callback_url).
 */
// deno-lint-ignore no-explicit-any
export function toPaymentError(src: any, extra: { method?: unknown; payment_id?: unknown } = {}, now = new Date()): PaymentError {
  const s = src && typeof src === "object" ? src : {};
  const meta = s.metadata && typeof s.metadata === "object" ? s.metadata : {};
  return {
    code: str(s.error_code ?? s.code),
    description: str(s.error_description ?? s.description),
    source: str(s.error_source ?? s.source),
    step: str(s.error_step ?? s.step),
    reason: str(s.error_reason ?? s.reason),
    method: str(extra.method ?? s.method),
    payment_id: str(extra.payment_id ?? meta.payment_id),
    at: now.toISOString(),
  };
}

/* ── Razorpay API ── */

export interface RazorpayPayment {
  id: string;
  order_id?: string;
  amount: number; // paise
  status: "created" | "authorized" | "captured" | "refunded" | "failed" | string;
  captured?: boolean;
  created_at: number; // unix seconds
  method?: string;
}

export async function razorpayFetch<T = unknown>(path: string): Promise<{ ok: boolean; status: number; body: T }> {
  const keyId = env("RAZORPAY_KEY_ID");
  const keySecret = env("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${RAZORPAY_API}${path}`, {
      headers: { Authorization: "Basic " + btoa(`${keyId}:${keySecret}`) },
      signal: controller.signal,
    });
    const body = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The captured payment for an order, or null. Pure so it can be unit-tested.
 * Only a `captured` payment whose amount equals the order amount counts —
 * `authorized` money can still be voided, and a mismatched amount is not this order.
 */
export function pickCapturedPayment(payments: RazorpayPayment[] | null | undefined, amountPaise: number): RazorpayPayment | null {
  const captured = (payments ?? []).filter(
    (p) => p && p.status === "captured" && Number(p.amount) === Number(amountPaise),
  );
  if (captured.length === 0) return null;
  // Oldest first: the payment that actually settled the order.
  captured.sort((a, b) => a.created_at - b.created_at);
  return captured[0];
}

/** Asks Razorpay for the order's payments and returns the one that settled it, or null. */
export async function findCapturedPayment(razorpayOrderId: string, amountPaise: number): Promise<RazorpayPayment | null> {
  const res = await razorpayFetch<{ items?: RazorpayPayment[]; error?: { description?: string } }>(
    `/v1/orders/${encodeURIComponent(razorpayOrderId)}/payments`,
  );
  if (!res.ok) {
    throw new Error(`Razorpay ${res.status}: ${res.body?.error?.description || "payments lookup failed"}`);
  }
  return pickCapturedPayment(res.body.items, amountPaise);
}

/* ── Orders ── */

export const unixToIso = (seconds?: number | null) =>
  typeof seconds === "number" && Number.isFinite(seconds) ? new Date(seconds * 1000).toISOString() : new Date().toISOString();

export interface MarkPaidInput {
  orderId: string;
  paymentId: string;
  signature?: string;
  paidAt: string; // ISO
  source: "verify-payment" | "callback" | "webhook" | "reconcile";
}

/**
 * Marks an order paid exactly once (atomic `status <> 'paid'` guard), then reports the
 * Meta Purchase in the background. Returns true if this call did the transition.
 */
// deno-lint-ignore no-explicit-any
export async function markOrderPaid(supabase: any, input: MarkPaidInput): Promise<boolean> {
  const patch: Record<string, unknown> = {
    status: "paid",
    payment_method: "razorpay",
    razorpay_payment_id: input.paymentId,
    paid_at: input.paidAt,
  };
  if (input.signature) patch.razorpay_signature = input.signature;

  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", input.orderId)
    .neq("status", "paid")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(`[orders] mark paid failed (${input.source})`, input.orderId, error.message);
    throw new Error(error.message);
  }
  if (!data) return false; // already paid

  console.log(`[orders] ${input.orderId} marked paid via ${input.source} (payment ${input.paymentId})`);
  await runInBackground(() => sendPurchaseForOrder(supabase, input.orderId));
  return true;
}

export interface ReconcilableOrder {
  id: string;
  status: string;
  amount: number;
  razorpay_order_id: string | null;
  razorpay_payment_id?: string | null;
  paid_at?: string | null;
}

export interface ReconcileResult {
  id: string;
  status: string;
  amount: number;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  changed: boolean;
}

/** If the order isn't paid in our DB but Razorpay holds a captured payment for it, mark it paid. */
// deno-lint-ignore no-explicit-any
export async function reconcileOrder(supabase: any, order: ReconcilableOrder): Promise<ReconcileResult> {
  const unchanged: ReconcileResult = {
    id: order.id,
    status: order.status,
    amount: order.amount,
    razorpay_payment_id: order.razorpay_payment_id ?? null,
    paid_at: order.paid_at ?? null,
    changed: false,
  };
  if (order.status === "paid" || !order.razorpay_order_id) return unchanged;

  const payment = await findCapturedPayment(order.razorpay_order_id, order.amount);
  if (!payment) return unchanged;

  const paidAt = unixToIso(payment.created_at);
  const changed = await markOrderPaid(supabase, {
    orderId: order.id,
    paymentId: payment.id,
    paidAt,
    source: "reconcile",
  });
  return { id: order.id, status: "paid", amount: order.amount, razorpay_payment_id: payment.id, paid_at: paidAt, changed };
}
