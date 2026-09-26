// Rules for admin order actions (no Deno / network code, so vitest can test them).
//
//   mark_paid   pending | failed | cancelled → paid   (payment taken on a call: UPI, cash, bank…)
//   undo_paid   manually-marked paid → pending         (only manual payments; Razorpay ones can't be undone here)
//   cancel      pending | failed → cancelled            (duplicate retry, customer dropped out)
//   reopen      cancelled → pending

export const MANUAL_METHODS = ["upi", "cash", "bank_transfer", "other"] as const;
export type ManualMethod = (typeof MANUAL_METHODS)[number];

export const METHOD_LABELS: Record<string, string> = {
  razorpay: "Razorpay (online)",
  upi: "UPI (direct)",
  cash: "Cash",
  bank_transfer: "Bank transfer",
  other: "Other",
};

export interface OrderState {
  id: string;
  status: string;
  amount: number; // paise
  created_at: string;
  payment_method?: string | null;
  razorpay_payment_id?: string | null;
  manual_payment?: Record<string, unknown> | null;
}

export interface MarkPaidInput {
  method?: unknown;
  amount_received?: unknown; // rupees
  reference?: unknown;
  note?: unknown;
  paid_at?: unknown; // ISO; defaults to now
}

type Result = { ok: true; patch: Record<string, unknown> } | { ok: false; error: string };

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const MAX_RUPEES = 10_00_000; // ₹10 lakh — far above any real booking, catches typos like an extra zero-string
const CLOCK_SKEW_MS = 5 * 60 * 1000;

export function buildMarkPaidPatch(order: OrderState, input: MarkPaidInput, admin: string, now = new Date()): Result {
  if (order.status === "paid") return { ok: false, error: "This order is already paid." };
  if (!["pending", "failed", "cancelled"].includes(order.status)) {
    return { ok: false, error: `A ${order.status} order cannot be marked paid.` };
  }

  const method = text(input.method, 20) as ManualMethod;
  if (!MANUAL_METHODS.includes(method)) return { ok: false, error: "Choose how the customer paid." };

  const rupees = Number(input.amount_received);
  if (!Number.isFinite(rupees) || rupees <= 0) return { ok: false, error: "Enter the amount received." };
  if (rupees > MAX_RUPEES) return { ok: false, error: "That amount looks too large — please check it." };
  const receivedPaise = Math.round(rupees * 100);

  const reference = text(input.reference, 100);
  if ((method === "upi" || method === "bank_transfer") && !reference) {
    return { ok: false, error: "Enter the UPI / bank transaction reference (UTR) so the payment can be traced." };
  }

  let paidAt = now;
  if (typeof input.paid_at === "string" && input.paid_at) {
    const d = new Date(input.paid_at);
    if (Number.isNaN(d.getTime())) return { ok: false, error: "Payment time is not valid." };
    if (d.getTime() > now.getTime() + CLOCK_SKEW_MS) return { ok: false, error: "Payment time cannot be in the future." };
    if (d.getTime() < new Date(order.created_at).getTime() - 24 * 60 * 60 * 1000) {
      return { ok: false, error: "Payment time is before the order was placed." };
    }
    paidAt = d;
  }

  return {
    ok: true,
    patch: {
      status: "paid",
      payment_method: method,
      paid_at: paidAt.toISOString(),
      // Revenue and the Meta Purchase use what was actually received (discounts happen on calls).
      amount: receivedPaise,
      manual_payment: {
        method,
        reference: reference || null,
        amount_received: receivedPaise,
        original_amount: order.amount,
        note: text(input.note, 300) || null,
        marked_at: now.toISOString(),
        marked_by: admin,
        previous_status: order.status,
      },
    },
  };
}

export function buildUndoPaidPatch(order: OrderState, admin: string, now = new Date()): Result {
  if (order.status !== "paid") return { ok: false, error: "Only a paid order can be undone." };
  if (order.razorpay_payment_id || !order.payment_method || order.payment_method === "razorpay") {
    return { ok: false, error: "This was paid online through Razorpay — refund it from the Razorpay dashboard instead." };
  }
  const mp = (order.manual_payment ?? {}) as Record<string, unknown>;
  const original = typeof mp.original_amount === "number" ? mp.original_amount : order.amount;
  return {
    ok: true,
    patch: {
      status: "pending",
      payment_method: null,
      paid_at: null,
      amount: original,
      manual_payment: { undone: { ...mp }, undone_at: now.toISOString(), undone_by: admin },
    },
  };
}

export function buildCancelPatch(order: OrderState, reason: unknown, duplicateOf: unknown, admin: string, now = new Date()): Result {
  if (!["pending", "failed"].includes(order.status)) {
    return { ok: false, error: `A ${order.status} order cannot be cancelled here.` };
  }
  const why = text(reason, 200);
  if (!why) return { ok: false, error: "Give a reason for cancelling." };
  const dup = text(duplicateOf, 40);
  return {
    ok: true,
    patch: {
      status: "cancelled",
      manual_payment: {
        ...((order.manual_payment ?? {}) as Record<string, unknown>),
        cancel_reason: why,
        duplicate_of: dup || null,
        cancelled_at: now.toISOString(),
        cancelled_by: admin,
        previous_status: order.status,
      },
    },
  };
}

export function buildReopenPatch(order: OrderState, admin: string, now = new Date()): Result {
  if (order.status !== "cancelled") return { ok: false, error: "Only a cancelled order can be reopened." };
  return {
    ok: true,
    patch: {
      status: "pending",
      manual_payment: { ...((order.manual_payment ?? {}) as Record<string, unknown>), reopened_at: now.toISOString(), reopened_by: admin },
    },
  };
}
