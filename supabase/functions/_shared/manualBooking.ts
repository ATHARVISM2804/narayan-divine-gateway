// Rules for a booking the admin enters by hand (admin-create-order). The items are priced
// exactly like a website order (priceOrderLines); this file checks the rest and builds the
// row. No Deno / network code, so vitest can test it.

import { buildMarkPaidPatch } from "./manualPayment.ts";
import { cleanPujaDetails, type PricedItem } from "./priceOrderLines.ts";

export interface ManualBookingInput {
  customer?: { name?: unknown; phone?: unknown; email?: unknown; address?: unknown };
  puja_details?: unknown;
  /** Final amount in rupees when the admin changed it (discount, family deal). */
  amount_override?: unknown;
  amount_note?: unknown;
  payment?: { mode?: unknown; method?: unknown; reference?: unknown; paid_at?: unknown; note?: unknown };
}

export type PaymentMode = "paid" | "link";

type Built =
  | { ok: true; mode: PaymentMode; row: Record<string, unknown> }
  | { ok: false; error: string };

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const MAX_RUPEES = 10_00_000; // ₹10 lakh, same cap as marking a payment by hand
/** A booking paid by UPI last week can still be entered; older than this is most likely a typo. */
const MAX_PAID_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** 10-digit Indian mobile, the same form the website stores (no +91). */
export function normalizeMobile(raw: unknown): string | null {
  let d = typeof raw === "string" ? raw.replace(/\D/g, "") : "";
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export function buildManualBooking(
  input: ManualBookingInput,
  priced: { items: PricedItem[]; totalPaise: number },
  admin: string,
  now = new Date(),
): Built {
  const name = text(input.customer?.name, 100);
  if (!name) return { ok: false, error: "Enter the customer's name." };
  const phone = normalizeMobile(input.customer?.phone);
  if (!phone) return { ok: false, error: "Enter a valid 10-digit mobile number." };
  const email = text(input.customer?.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "The email address doesn't look right." };
  const address = text(input.customer?.address, 300);

  const hasPuja = priced.items.some((i) => i.category === "puja");
  const pujaDetails = hasPuja ? cleanPujaDetails(input.puja_details) ?? { gotra: "", member_names: [] } : null;
  if (hasPuja && pujaDetails!.member_names.length === 0) return { ok: false, error: "Enter at least one name for the sankalp." };

  // ── Amount: the catalog total, or what the admin agreed with the customer ──
  const catalogPaise = priced.totalPaise;
  let amountPaise = catalogPaise;
  const note = text(input.amount_note, 200);
  if (input.amount_override !== undefined && input.amount_override !== null && input.amount_override !== "") {
    const rupees = Number(input.amount_override);
    if (!Number.isFinite(rupees) || rupees < 1) return { ok: false, error: "The amount must be at least ₹1." };
    if (rupees > MAX_RUPEES) return { ok: false, error: "That amount looks too large. Please check it." };
    amountPaise = Math.round(rupees * 100);
    if (amountPaise !== catalogPaise && !note) return { ok: false, error: "Say why the amount was changed (e.g. family discount)." };
  }
  if (amountPaise < 100) return { ok: false, error: "The amount must be at least ₹1." };

  const mode = text(input.payment?.mode, 10);
  if (mode !== "paid" && mode !== "link") return { ok: false, error: "Choose whether the customer has paid or needs a payment link." };

  const row: Record<string, unknown> = {
    customer_name: name,
    customer_phone: phone,
    customer_email: email || null,
    customer_address: address || null,
    amount: amountPaise,
    items: priced.items,
    puja_details: pujaDetails,
    status: "pending",
    source: "admin",
    admin_booking: {
      created_at: now.toISOString(),
      created_by: admin,
      payment_mode: mode,
      catalog_amount: catalogPaise,
      amount_note: amountPaise !== catalogPaise ? note : null,
    },
  };

  if (mode === "paid") {
    const paid = buildMarkPaidPatch(
      { id: "new", status: "pending", amount: amountPaise, created_at: now.toISOString() },
      {
        method: input.payment?.method,
        amount_received: amountPaise / 100,
        reference: input.payment?.reference,
        note: input.payment?.note,
        paid_at: input.payment?.paid_at,
      },
      admin,
      now,
      new Date(now.getTime() - MAX_PAID_AGE_MS),
    );
    if ("error" in paid) return { ok: false, error: paid.error };
    Object.assign(row, paid.patch);
  }

  return { ok: true, mode, row };
}

/** Same customer, same items, a moment ago: a double tap on Save, not a second booking. */
export function sameBooking(a: { customer_phone: string; items: { id: string; quantity: number }[] }, phone: string, items: { id: string; quantity: number }[]): boolean {
  if (a.customer_phone !== phone || a.items.length !== items.length) return false;
  const key = (list: { id: string; quantity: number }[]) => list.map((i) => `${i.id}×${i.quantity}`).sort().join("|");
  return key(a.items) === key(items);
}
