// Admin → Leads / Orders: the "Contacted" switch. One switch covers a whole phone number:
// marking it marks every lead and order with that number (set_contacted in
// docs/sql/contacted-status.sql); the helpers below mirror that on the rows already loaded.
import { supabase } from "@/lib/supabase";
import { phoneKey } from "./orderSearch";

export type ContactFilter = "all" | "not_contacted" | "contacted";

export interface Contactable {
  contacted_at?: string | null;
}

export const matchesContactFilter = (row: Contactable, filter: ContactFilter): boolean =>
  filter === "all" || (filter === "contacted") === Boolean(row.contacted_at);

/**
 * Rows after `phone` was marked (ts = when) or cleared (ts = null). Like the SQL, marking
 * keeps an earlier contacted_at. Rows of other numbers are returned unchanged.
 */
export function applyContacted<T extends Contactable>(
  rows: T[],
  phoneOf: (row: T) => string | null | undefined,
  phone: string,
  ts: string | null,
): T[] {
  const key = phoneKey(phone);
  return rows.map((r) =>
    phoneKey(phoneOf(r)) === key ? { ...r, contacted_at: ts ? (r.contacted_at ?? ts) : null } : r,
  );
}

/**
 * Settles an optimistic switch once the server answers, touching only rows of `phone` so a
 * switch on another number saved meanwhile is kept: each row goes back to its value in
 * `before`, then gets `ts` applied (ts = undefined means the save failed: just restore).
 */
export function settleContacted<T extends Contactable & { id: string }>(
  rows: T[],
  before: T[],
  phoneOf: (row: T) => string | null | undefined,
  phone: string,
  ts: string | null | undefined,
): T[] {
  const key = phoneKey(phone);
  const was = new Map(before.map((r) => [r.id, r.contacted_at ?? null]));
  return rows.map((r) => {
    if (phoneKey(phoneOf(r)) !== key) return r;
    const prev = was.get(r.id) ?? null;
    return { ...r, contacted_at: ts === undefined ? prev : ts ? (prev ?? ts) : null };
  });
}

/** Latest contacted_at per phone number, for the "number contacted on …" hint on newer rows. */
export function lastContactByPhone<T extends Contactable>(
  rows: T[],
  phoneOf: (row: T) => string | null | undefined,
): Map<string, string> {
  const last = new Map<string, string>();
  for (const r of rows) {
    if (!r.contacted_at) continue;
    const key = phoneKey(phoneOf(r));
    const prev = last.get(key);
    if (!prev || new Date(r.contacted_at) > new Date(prev)) last.set(key, r.contacted_at);
  }
  return last;
}

/** Marks or clears every lead and order of this number. ts is when it was marked (null when cleared). */
export async function setContacted(phone: string, contacted: boolean): Promise<{ ts: string | null; error: unknown }> {
  const { data, error } = await supabase.rpc("set_contacted", { p_phone: phone, p_contacted: contacted });
  return { ts: (data as string | null) ?? null, error };
}
