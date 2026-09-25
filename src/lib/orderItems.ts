// Helpers for reading an order's `items` snapshot.
//
// Since Sept 2026 create-order stores, on every puja line, the puja's id, date,
// location and tier as they were at booking time (puja_id / puja_date / …), and on
// every chadhava line the temple and date. Older lines only have the composite id
// ("puja-<uuid>-<tier>") and the name, so every reader here falls back gracefully.

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  // puja snapshot
  puja_id?: string | null;
  puja_name?: string | null;
  puja_date?: string | null;
  puja_location?: string | null;
  tier?: string | null;
  // chadhava snapshot
  chadhava_id?: string | null;
  chadhava_temple?: string | null;
  chadhava_date?: string | null;
  [key: string]: unknown;
}

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const PUJA_ID_RE = new RegExp(`^puja-(${UUID})-(.+)$`, "i");
const CHADHAVA_ID_RE = new RegExp(`^chadhava-(${UUID})$`, "i");

const clean = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** The puja this line belongs to — from the snapshot, else from the composite id. */
export const orderItemPujaId = (item: OrderItem): string | null =>
  clean(item.puja_id) ?? (PUJA_ID_RE.exec(item.id || "")?.[1]?.toLowerCase() ?? null);

/** The tier label ("Single", "Couple", …) — from the snapshot, else from the composite id. */
export const orderItemTier = (item: OrderItem): string | null =>
  clean(item.tier) ?? (PUJA_ID_RE.exec(item.id || "")?.[2] ?? null);

export const orderItemChadhavaId = (item: OrderItem): string | null =>
  clean(item.chadhava_id) ?? (CHADHAVA_ID_RE.exec(item.id || "")?.[1]?.toLowerCase() ?? null);

/** "26 September 2026 • Badrinath" for a line with a snapshot; null when the date was never recorded. */
export const orderItemWhen = (item: OrderItem): string | null => {
  const date = clean(item.puja_date) ?? clean(item.chadhava_date);
  const place = clean(item.puja_location) ?? clean(item.chadhava_temple);
  if (!date && !place) return null;
  return [date, place].filter(Boolean).join(" • ");
};

/**
 * Filter/grouping key. Two pujas with the same name but different dates get different keys;
 * lines without a usable id fall back to the name.
 */
export const orderItemKey = (item: OrderItem): string => {
  const pujaId = orderItemPujaId(item);
  if (pujaId) return `puja:${pujaId}`;
  const chadhavaId = orderItemChadhavaId(item);
  if (chadhavaId) return `chadhava:${chadhavaId}`;
  return `name:${item.name || item.id}`;
};

/** Display name for filters: the puja name plus its date so same-name pujas are distinguishable. */
export const orderItemFilterLabel = (item: OrderItem): string => {
  const base = clean(item.puja_name) ?? item.name ?? item.id;
  const date = clean(item.puja_date) ?? clean(item.chadhava_date);
  return date ? `${base} — ${date}` : base;
};

/** One-line description for messages and CSV: "NAME (Single) — 26 September 2026 • Badrinath". */
export const formatOrderItemLine = (item: OrderItem): string => {
  const when = orderItemWhen(item);
  return when ? `${item.name} — ${when}` : item.name;
};
