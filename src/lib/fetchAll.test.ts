import { describe, expect, it } from "vitest";
import { fetchAllRows, PAGE_SIZE } from "./fetchAll";

const fakeTable = (n: number) => Array.from({ length: n }, (_, i) => i);

function pager(table: number[], failOnCall?: number) {
  const calls: [number, number][] = [];
  const page = async (from: number, to: number) => {
    calls.push([from, to]);
    if (calls.length === failOnCall) return { data: null, error: new Error("boom") };
    return { data: table.slice(from, to + 1), error: null };
  };
  return { page, calls };
}

describe("fetchAllRows", () => {
  it("loads every row past the 1000-row cap, in order", async () => {
    const table = fakeTable(2345);
    const { page, calls } = pager(table);
    const { data, error } = await fetchAllRows(page);
    expect(error).toBeNull();
    expect(data).toEqual(table);
    expect(calls).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
  });

  it("asks once more when the last page is exactly full", async () => {
    const { page, calls } = pager(fakeTable(PAGE_SIZE));
    const { data } = await fetchAllRows(page);
    expect(data).toHaveLength(PAGE_SIZE);
    expect(calls).toHaveLength(2);
  });

  it("returns the error and the rows loaded so far", async () => {
    const { page } = pager(fakeTable(2345), 2);
    const { data, error } = await fetchAllRows(page);
    expect(error).toBeInstanceOf(Error);
    expect(data).toHaveLength(PAGE_SIZE);
  });
});
