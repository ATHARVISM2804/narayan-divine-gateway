import { useMemo } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCatalog } from "@/lib/catalog";
import { parseDate } from "@/lib/parseDate";
import { bookingDeadline } from "@/lib/countdown";
import type { Puja } from "@/lib/supabase";
import {
  activePujasFetcher,
  activePujasFromSnapshot,
  chadhavaListFetcher,
  chadhavaListFromSnapshot,
  type ChadhavaList,
} from "@/lib/catalogQueries";
import { MIN_PROOF_COUNT, useReviews, useSiteStats } from "@/lib/proof";
import { useActiveTemples } from "@/lib/temples";
import { DegradedBanner } from "@/components/LoadError";
import HomeHero from "@/components/home/HomeHero";
import { FeaturedChadhavas, FeaturedPujas, HomeFaq, TemplePartners, TrustStrip, WhyUs } from "@/components/home/HomeSections";
import HowItWorks from "@/components/home/HowItWorks";
import ReviewsSection from "@/components/proof/ReviewsSection";
import WhatYouReceive from "@/components/home/WhatYouReceive";
import AppDownload from "@/components/home/AppDownload";

const byDate = <T extends { date?: string | null; countdown_datetime?: string | null }>(a: T, b: T) =>
  parseDate(a.date, a.countdown_datetime) - parseDate(b.date, b.countdown_datetime);

const Home = () => {
  usePageTitle("Narayan Kripa | Online Pooja and Chadhava at Famous Temples");

  const pujasQ = useCatalog<Puja[]>("pujas:active", activePujasFetcher, activePujasFromSnapshot);
  const chadhavasQ = useCatalog<ChadhavaList>("chadhavas:active", chadhavaListFetcher, chadhavaListFromSnapshot);
  const { data: temples } = useActiveTemples();
  const { data: reviews } = useReviews();
  const { data: stats } = useSiteStats();
  const devotees = stats && stats.devotees >= MIN_PROOF_COUNT ? stats.devotees : null;
  // The rating links scroll to the reviews; with no reviews yet there is nothing to scroll to.
  const toReviews = reviews?.length ? () => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" }) : undefined;

  const pujas = useMemo(() => [...(pujasQ.data ?? [])].sort(byDate), [pujasQ.data]);
  // Featured pujas lead the hero (without any, the next pujas by date do), and
  // pujas still open for booking come before closed ones.
  const heroPujas = useMemo(() => {
    const featured = pujas.filter((p) => p.featured);
    const list = featured.length ? featured : pujas;
    const now = Date.now();
    const open = (p: Puja) => (bookingDeadline(p.date, p.countdown_datetime)?.getTime() ?? Infinity) > now;
    return [...list.filter(open), ...list.filter((p) => !open(p))];
  }, [pujas]);
  const chadhavas = useMemo(() => [...(chadhavasQ.data?.chadhavas ?? [])].sort(byDate), [chadhavasQ.data]);

  return (
    <main>
      {pujasQ.degraded && (
        <div className="container pt-3">
          <DegradedBanner />
        </div>
      )}
      <HomeHero pujas={heroPujas} stats={stats} loading={pujasQ.loading} />
      <TrustStrip stats={stats} />
      <FeaturedPujas pujas={pujas} loading={pujasQ.loading} failed={pujasQ.failed} retry={pujasQ.retry} stats={stats} />
      <WhatYouReceive devotees={devotees} onReviewsClick={toReviews} />
      <FeaturedChadhavas chadhavas={chadhavas} minPrices={chadhavasQ.data?.minPrices ?? {}} stats={stats} />
      <HowItWorks className="border-t border-line bg-surface-muted/60" />
      <ReviewsSection id="reviews" reviews={reviews ?? []} className="scroll-mt-20 border-t border-line py-12 md:py-16" />
      <WhyUs stats={stats} />
      <TemplePartners temples={temples ?? []} />
      <HomeFaq />
      <AppDownload />
    </main>
  );
};

export default Home;
