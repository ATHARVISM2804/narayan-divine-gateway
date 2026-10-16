import { useEffect, useState } from "react";

/**
 * True while none of the elements with these ids is on screen. The pooja and
 * chadhava pages use it to hide the sticky button while the page's own button
 * (or the package list) is already in view, so there are never two at once.
 *
 * `ready`: pass true once the page has rendered those elements (after loading).
 * Without IntersectionObserver it stays true.
 */
export function useAllOffscreen(ids: string[], ready = true): boolean {
  const [offscreen, setOffscreen] = useState(true);
  const key = ids.join(",");

  useEffect(() => {
    if (!ready || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
      setOffscreen(visible.size === 0);
    });
    key.split(",").forEach((id) => {
      const el = id && document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [key, ready]);

  return offscreen;
}
