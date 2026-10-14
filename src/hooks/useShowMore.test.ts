import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useShowMore } from "./useShowMore";

describe("useShowMore", () => {
  it("shows one step, then more on request", () => {
    const { result } = renderHook(() => useShowMore(120, "all", 50));
    expect(result.current.count).toBe(50);
    expect(result.current.remaining).toBe(70);
    act(() => result.current.showMore());
    expect(result.current.count).toBe(100);
    expect(result.current.remaining).toBe(20);
  });

  it("starts again when the filters change, but not when only the total changes", () => {
    const { result, rerender } = renderHook(({ total, key }) => useShowMore(total, key, 50), {
      initialProps: { total: 120, key: "all" },
    });
    act(() => result.current.showMore());
    rerender({ total: 119, key: "all" });
    expect(result.current.count).toBe(100);
    rerender({ total: 30, key: "today" });
    expect(result.current.count).toBe(50);
    expect(result.current.remaining).toBe(0);
  });
});
