import { useMemo } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import { parseDate } from "@/lib/parseDate";
import { useCatalog } from "@/lib/catalog";
import { chadhavaListFetcher, chadhavaListFromSnapshot, type ChadhavaList } from "@/lib/catalogQueries";
import { useReviews, useSiteStats } from "@/lib/proof";
import { DegradedBanner, LoadError } from "@/components/LoadError";
import ListingHeader from "@/components/shared/ListingHeader";
import TrustRow from "@/components/shared/TrustRow";
import { CardSkeleton, ChadhavaCard } from "@/components/cards/PujaCard";
import ReviewsSection from "@/components/proof/ReviewsSection";
import SectionHeading from "@/components/SectionHeading";

const Chadhava = () => {
  const { t } = useLanguage();
  usePageTitle(`${t("chadhava_hero_title")} | Narayan Kripa`);
  const { data, loading, degraded, failed, retry } = useCatalog<ChadhavaList>(
    "chadhavas:active",
    chadhavaListFetcher,
    chadhavaListFromSnapshot,
  );
  const { data: stats } = useSiteStats();
  const { data: reviews } = useReviews();

  const chadhavas = useMemo(
    () => [...(data?.chadhavas ?? [])].sort((a, b) => parseDate(a.date, a.countdown_datetime) - parseDate(b.date, b.countdown_datetime)),
    [data],
  );

  return (
    <main>
      <ListingHeader title={t("chadhava_hero_title")} subtitle={t("chadhava_hero_sub")} crumb={t("breadcrumb_chadhava")} />

      <section className="py-6 md:py-10">
        <div className="container">
          <TrustRow className="mb-6" />
          {degraded && <DegradedBanner className="mb-4" />}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : failed ? (
              <LoadError onRetry={retry} className="col-span-full" />
            ) : chadhavas.length === 0 ? (
              <p className="col-span-full rounded-xl border border-line bg-surface p-8 text-center text-ink-muted">{t("chadhava_empty")}</p>
            ) : (
              chadhavas.map((c, i) => (
                <ChadhavaCard key={c.id} chadhava={c} booked={stats?.by_item?.[c.id]} priority={i === 0} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted/60 py-12 md:py-16">
        <div className="container">
          <SectionHeading title={t("ch_how_title")} />
          <ol className="grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex gap-4 rounded-xl border border-line bg-surface p-4 md:p-5">
                <span className="tabular grid h-8 w-8 shrink-0 place-items-center rounded-full bg-saffron text-sm font-bold text-white">{n}</span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{t(`ch_how_s${n}_title`)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t(`ch_how_s${n}_desc`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ReviewsSection reviews={reviews ?? []} limit={3} />
    </main>
  );
};

export default Chadhava;
