/**
 * The order whose Razorpay checkout was last opened in this browser.
 *
 * On mobile the customer leaves for their UPI app; the in-app browser often reloads or
 * kills our page meanwhile, so the payment callback never runs and the customer returns
 * to a page that knows nothing about the payment. This record lets us ask the server
 * "was it paid?" when they come back — and stops them paying a second time.
 */
const KEY = "nk_pending_payment";
export const PENDING_MAX_AGE_MS = 30 * 60_000;

export interface PendingPayment {
  dbOrderId: string;
  /** Rupees, for the Meta Purchase event if it's confirmed on return. */
  value: number;
  items: { id: string; quantity: number; price: number }[];
  createdAt: number;
}

export function savePendingPayment(p: PendingPayment): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}

/** The pending payment if one exists and is recent enough to still be in flight. */
export function loadPendingPayment(now = Date.now()): PendingPayment | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingPayment;
    if (!p?.dbOrderId || typeof p.createdAt !== "number" || now - p.createdAt > PENDING_MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

const confirmed = new Set<string>();

/**
 * Several paths can learn that an order was paid (checkout handler, the return-from-UPI
 * check, the success page). The first to claim it reports the Purchase and clears the
 * cart; the rest only navigate. Returns false if it was already claimed on this page.
 */
export function claimConfirmation(dbOrderId: string): boolean {
  clearPendingPayment(dbOrderId);
  if (confirmed.has(dbOrderId)) return false;
  confirmed.add(dbOrderId);
  return true;
}

export function clearPendingPayment(dbOrderId?: string): void {
  try {
    if (dbOrderId) {
      const current = JSON.parse(localStorage.getItem(KEY) || "null") as PendingPayment | null;
      if (current && current.dbOrderId !== dbOrderId) return;
    }
    localStorage.removeItem(KEY);
  } catch { /* storage unavailable */ }
}
