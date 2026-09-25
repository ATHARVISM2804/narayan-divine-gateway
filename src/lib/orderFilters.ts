// Two-level "Seva" filter for Admin → Orders.
//
// Level 1 lists each puja ONCE by name (plus chadhavas and add-ons, flat).
// Level 2, for a selected puja, splits by the date that was booked and by package
// (Single / Couple / 4 Members / 6 Members). Matching is per line, so an order only
// matches "26 Sep + Couple" when one and the same line is both.

import {
  canonicalTier,
  orderItemChadhavaId,
  orderItemPujaId,
  orderItemTier,
  type OrderItem,
} from "./orderItems";

export type SevaType = "puja" | "chadhava" | "addon";

export interface SevaEntry {
  key: string;
  label: string;
  type: SevaType;
  count: number; // orders containing this seva
}

export interface SubFilterOption {
  key: string;
  label: string;
  count: number; // orders with a line of this seva matching this option
}

export interface SevaFilterValue {
  sevaKey: string; // "all" or a SevaEntry key
  dateKey: string; // "all" or a date option key
  packageKey: string; // "all" or a package option key
}

export const ALL = "all";
export const EMPTY_SEVA_FILTER: SevaFilterValue = { sevaKey: ALL, dateKey: ALL, packageKey: ALL };
export const UNRECORDED_DATE = "unrecorded";

interface OrderLike {
  items?: OrderItem[] | null;
}

const collapse = (s: string) => s.replace(/\s+/g, " ").trim();

/** Puja name without its "(Package)" suffix, from the snapshot when present. */
export const pujaBaseName = (item: OrderItem): string => {
  if (item.puja_name) return collapse(String(item.puja_name));
  const tier = orderItemTier(item);
  const name = collapse(item.name || "");
  if (tier) {
    const suffix = `(${collapse(tier)})`;
    if (name.endsWith(suffix)) return collapse(name.slice(0, -suffix.length));
  }
  // Fallback: drop any trailing "( … )".
  return collapse(name.replace(/\s*\([^)]*\)\s*$/, "")) || name;
};

const sevaTypeOf = (item: OrderItem): SevaType => {
  if (item.category === "puja") return "puja";
  if (item.category === "chadhava") return "chadhava";
  return "addon";
};

/** Level-1 key: one per puja NAME (so the same puja on two dates is one entry). */
export const sevaKeyOf = (item: OrderItem): string => {
  const type = sevaTypeOf(item);
  if (type === "puja") return `puja:${pujaBaseName(item).toUpperCase()}`;
  if (type === "chadhava") return `chadhava:${orderItemChadhavaId(item) ?? collapse(item.name || "").toUpperCase()}`;
  return `addon:${collapse(item.name || item.id || "").toUpperCase()}`;
};

/** Level-2 date key: the booked puja when its date was recorded, else "unrecorded". */
export const dateKeyOf = (item: OrderItem): string =>
  item.puja_date ? (orderItemPujaId(item) ?? String(item.puja_date)) : UNRECORDED_DATE;

export const packageKeyOf = (item: OrderItem): string => canonicalTier(orderItemTier(item)) || "—";

/** "26 September 2026, Sarv Pitra Amavasya" → "26 Sep 2026"; anything unparseable is returned as is. */
export const shortDate = (label: string): string => {
  const m = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(label.trim());
  if (!m) return label;
  return `${m[1]} ${m[2].slice(0, 3)} ${m[3]}`;
};

const linesOf = (order: OrderLike): OrderItem[] => (Array.isArray(order.items) ? order.items : []);

/** Level-1 list, grouped by type, most-booked first. */
export function buildSevaCatalog(orders: OrderLike[]): Record<SevaType, SevaEntry[]> {
  const map = new Map<string, { entry: SevaEntry; orders: Set<OrderLike> }>();
  for (const order of orders) {
    for (const item of linesOf(order)) {
      if (!item?.name && !item?.id) continue;
      const key = sevaKeyOf(item);
      let slot = map.get(key);
      if (!slot) {
        const type = sevaTypeOf(item);
        const label = type === "puja" ? pujaBaseName(item) : collapse(item.name || item.id);
        slot = { entry: { key, label, type, count: 0 }, orders: new Set() };
        map.set(key, slot);
      }
      slot.orders.add(order);
    }
  }
  const out: Record<SevaType, SevaEntry[]> = { puja: [], chadhava: [], addon: [] };
  for (const { entry, orders: set } of map.values()) out[entry.type].push({ ...entry, count: set.size });
  for (const list of Object.values(out)) list.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return out;
}

const PACKAGE_ORDER = ["Single", "Couple", "4 Members", "6 Members"];

/**
 * Level-2 options (dates and packages) for one seva, counted over the given orders.
 * Faceted: date counts respect the chosen package and package counts respect the chosen
 * date, so the number on a chip is always what tapping it will show. Every option of the
 * seva stays listed (count 0 when the other choice excludes it) so chips don't jump around.
 */
export function buildSubFilters(
  orders: OrderLike[],
  value: SevaFilterValue,
): { dates: SubFilterOption[]; packages: SubFilterOption[]; dateTotal: number; packageTotal: number } {
  const { sevaKey, dateKey, packageKey } = value;
  if (!sevaKey || sevaKey === ALL) return { dates: [], packages: [], dateTotal: 0, packageTotal: 0 };
  const dates = new Map<string, { label: string; orders: Set<OrderLike>; sortKey: number }>();
  const packages = new Map<string, Set<OrderLike>>();
  const dateTotal = new Set<OrderLike>(); // orders matching seva + chosen package
  const packageTotal = new Set<OrderLike>(); // orders matching seva + chosen date

  for (const order of orders) {
    for (const item of linesOf(order)) {
      if (sevaKeyOf(item) !== sevaKey || item.category !== "puja") continue;
      const dk = dateKeyOf(item);
      const pk = packageKeyOf(item);

      if (!dates.has(dk)) {
        const label = dk === UNRECORDED_DATE ? "Not recorded" : shortDate(String(item.puja_date));
        const parsed = Date.parse(shortDate(String(item.puja_date ?? "")));
        dates.set(dk, { label, orders: new Set(), sortKey: dk === UNRECORDED_DATE ? Infinity : (Number.isFinite(parsed) ? parsed : Infinity - 1) });
      }
      if (!packages.has(pk)) packages.set(pk, new Set());

      if (packageKey === ALL || pk === packageKey) {
        dates.get(dk)!.orders.add(order);
        dateTotal.add(order);
      }
      if (dateKey === ALL || dk === dateKey) {
        packages.get(pk)!.add(order);
        packageTotal.add(order);
      }
    }
  }

  const dateList = Array.from(dates, ([key, v]) => ({ key, label: v.label, count: v.orders.size, sortKey: v.sortKey }))
    .sort((a, b) => a.sortKey - b.sortKey || a.label.localeCompare(b.label))
    .map(({ sortKey: _s, ...rest }) => rest);

  const rank = (k: string) => {
    const i = PACKAGE_ORDER.indexOf(k);
    return i === -1 ? PACKAGE_ORDER.length : i;
  };
  const packageList = Array.from(packages, ([key, set]) => ({ key, label: key, count: set.size }))
    .sort((a, b) => rank(a.key) - rank(b.key) || a.label.localeCompare(b.label));

  return { dates: dateList, packages: packageList, dateTotal: dateTotal.size, packageTotal: packageTotal.size };
}

/** True when a single line of the order satisfies the seva, date and package together. */
export function orderMatchesSeva(order: OrderLike, value: SevaFilterValue): boolean {
  if (!value.sevaKey || value.sevaKey === ALL) return true;
  return linesOf(order).some(
    (item) =>
      sevaKeyOf(item) === value.sevaKey &&
      (value.dateKey === ALL || dateKeyOf(item) === value.dateKey) &&
      (value.packageKey === ALL || packageKeyOf(item) === value.packageKey),
  );
}
