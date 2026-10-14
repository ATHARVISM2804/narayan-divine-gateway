import { describe, expect, it } from "vitest";
import { cleanPujaDetails, priceOrderLines } from "../../supabase/functions/_shared/priceOrderLines.ts";
import type { CartLine } from "../../supabase/functions/_shared/orderPricing.ts";

const PUJA_ID = "11111111-2222-3333-4444-555555555555";
const OFFER_ID = "66666666-7777-8888-9999-000000000000";
const ADDON_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

/** Stub of the supabase-js query chain: from(table)…eq(col, val)…maybeSingle(). */
function stubDb(rows: Record<string, Record<string, unknown>>) {
  return {
    from(table: string) {
      const where: Record<string, unknown> = {};
      const q = {
        select: () => q,
        eq: (col: string, val: unknown) => { where[col] = val; return q; },
        maybeSingle: async () => {
          const row = rows[`${table}:${where.id}`];
          return { data: row && row.status === where.status ? row : null };
        },
      };
      return q;
    },
  };
}

const db = stubDb({
  [`pujas:${PUJA_ID}`]: {
    status: "active", name: "Rudrabhishek", date: "21 Oct", location: "Kashi",
    prices: [{ label: "Single", price: 851 }, { label: "Couple", price: 1251 }],
  },
  [`chadhava_offerings:${OFFER_ID}`]: {
    status: "active", name: "Bel Patra", price: 101, chadhava_id: "c1", chadhavas: { temple: "Mahakal", date: "25 Oct" },
  },
  [`puja_offerings:${ADDON_ID}`]: { status: "active", name: "Deep Daan", price: 51, puja_id: PUJA_ID },
});

const line = (id: string, category: CartLine["category"], quantity = 1): CartLine => ({ id, category, quantity, name: id });

describe("priceOrderLines", () => {
  it("prices every line from the database and snapshots what was booked", async () => {
    const r = await priceOrderLines(db, [
      line(`puja-${PUJA_ID}-Couple`, "puja"),
      line(`chadhava-${OFFER_ID}`, "chadhava", 2),
      line(`offering-${ADDON_ID}`, "offering"),
      line("blessing-box", "addon"),
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalPaise).toBe((1251 + 2 * 101 + 51 + 200) * 100);
    expect(r.items[0]).toMatchObject({
      name: "Rudrabhishek (Couple)", price: 1251, puja_id: PUJA_ID, puja_date: "21 Oct", puja_location: "Kashi", tier: "Couple", verified: true,
    });
    expect(r.items[1]).toMatchObject({ name: "Bel Patra", price: 101, quantity: 2, chadhava_id: "c1", chadhava_temple: "Mahakal", chadhava_date: "25 Oct" });
    expect(r.items[2]).toMatchObject({ name: "Deep Daan", price: 51, puja_id: PUJA_ID });
    expect(r.items[3]).toMatchObject({ name: "Narayan Kripa Blessing Box", price: 200 });
  });

  it("charges a puja's offering once per unit booked", async () => {
    const r = await priceOrderLines(db, [line(`puja-${PUJA_ID}-Single`, "puja"), line(`offering-${ADDON_ID}`, "offering", 3)]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalPaise).toBe((851 + 3 * 51) * 100);
    expect(r.items[1]).toMatchObject({ name: "Deep Daan", price: 51, quantity: 3 });
  });

  it("refuses a package that no longer exists", async () => {
    const r = await priceOrderLines(db, [line(`puja-${PUJA_ID}-Family`, "puja")]);
    expect(r).toMatchObject({ ok: false, status: 409, code: "ITEM_UNAVAILABLE" });
  });

  it("refuses an unknown add-on instead of trusting its price", async () => {
    const r = await priceOrderLines(db, [line(`puja-${PUJA_ID}-Single`, "puja"), line("free-gift", "addon")]);
    expect(r).toMatchObject({ ok: false, status: 400 });
  });
});

describe("cleanPujaDetails", () => {
  it("tidies names and gotra and drops empty names", () => {
    expect(cleanPujaDetails({ gotra: "  Kashyap ", member_names: ["  Ram  Kumar", "", "Sita"] }))
      .toEqual({ gotra: "Kashyap", member_names: ["Ram Kumar", "Sita"] });
    expect(cleanPujaDetails(undefined)).toBeNull();
  });
});
