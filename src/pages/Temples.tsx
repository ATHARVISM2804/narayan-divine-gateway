import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Search } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import type { Temple } from "@/lib/supabase";
import { templeImg, useActiveTemples } from "@/lib/temples";
import FitImage from "@/components/FitImage";
import ListingHeader from "@/components/shared/ListingHeader";
import BottomSheet from "@/components/shared/BottomSheet";
import { DegradedBanner, LoadError } from "@/components/LoadError";
import { cn } from "@/lib/utils";

const Temples = () => {
  const { t, lang } = useLanguage();
  usePageTitle(`${t("tmp_hero")} | Narayan Kripa`);
  const { data, loading, degraded, failed, retry } = useActiveTemples();
  const temples = useMemo(() => data ?? [], [data]);
  const [q, setQ] = useState("");
  const [deity, setDeity] = useState<string | null>(null);
  const [selected, setSelected] = useState<Temple | null>(null);

  const hi = lang === "hi";
  const dName = (tp: Temple) => (hi && tp.name_hi ? tp.name_hi : tp.name);
  const dState = (tp: Temple) => (hi && tp.state_hi ? tp.state_hi : tp.state) || "";
  const dDeity = (tp: Temple) => (hi && tp.deity_hi ? tp.deity_hi : tp.deity) || "";
  const dDesc = (tp: Temple) => (hi && tp.description_hi ? tp.description_hi : tp.description) || "";
  const dHighlights = (tp: Temple) => (hi && tp.highlights_hi?.length ? tp.highlights_hi : tp.highlights) || [];
  const place = (tp: Temple) => [tp.city, dState(tp)].filter(Boolean).join(", ");

  // Deity chips use the English value for filtering and the localized label for display.
  const deities = useMemo(
    () => [...new Map(temples.filter((tp) => tp.deity).map((tp) => [tp.deity as string, dDeity(tp)])).entries()],
    [temples, lang], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const needle = q.trim().toLowerCase();
  const filtered = temples.filter(
    (tp) =>
      (!needle ||
        tp.name.toLowerCase().includes(needle) ||
        (tp.name_hi || "").includes(q.trim()) ||
        (tp.city || "").toLowerCase().includes(needle) ||
        (tp.state || "").toLowerCase().includes(needle)) &&
      (!deity || tp.deity === deity),
  );

  return (
    <main>
      <ListingHeader title={t("tmp_hero")} subtitle={t("tmp_hero_sub")} crumb={t("tmp_breadcrumb")} />

      <section className="py-6 md:py-10">
        <div className="container">
          {/* Laptops: deity filters on the left, search on the right, one row. */}
          <div className="lg:flex lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-6">
            <label className="flex max-w-md items-center gap-2 rounded-[10px] border border-input bg-surface px-3 focus-within:border-saffron lg:w-80 lg:shrink-0">
              <Search size={18} className="shrink-0 text-ink-soft" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("tmp_search")}
                aria-label={t("tmp_search")}
                className="h-11 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-soft/70"
              />
            </label>

            {deities.length > 1 && (
              <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide lg:mx-0 lg:mt-0 lg:flex-wrap lg:px-0 lg:pb-0">
                {[[null, t("filter_all")] as const, ...deities].map(([value, label]) => (
                  <button
                    key={value ?? "all"}
                    onClick={() => setDeity(value)}
                    className={cn(
                      "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      deity === value ? "border-maroon bg-maroon text-white" : "border-line bg-surface text-ink hover:border-ink-soft",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {degraded && <DegradedBanner className="mt-5" />}

          <div className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-surface-muted" />
                ))}
              </div>
            ) : failed ? (
              <LoadError onRetry={retry} />
            ) : filtered.length === 0 ? (
              <p className="rounded-xl border border-line bg-surface p-8 text-center text-ink-muted">{t("tmp_no_results")}</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((tp) => (
                  <li key={tp.id}>
                    <button
                      onClick={() => setSelected(tp)}
                      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-surface text-left transition-[border-color,box-shadow,transform] duration-200 hover:border-saffron/40 lg:hover:-translate-y-0.5 lg:hover:shadow-raised"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
                        <FitImage src={templeImg(tp)} alt={dName(tp)} width={384} sizes="(min-width: 1024px) 440px, (min-width: 640px) 50vw, 100vw" />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        {dDeity(tp) && <p className="text-xs font-semibold uppercase tracking-[0.06em] text-maroon">{dDeity(tp)}</p>}
                        <h3 className="mt-1 text-[17px] font-semibold text-ink">{dName(tp)}</h3>
                        {place(tp) && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                            <MapPin size={14} /> {place(tp)}
                          </p>
                        )}
                        {dDesc(tp) && <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{dDesc(tp)}</p>}
                        <div className="flex-1" />
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-saffron-dark">
                          {t("tmp_view_book")} <ArrowRight size={16} />
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected ? dName(selected) : undefined} className="sm:max-w-xl">
        {selected && (
          <div>
            <div className="relative aspect-video overflow-hidden bg-surface-muted sm:rounded-t-2xl">
              <FitImage src={templeImg(selected)} alt={dName(selected)} loading="eager" width={640} />
            </div>
            <div className="space-y-4 p-5">
              <div>
                {dDeity(selected) && (
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-maroon">
                    {dDeity(selected)}
                    {selected.established ? ` · ${selected.established}` : ""}
                  </p>
                )}
                <h2 className="mt-1 text-xl font-bold text-ink">{dName(selected)}</h2>
                {place(selected) && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                    <MapPin size={14} /> {place(selected)}
                  </p>
                )}
                {selected.timings && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                    <Clock size={14} /> {selected.timings}
                  </p>
                )}
              </div>
              {dDesc(selected) && <p className="text-[15px] leading-relaxed text-ink-muted">{dDesc(selected)}</p>}
              {dHighlights(selected).length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {dHighlights(selected).map((h) => (
                    <li key={h} className="rounded-md bg-surface-muted px-2.5 py-1 text-sm text-ink">
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              <div className="grid gap-3 pt-1 sm:grid-cols-2">
                <Link to="/puja" onClick={() => setSelected(null)} className="btn-primary">
                  {t("tmp_book_puja_here")}
                </Link>
                <Link to="/chadhava" onClick={() => setSelected(null)} className="btn-secondary">
                  {t("tmp_offer_chadhava")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </main>
  );
};

export default Temples;
