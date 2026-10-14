import { useState } from "react";

/** How many admin rows are drawn before "Show more". */
export const SHOW_MORE_STEP = 50;

/**
 * Admin lists draw only the first rows of a long list. Drawing all 800 orders or
 * 1,300+ leads at once (tens of thousands of elements) made the admin panel slow
 * to open, scroll and type in on phones. Changing `resetKey` (the filters and
 * search) starts again from the first rows; a Contacted tap does not.
 */
export function useShowMore(total: number, resetKey: string, step = SHOW_MORE_STEP) {
  const [state, setState] = useState({ key: resetKey, count: step });
  const count = state.key === resetKey ? state.count : step;
  return {
    count,
    remaining: Math.max(0, total - count),
    showMore: () => setState({ key: resetKey, count: count + step }),
  };
}
