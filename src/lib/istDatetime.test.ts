import { describe, expect, it } from "vitest";
import { fromIstInput, toIstInput } from "./istDatetime";

describe("toIstInput", () => {
  it("shows a stored UTC timestamp in India time", () => {
    expect(toIstInput("2026-10-19T16:00:00+00:00")).toBe("2026-10-19T21:30");
    expect(toIstInput("2026-10-19T10:30:00Z")).toBe("2026-10-19T16:00");
  });
  it("keeps what the admin typed", () => {
    expect(toIstInput("2026-10-19T16:00")).toBe("2026-10-19T16:00");
  });
  it("is empty for nothing or garbage", () => {
    expect(toIstInput(null)).toBe("");
    expect(toIstInput("")).toBe("");
    expect(toIstInput("soon")).toBe("");
  });
});

describe("fromIstInput", () => {
  it("saves the typed time as India time", () => {
    expect(fromIstInput("2026-10-19T16:00")).toBe("2026-10-19T16:00:00+05:30");
    expect(new Date(fromIstInput("2026-10-19T16:00")!).toISOString()).toBe("2026-10-19T10:30:00.000Z");
  });
  it("leaves an untouched stored value alone", () => {
    expect(fromIstInput("2026-10-19T16:00:00+00:00")).toBe("2026-10-19T16:00:00+00:00");
  });
  it("round-trips through the form", () => {
    const stored = "2026-10-19T10:30:00+00:00";
    expect(new Date(fromIstInput(toIstInput(stored))!).getTime()).toBe(new Date(stored).getTime());
  });
  it("is null when cleared", () => {
    expect(fromIstInput("")).toBeNull();
    expect(fromIstInput(undefined)).toBeNull();
  });
});
