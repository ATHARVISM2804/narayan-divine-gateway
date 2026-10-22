import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import type { Puja as PujaType } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { parseDate } from "@/lib/parseDate";
import { useCatalog } from "@/lib/catalog";
import { activePujasFetcher, activePujasFromSnapshot } from "@/lib/catalogQueries";
import { useReviews, useSiteStats } from "@/lib/proof";
import { DegradedBanner, LoadError } from "@/components/LoadError";
import ListingHeader from "@/components/shared/ListingHeader";
import { CardSkeleton, PujaCard } from "@/components/cards/PujaCard";
import { cardGridClass } from "@/components/cards/cardGrid";
import HowItWorks from "@/components/home/HowItWorks";
import ReviewsSection from "@/components/proof/ReviewsSection";
import { cn } from "@/lib/utils";

/** Temple filter chips appear only when there is enough to filter. */
const MIN_FOR_FILTERS = 4;

const Puja = () => {
  const { t, lang } = useLanguage();
  usePageTitle(`${t("puja_hero_title")} | Narayan Kripa`);
  const [params, setParams] = useSearchParams();
  const place = params.get("temple");

  const { data, loading, degraded, failed, retry } = useCatalog<PujaType[]>(
    "pujas:active",
    activePujasFetcher,
    activePujasFromSnapshot,
  );
  const { data: stats } = useSiteStats();
  const { data: reviews } = useReviews();

  const pujas = useMemo(
    () => [...(data ?? [])].sort((a, b) => parseDate(a.date, a.countdown_datetime) - parseDate(b.date, b.countdown_datetime)),
    [data],
  );
  const placeOf = (p: PujaType) => (lang === "hi" && p.location_hi ? p.location_hi : p.location) || "";
  const places = useMemo(() => [...new Set(pujas.map(placeOf).filter(Boolean))], [pujas, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = place ? pujas.filter((p) => placeOf(p) === place) : pujas;
  const showFilters = pujas.length >= MIN_FOR_FILTERS && places.length > 1;

  const setPlace = (v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set("temple", v);
    else next.delete("temple");
    setParams(next, { replace: true });
  };

  return (
    <main>
      <ListingHeader
        title={t("puja_hero_title")}
        subtitle={t("puja_hero_sub")}
        centered
      />

      <section className="py-6 md:py-10">
        <div className="container">
          {showFilters && (
            <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide lg:mx-0 lg:flex-wrap lg:px-0">
              {[null, ...places].map((v) => (
                <button
                  key={v ?? "all"}
                  onClick={() => setPlace(v)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    place === v ? "border-maroon bg-maroon text-white" : "border-line bg-surface text-ink hover:border-ink-soft",
                  )}
                >
                  {v ?? t("filter_all")}
                </button>
              ))}
            </div>
          )}

          {degraded && <DegradedBanner className="mb-4" />}
          <div className={loading || failed ? cardGridClass(3) : cardGridClass(shown.length)}>
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : failed ? (
              <LoadError onRetry={retry} className="col-span-full" />
            ) : shown.length === 0 ? (
              <p className="col-span-full rounded-xl border border-line bg-surface p-8 text-center text-ink-muted">
                {place ? t("filter_none") : t("puja_empty")}
              </p>
            ) : (
              shown.map((p, i) => <PujaCard key={p.id} puja={p} booked={stats?.by_item?.[p.id]} priority={i === 0} />)
            )}
          </div>
        </div>
      </section>

      <HowItWorks className="border-t border-line bg-surface-muted/60" />
      <ReviewsSection reviews={reviews ?? []} limit={3} />
    </main>
  );
};

export default Puja;
