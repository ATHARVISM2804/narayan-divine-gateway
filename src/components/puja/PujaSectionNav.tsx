import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

/** `mobileOnly`: the tab is hidden from lg up (e.g. Packages, which the laptop booking panel replaces). */
export interface NavSection { id: string; labelKey: string; mobileOnly?: boolean }

/** Sticky tabs under the header with scroll-spy. Sits right below the 64px header. */
const PujaSectionNav = ({ sections }: { sections: NavSection[] }) => {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState("");
  const ids = useMemo(() => sections.map((s) => s.id).join(","), [sections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    );
    ids.split(",").forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  if (sections.length < 2) return null;

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-surface">
      <nav className="container px-0 sm:px-4 lg:px-0" aria-label="Sections">
        <ul className="flex overflow-x-auto scrollbar-hide">
          {sections.map((s) => {
            const active = activeId === s.id;
            return (
              <li key={s.id} className={cn("shrink-0 md:flex-1", s.mobileOnly && "lg:hidden")}>
                <button
                  onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className={cn(
                    "relative w-full whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                    active ? "text-saffron-dark" : "text-ink-soft hover:text-ink",
                  )}
                >
                  {t(s.labelKey)}
                  {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-saffron" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default PujaSectionNav;
