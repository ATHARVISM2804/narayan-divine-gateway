import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Puja } from "@/lib/supabase";
import { bookingDeadline } from "@/lib/countdown";
import { prefetchProps } from "@/lib/prefetch";
import { MIN_PROOF_COUNT, type Review, type SiteStats } from "@/lib/proof";
import FitImage from "@/components/FitImage";
import Countdown from "@/components/shared/Countdown";
import { TempleIcon } from "@/components/icons";
import { Eyebrow, Price } from "@/components/ui/typography";
import SocialProofRow from "@/components/proof/SocialProofRow";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 7000;

/** One featured puja: poster, facts, its real booking countdown, one action. */
const Slide = ({ puja, priority }: { puja: Puja; priority: boolean }) => {
  const { t, lang } = useLanguage();
  const hi = lang === "hi";
  const deadline = useMemo(() => bookingDeadline(puja.date, puja.countdown_datetime), [puja]);
  const name = hi && puja.name_hi ? puja.name_hi : puja.name;
  const occasion = hi && puja.occasion_hi ? puja.occasion_hi : puja.occasion;
  const place = hi && puja.location_hi ? puja.location_hi : puja.location;
  const prices = puja.prices ?? [];
  const minPrice = prices.length ? Math.min(...prices.map((p) => p.price)) : null;

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-surface">
      <Link to={`/puja/${puja.id}`} {...prefetchProps("puja", puja.id)} className="relative block aspect-[1483/1061] overflow-hidden bg-surface-muted">
        {puja.image_url ? (
          <FitImage src={puja.image_url} alt={name} width={640} sizes="(min-width: 1280px) 440px, (min-width: 1024px) 400px, 100vw" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} />
        ) : (
          <span className="grid h-full w-full place-items-center text-ink-soft"><TempleIcon size={40} /></span>
        )}
      </Link>
      <div className="p-4 md:p-5">
        {occasion && <Eyebrow className="mb-1.5">{occasion}</Eyebrow>}
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-ink">{name}</h3>
        <ul className="mt-2 space-y-1 text-sm font-medium text-ink-muted lg:flex lg:flex-wrap lg:gap-x-4 lg:gap-y-1 lg:space-y-0">
          {place && <li className="flex items-center gap-2"><TempleIcon size={16} className="shrink-0 text-saffron" /> <span className="line-clamp-1">{place}</span></li>}
          {puja.date && <li className="flex items-center gap-2"><CalendarDays size={16} strokeWidth={1.75} className="shrink-0 text-saffron" /> <span className="line-clamp-1">{puja.date}</span></li>}
        </ul>
        <div className="mt-3">
          <Countdown deadline={deadline} label={t("timer_label")} expiredLabel={t("timer_expired")} compact />
        </div>
        <div className="mt-4 flex items-center gap-3">
          {minPrice != null && <Price amount={minPrice} prefix={t("pd_from")} className="text-lg" />}
          <Link to={`/puja/${puja.id}`} {...prefetchProps("puja", puja.id)} className="btn-primary flex-1">
            {t("hero_book")} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
};

/** Same footprint as a Slide (poster + facts + dots), shown while the pujas load so the
    sections below don't jump down when the first slide arrives (layout shift was 0.5). */
const SlideSkeleton = () => (
  <div aria-hidden="true">
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="aspect-[1483/1061] animate-pulse bg-surface-muted" />
      <div className="h-[280px] p-4 md:p-5">
        <div className="h-5 w-3/4 rounded bg-surface-muted" />
        <div className="mt-3 h-4 w-1/2 rounded bg-surface-muted" />
      </div>
    </div>
    <div className="mt-3 h-2" />
  </div>
);

/** Home hero: what we do in one line, the proof, and the next pujas to book. */
const HomeHero = ({
  pujas, stats, reviews = [], onRatingClick, loading = false,
}: {
  pujas: Puja[]; stats: SiteStats | null; reviews?: Review[]; onRatingClick?: () => void; loading?: boolean;
}) => {
  const { t } = useLanguage();
  const slides = pujas.slice(0, 4);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  // Don't swap slides (a new image decode each time) while the hero is scrolled
  // away or the tab is in the background: on phones that work landed mid-scroll.
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let inView = true;
    const update = () => setOnScreen(inView && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  useEffect(() => {
    if (paused || !onScreen || slides.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, onScreen, slides.length]);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [active, slides.length]);

  const devotees = stats && stats.devotees >= MIN_PROOF_COUNT ? stats.devotees : null;
  const points = [t("hero_s1_t1"), t("hero_s1_t2"), t("hero_s1_t3")];

  return (
    <section ref={sectionRef} className="border-b border-line bg-surface-muted/60">
      <div className="container grid grid-cols-1 items-center gap-6 py-6 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-12 lg:py-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] xl:gap-16">
        <div>
          <h1 className="text-[26px] font-bold leading-tight text-ink md:text-4xl lg:text-[42px] lg:leading-[1.15] xl:text-5xl">
            {t("hero_s1_title")} <span className="text-maroon">{t("hero_s1_accent")}</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted md:text-lg lg:mt-4 lg:text-xl">{t("hero_s1_sub")}</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <Check size={16} strokeWidth={2.5} className="text-success" /> {p}
              </li>
            ))}
          </ul>
          {/* Rating + devotee count. Holds the count's line until stats arrive, so the page doesn't shift. */}
          <SocialProofRow reviews={reviews} devotees={devotees} loading={!stats} onRatingClick={onRatingClick} className="mt-5" />
          <div className="mt-6 hidden gap-3 sm:flex">
            <Link to="/puja" className="btn-primary">{t("featured_view_all")} <ArrowRight size={18} /></Link>
            <Link to="/chadhava" className="btn-secondary">{t("hero_book_chadhava")}</Link>
          </div>
        </div>

        {slides.length === 0 && loading && <SlideSkeleton />}
        {slides.length > 0 && (
          <div
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onTouchStart={(e) => { setPaused(true); touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) setActive((i) => (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length);
              touchX.current = null;
            }}
          >
            <Slide key={slides[active]?.id} puja={slides[active] ?? slides[0]} priority={active === 0} />
            {slides.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(i)}
                    aria-label={`Pooja ${i + 1}`}
                    aria-current={i === active ? "true" : undefined}
                    className={cn("h-2 rounded-full transition-all", i === active ? "w-6 bg-maroon" : "w-2 bg-ink-soft/40")}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeHero;
