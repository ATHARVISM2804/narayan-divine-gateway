// Finds unpaid orders that duplicate an order the same customer already paid for.
//
// Typical case: the first checkout attempt fails or is abandoned, the customer retries and
// pays on a second order. The first stays "pending" and must not be followed up or marked
// paid — that would count the customer twice.

import { orderItemChadhavaId, orderItemPujaId, type OrderItem } from "./orderItems";
import { formatPhoneForCsv } from "./csv";

export interface DupOrder {
  id: string;
  status: string;
  customer_phone: string;
  created_at: string;
  paid_at?: string | null;
  items?: OrderItem[] | null;
}

/** Booked-seva keys of an order: a specific puja (incl. its date) or chadhava. */
const sevaKeys = (o: DupOrder): string[] =>
  (Array.isArray(o.items) ? o.items : []).flatMap((i) => {
    if (i.category === "puja") { const id = orderItemPujaId(i); return id ? [`puja:${id}`] : []; }
    if (i.category === "chadhava") { const id = orderItemChadhavaId(i); return id ? [`chadhava:${id}`] : []; }
    return [];
  });

const phoneKey = (p: string) => formatPhoneForCsv(p).replace(/\D/g, "");

/** Map of unpaid order id → the paid order it duplicates (same phone, same puja/chadhava). */
export function findPaidDuplicates<T extends DupOrder>(orders: T[]): Map<string, T> {
  const paidByKey = new Map<string, T>();
  for (const o of orders) {
    if (o.status !== "paid") continue;
    const phone = phoneKey(o.customer_phone);
    if (!phone) continue;
    for (const k of sevaKeys(o)) {
      const key = `${phone}|${k}`;
      const existing = paidByKey.get(key);
      // Keep the earliest paid order as "the" booking.
      if (!existing || existing.created_at > o.created_at) paidByKey.set(key, o);
    }
  }
  const result = new Map<string, T>();
  for (const o of orders) {
    if (o.status === "paid") continue;
    const phone = phoneKey(o.customer_phone);
    if (!phone) continue;
    for (const k of sevaKeys(o)) {
      const hit = paidByKey.get(`${phone}|${k}`);
      if (hit && hit.id !== o.id) { result.set(o.id, hit); break; }
    }
  }
  return result;
}
