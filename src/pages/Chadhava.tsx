import { useMemo } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import { parseDate } from "@/lib/parseDate";
import { useCatalog } from "@/lib/catalog";
import {
  activePujasFetcher,
  activePujasFromSnapshot,
  chadhavaListFetcher,
  chadhavaListFromSnapshot,
  type ChadhavaList,
} from "@/lib/catalogQueries";
import type { Puja } from "@/lib/supabase";
import { whatsappLink } from "@/lib/whatsapp";
import { trackContact } from "@/lib/metaPixel";
import { MessageCircle } from "lucide-react";
import { useReviews, useSiteStats } from "@/lib/proof";
import { DegradedBanner, LoadError } from "@/components/LoadError";
import ListingHeader from "@/components/shared/ListingHeader";
import TrustRow from "@/components/shared/TrustRow";
import { CardSkeleton, ChadhavaCard, PujaCard } from "@/components/cards/PujaCard";
import { cardGridClass } from "@/components/cards/cardGrid";
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
  const minPrices = data?.minPrices ?? {};

  // Nothing open: offer the upcoming pujas instead of a dead end (fetched only then).
  const isEmpty = !loading && !failed && chadhavas.length === 0;
  const { data: pujas } = useCatalog<Puja[]>(isEmpty ? "pujas:active" : null, activePujasFetcher, activePujasFromSnapshot);
  const suggested = (pujas ?? []).slice(0, 3);

  return (
    <main>
      <ListingHeader
        title={t("chadhava_hero_title")}
        subtitle={t("chadhava_hero_sub")}
        aside={<TrustRow className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-3" />}
      />

      <section className="py-6 md:py-10">
        <div className="container">
          <TrustRow className="mb-6 lg:hidden" />
          {degraded && <DegradedBanner className="mb-4" />}
          <div className={loading || failed ? cardGridClass(3) : cardGridClass(chadhavas.length)}>
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : failed ? (
              <LoadError onRetry={retry} className="col-span-full" />
            ) : chadhavas.length === 0 ? (
              <div className="col-span-full rounded-xl border border-line bg-surface p-6 text-center md:p-8">
                <p className="text-[15px] font-semibold text-ink">{t("chadhava_empty")}</p>
                <p className="mx-auto mt-1.5 max-w-xl text-sm leading-relaxed text-ink-muted">{t("ch_empty_sub")}</p>
                <a
                  href={whatsappLink(t("wa_msg_chadhava_notify"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackContact("whatsapp_chadhava_notify")}
                  className="btn-secondary mt-4"
                >
                  <MessageCircle size={18} /> {t("ch_empty_cta")}
                </a>
              </div>
            ) : (
              chadhavas.map((c, i) => (
                <ChadhavaCard key={c.id} chadhava={c} minPrice={minPrices[c.id]} booked={stats?.by_item?.[c.id]} priority={i === 0} />
              ))
            )}
          </div>

          {isEmpty && suggested.length > 0 && (
            <div className="mt-10">
              <SectionHeading title={t("featured_title")} subtitle={t("featured_sub")} />
              <div className={cardGridClass(suggested.length)}>
                {suggested.map((p) => (
                  <PujaCard key={p.id} puja={p} booked={stats?.by_item?.[p.id]} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted/60 py-12 md:py-16">
        <div className="container">
          <SectionHeading title={t("ch_how_title")} />
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
