import { describe, expect, it } from "vitest";
import {
  deleteRow, insertRow, updateRow, saveErrorMessage, SaveError, MSG_CONFLICT, MSG_GONE, MSG_LOGIN, MSG_NETWORK, type WriteClient,
} from "./adminWrite";

type Row = Record<string, unknown>;

/**
 * An in-memory table that behaves like Supabase behind row-level security: rows the
 * caller can't write are silently skipped (no error), exactly like a real 0-row update.
 */
function fakeDb(initial: Row[], opts: { canWrite?: boolean; failReads?: boolean; failWrites?: string } = {}) {
  const table = initial.map((r) => ({ ...r }));
  const canWrite = opts.canWrite ?? true;
  let clock = 0;
  const client: WriteClient = {
    from: () => {
      const make = (op: "update" | "insert" | "delete" | "select", values?: Row) => {
        const filters: [string, unknown][] = [];
        const run = () => {
          if (opts.failWrites && op !== "select") return { data: null, error: { message: opts.failWrites } };
          if (op === "select" && opts.failReads) return { data: null, error: { message: "Failed to fetch" } };
          const match = (r: Row) => filters.every(([c, v]) => r[c] === v);
          if (op === "insert") {
            if (!canWrite) return { data: null, error: { message: "new row violates row-level security policy" } };
            const row = { id: `n${table.length}`, updated_at: `t${++clock}`, ...values };
            table.push(row);
            return { data: [row], error: null };
          }
          if (op === "select") return { data: table.filter(match), error: null };
          const hit = canWrite ? table.filter(match) : [];
          if (op === "update") hit.forEach((r) => Object.assign(r, values, { updated_at: `t${++clock}` }));
          if (op === "delete") hit.forEach((r) => table.splice(table.indexOf(r), 1));
          return { data: hit.map((r) => ({ ...r })), error: null };
        };
        const q = {
          eq: (c: string, v: unknown) => { filters.push([c, v]); return q; },
          select: () => q,
          maybeSingle: () => Promise.resolve(run()).then((r) => ({ ...r, data: Array.isArray(r.data) ? r.data[0] ?? null : r.data })),
          then: (ok: (r: unknown) => unknown, bad?: (e: unknown) => unknown) => Promise.resolve(run()).then(ok, bad),
        };
        return q;
      };
      return {
        update: (v: Row) => make("update", v),
        insert: (v: Row) => make("insert", v),
        delete: () => make("delete"),
        select: () => make("select"),
      };
    },
  } as unknown as WriteClient;
  return { client, table };
}

const puja = () => ({ id: "p1", name: "Jaap", prices: [{ label: "Single", price: 951 }], updated_at: "t0" });

describe("updateRow", () => {
  it("returns the row as saved", async () => {
    const db = fakeDb([puja()]);
    const saved = await updateRow<Row>("pujas", "p1", { prices: [{ label: "Single", price: 1100 }] }, {}, db.client);
    expect(saved.prices).toEqual([{ label: "Single", price: 1100 }]);
    expect(db.table[0].prices).toEqual([{ label: "Single", price: 1100 }]);
  });

  it("fails instead of reporting success when the database skipped the row (expired login)", async () => {
    const db = fakeDb([puja()], { canWrite: false });
    await expect(updateRow("pujas", "p1", { name: "x" }, {}, db.client)).rejects.toThrow(MSG_LOGIN);
    expect(db.table[0].name).toBe("Jaap");
  });

  it("says the item is gone when it was deleted elsewhere", async () => {
    const db = fakeDb([]);
    await expect(updateRow("pujas", "p1", { name: "x" }, {}, db.client)).rejects.toThrow(MSG_GONE);
  });

  it("refuses to overwrite a newer save made after the form was opened", async () => {
    const db = fakeDb([puja()]);
    await updateRow("pujas", "p1", { prices: [{ label: "Single", price: 1100 }] }, { version: "t0" }, db.client); // phone
    await expect(
      updateRow("pujas", "p1", { prices: [{ label: "Single", price: 951 }] }, { version: "t0" }, db.client), // stale laptop
    ).rejects.toThrow(MSG_CONFLICT);
    expect(db.table[0].prices).toEqual([{ label: "Single", price: 1100 }]);
  });

  it("passes the database error through", async () => {
    const db = fakeDb([puja()], { failWrites: "invalid input syntax for type integer" });
    await expect(updateRow("pujas", "p1", { name: "x" }, {}, db.client)).rejects.toThrow(/integer/);
  });

  it("reports a connection problem when the follow-up check can't be read", async () => {
    const db = fakeDb([puja()], { canWrite: false, failReads: true });
    await expect(updateRow("pujas", "p1", { name: "x" }, {}, db.client)).rejects.toThrow(MSG_NETWORK);
  });
});

describe("insertRow", () => {
  it("returns the new row", async () => {
    const db = fakeDb([]);
    const row = await insertRow<Row>("puja_offerings", { name: "Flowers", price: 251 }, db.client);
    expect(row).toMatchObject({ name: "Flowers", price: 251 });
    expect(db.table).toHaveLength(1);
  });

  it("surfaces a rules rejection", async () => {
    const db = fakeDb([], { canWrite: false });
    await expect(insertRow("puja_offerings", { name: "x" }, db.client)).rejects.toBeInstanceOf(SaveError);
  });
});

describe("deleteRow", () => {
  it("deletes", async () => {
    const db = fakeDb([puja()]);
    await deleteRow("pujas", "p1", db.client);
    expect(db.table).toHaveLength(0);
  });

  it("treats an already-deleted row as done", async () => {
    await expect(deleteRow("pujas", "p1", fakeDb([]).client)).resolves.toBeUndefined();
  });

  it("fails when the database skipped it", async () => {
    const db = fakeDb([puja()], { canWrite: false });
    await expect(deleteRow("pujas", "p1", db.client)).rejects.toThrow(MSG_LOGIN);
    expect(db.table).toHaveLength(1);
  });
});

describe("saveErrorMessage", () => {
  it("explains network failures in plain words", () => {
    expect(saveErrorMessage(new TypeError("Failed to fetch"))).toBe(MSG_NETWORK);
    expect(saveErrorMessage(new SaveError(MSG_LOGIN))).toBe(MSG_LOGIN);
  });
});
