import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Section { id: string; labelKey: string; }

const SECTIONS: Section[] = [
  { id: "aboutPuja", labelKey: "pd_about" },
  { id: "pujaBenefits", labelKey: "pd_benefits" },
  { id: "pujaProcess", labelKey: "pd_process" },
  { id: "templeDetails", labelKey: "pd_temple" },
  { id: "packages", labelKey: "pd_packages" },
  { id: "faqSection", labelKey: "pd_faqs" },
];

const PujaSectionNav = ({ visibleSections }: { visibleSections: string[] }) => {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState("");

  const filtered = SECTIONS.filter(s => visibleSections.includes(s.id));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    filtered.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [filtered]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (filtered.length < 2) return null;

  return (
    <div className="sticky top-[64px] z-30 bg-ivory/95 backdrop-blur-md border-b border-gold/30 shadow-sm">
      <nav className="container px-0 sm:px-4">
        <ul className="flex items-stretch overflow-x-auto scrollbar-hide">
          {filtered.map(s => {
            const isActive = activeId === s.id;
            return (
              <li key={s.id} className="shrink-0 md:flex-1">
                <button
                  onClick={() => scrollTo(s.id)}
                  className={`relative w-full min-w-[90px] px-3 py-3 text-[12px] md:text-sm font-bold text-center whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-saffron"
                      : "text-brown/55 hover:text-maroon"
                  }`}
                >
                  {t(s.labelKey)}
                  {/* Active underline accent */}
                  {isActive && (
                    <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-saffron to-gold" />
                  )}
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
