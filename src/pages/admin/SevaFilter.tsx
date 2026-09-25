import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  ALL,
  EMPTY_SEVA_FILTER,
  type SevaEntry,
  type SevaFilterValue,
  type SevaType,
  type SubFilterOption,
} from "@/lib/orderFilters";

/*
 * Two-level filter for Admin → Orders.
 *   1. Seva picker: one row per puja (no package suffixes), plus chadhavas and add-ons.
 *   2. When a puja is picked: Date and Package chips with counts.
 * Tap-based (no hover menus) so it works the same on a phone.
 */

interface Props {
  catalog: Record<SevaType, SevaEntry[]>;
  /** Chip options; dateTotal/packageTotal are each row's "All" count. */
  subFilters: { dates: SubFilterOption[]; packages: SubFilterOption[]; dateTotal: number; packageTotal: number };
  value: SevaFilterValue;
  typeFilter: "all" | SevaType;
  onChange: (value: SevaFilterValue) => void;
}

const SECTIONS: { type: SevaType; label: string; icon: string }[] = [
  { type: "puja", label: "Pujas", icon: "🪔" },
  { type: "chadhava", label: "Chadhavas", icon: "🌺" },
  { type: "addon", label: "Add-ons", icon: "🎁" },
];

const chipCls = (active: boolean) =>
  `rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
    active ? "bg-saffron text-white border-saffron shadow-sm" : "bg-cream border-gold/40 text-maroon hover:bg-gold/20"
  }`;

const ChipRow = ({
  label, options, total, selected, onSelect,
}: {
  label: string;
  options: SubFilterOption[];
  total: number;
  selected: string;
  onSelect: (key: string) => void;
}) => (
  <div className="flex flex-wrap gap-2 items-center">
    <span className="text-[11px] text-brown/50 font-semibold w-16 shrink-0">{label}:</span>
    <div className="flex flex-wrap gap-1.5">
      <button onClick={() => onSelect(ALL)} className={chipCls(selected === ALL)}>
        All <span className="ml-0.5 opacity-70">({total})</span>
      </button>
      {options.map((o) => (
        <button key={o.key} onClick={() => onSelect(o.key)} className={chipCls(selected === o.key)}>
          {o.label} <span className="ml-0.5 opacity-70">({o.count})</span>
        </button>
      ))}
    </div>
  </div>
);

const SevaFilter = ({ catalog, subFilters, value, typeFilter, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allEntries = useMemo(() => [...catalog.puja, ...catalog.chadhava, ...catalog.addon], [catalog]);
  const selected = allEntries.find((e) => e.key === value.sevaKey) ?? null;

  /* Sections visible under the current Type chip, filtered by the search text. */
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SECTIONS
      .filter((s) => typeFilter === "all" || typeFilter === s.type)
      .map((s) => ({ ...s, entries: catalog[s.type].filter((e) => !q || e.label.toLowerCase().includes(q)) }))
      .filter((s) => s.entries.length > 0);
  }, [catalog, query, typeFilter]);

  const flat = useMemo(() => sections.flatMap((s) => s.entries), [sections]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // Focus search and reset highlight when opening or when the list changes.
  useEffect(() => { if (open) searchRef.current?.focus(); }, [open]);
  useEffect(() => { setActive(0); }, [query, open]);

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (entry: SevaEntry) => {
    onChange({ sevaKey: entry.key, dateKey: ALL, packageKey: ALL });
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, flat.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && flat[active]) { e.preventDefault(); choose(flat[active]); }
  };

  const showDates = selected?.type === "puja" && subFilters.dates.length > 1;
  const showPackages = selected?.type === "puja" && subFilters.packages.length > 1;

  let rowIndex = -1;

  return (
    <div className="space-y-3">
      {/* ── Level 1: Seva picker ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-brown/50 font-semibold w-16 shrink-0">Seva:</span>
        <div ref={rootRef} className="relative flex-1 min-w-0 sm:min-w-[260px] max-w-md" onKeyDown={onKeyDown}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={`flex w-full items-center gap-2 rounded-xl border bg-cream pl-3 pr-2 py-2 text-left text-xs font-semibold text-maroon outline-none transition-colors ${
              open ? "border-saffron ring-2 ring-saffron/20" : "border-gold/40 hover:border-saffron/50"
            }`}
          >
            <span className="flex-1 min-w-0 truncate">
              {selected
                ? <>{SECTIONS.find((s) => s.type === selected.type)?.icon} {selected.label}</>
                : <span className="text-brown/60">All pujas, chadhavas & add-ons</span>}
            </span>
            {selected && <span className="shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-brown/70">{selected.count}</span>}
            <ChevronDown size={14} className={`shrink-0 text-brown/40 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            // On phones the panel also spans the "Seva:" label column (w-16 + gap = 4.5rem) so long names have room.
            <div className="absolute -left-[4.5rem] right-0 sm:left-0 z-30 mt-1.5 overflow-hidden rounded-xl border border-gold/40 bg-ivory shadow-xl sm:min-w-[380px]">
              <div className="flex items-center gap-2 border-b border-gold/20 px-3 py-2">
                <Search size={13} className="shrink-0 text-brown/40" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search puja, chadhava or add-on…"
                  className="w-full bg-transparent text-xs text-maroon outline-none placeholder:text-brown/40"
                />
                {query && (
                  <button onClick={() => setQuery("")} aria-label="Clear search" className="text-brown/40 hover:text-maroon">
                    <X size={13} />
                  </button>
                )}
              </div>

              <div ref={listRef} role="listbox" className="max-h-[60vh] overflow-y-auto py-1">
                {value.sevaKey !== ALL && !query && (
                  <button
                    onClick={() => { onChange(EMPTY_SEVA_FILTER); setOpen(false); }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-saffron hover:bg-gold/15"
                  >
                    Show all items
                  </button>
                )}
                {sections.length === 0 && (
                  <p className="px-3 py-6 text-center text-xs text-brown/50">
                    {query ? <>No match for “{query}”</> : "No bookings yet"}
                  </p>
                )}
                {sections.map((section) => (
                  <div key={section.type}>
                    <p className="sticky top-0 bg-ivory px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-brown/50">
                      {section.icon} {section.label}
                    </p>
                    {section.entries.map((entry) => {
                      rowIndex += 1;
                      const index = rowIndex;
                      const isSelected = entry.key === value.sevaKey;
                      return (
                        <button
                          key={entry.key}
                          data-index={index}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setActive(index)}
                          onClick={() => choose(entry)}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left text-xs transition-colors ${
                            index === active ? "bg-gold/20" : ""
                          } ${isSelected ? "font-bold text-saffron" : "text-maroon"}`}
                        >
                          <span className="flex-1 min-w-0 leading-snug">{entry.label}</span>
                          <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-brown/60">{entry.count}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {selected && (
          <button
            onClick={() => onChange(EMPTY_SEVA_FILTER)}
            className="text-[11px] text-red-400 hover:text-red-600 font-semibold underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Level 2: Date and Package for the chosen puja ── */}
      {showDates && (
        <ChipRow
          label="Date"
          options={subFilters.dates}
          total={subFilters.dateTotal}
          selected={value.dateKey}
          onSelect={(dateKey) => onChange({ ...value, dateKey })}
        />
      )}
      {showPackages && (
        <ChipRow
          label="Package"
          options={subFilters.packages}
          total={subFilters.packageTotal}
          selected={value.packageKey}
          onSelect={(packageKey) => onChange({ ...value, packageKey })}
        />
      )}
    </div>
  );
};

export default SevaFilter;
