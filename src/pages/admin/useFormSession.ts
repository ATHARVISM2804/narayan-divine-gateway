import { useCallback, useRef, useState } from "react";

/**
 * Ties slow callbacks (an image upload finishing seconds later) to the form they started
 * in. `bump()` whenever a different item is opened or the form closes; a callback made
 * with `guard` before that does nothing. Without it a late upload reopened a closed form
 * or put its image on the next pooja opened.
 */
export function useFormSession() {
  const [session, setSession] = useState(0);
  const current = useRef(0);
  const bump = useCallback(() => {
    current.current += 1;
    setSession(current.current);
  }, []);
  const guard = useCallback(
    <A extends unknown[]>(fn: (...args: A) => void) => (...args: A) => {
      if (session === current.current) fn(...args);
    },
    [session],
  );
  return { bump, guard };
}
