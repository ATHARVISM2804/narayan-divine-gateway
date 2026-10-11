import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({ supabase: {} }));

import { applyContacted, lastContactByPhone, matchesContactFilter, settleContacted } from "./contacted";
import { phoneKey } from "./orderSearch";

type Row = { id: string; phone: string; contacted_at?: string | null };
const phoneOf = (r: Row) => r.phone;
const T1 = "2026-10-02T10:00:00.000Z";
const T2 = "2026-10-11T10:10:00.000Z";

describe("phoneKey (SQL twin: public.phone_key)", () => {
  it.each(["+91 96908-88667", "919690888667", "09690888667", "9690888667"])("%s → 9690888667", (raw) => {
    expect(phoneKey(raw)).toBe("9690888667");
  });
});

describe("applyContacted", () => {
  const rows: Row[] = [
    { id: "a", phone: "9690888667" },
    { id: "b", phone: "+91 96908-88667" },
    { id: "c", phone: "09690888667", contacted_at: T1 },
    { id: "d", phone: "9811111111" },
  ];

  it("marks every row of the number, however it was typed, and nothing else", () => {
    const out = applyContacted(rows, phoneOf, "919690888667", T2);
    expect(out.map((r) => r.contacted_at ?? null)).toEqual([T2, T2, T1, null]);
    expect(out[3]).toBe(rows[3]);
  });

  it("clears every row of the number", () => {
    const marked = applyContacted(rows, phoneOf, "9690888667", T2);
    const out = applyContacted(marked, phoneOf, "9690888667", null);
    expect(out.slice(0, 3).every((r) => r.contacted_at === null)).toBe(true);
  });
});

describe("settleContacted", () => {
  const before: Row[] = [
    { id: "a", phone: "9690888667", contacted_at: T1 },
    { id: "b", phone: "+91 96908-88667" },
    { id: "c", phone: "9811111111" },
  ];
  // Optimistic marks for both numbers, as if two switches were tapped quickly.
  const optimistic = applyContacted(applyContacted(before, phoneOf, "9690888667", "local"), phoneOf, "9811111111", "local");

  it("applies the server time to this number only, keeping earlier times", () => {
    const out = settleContacted(optimistic, before, phoneOf, "9690888667", T2);
    expect(out.map((r) => r.contacted_at)).toEqual([T1, T2, "local"]);
  });

  it("restores this number only when the save failed", () => {
    const out = settleContacted(optimistic, before, phoneOf, "9690888667", undefined);
    expect(out.map((r) => r.contacted_at ?? null)).toEqual([T1, null, "local"]);
  });
});

describe("matchesContactFilter", () => {
  it("filters by contacted_at", () => {
    expect(matchesContactFilter({ contacted_at: T1 }, "contacted")).toBe(true);
    expect(matchesContactFilter({ contacted_at: T1 }, "not_contacted")).toBe(false);
    expect(matchesContactFilter({ contacted_at: null }, "not_contacted")).toBe(true);
    expect(matchesContactFilter({}, "contacted")).toBe(false);
    expect(matchesContactFilter({}, "all")).toBe(true);
  });
});

describe("lastContactByPhone", () => {
  it("keeps the latest time per number", () => {
    const last = lastContactByPhone<Row>(
      [
        { id: "a", phone: "9690888667", contacted_at: T1 },
        { id: "b", phone: "+91 96908 88667", contacted_at: T2 },
        { id: "c", phone: "9811111111" },
      ],
      phoneOf,
    );
    expect(last.get("9690888667")).toBe(T2);
    expect(last.has("9811111111")).toBe(false);
  });
});
