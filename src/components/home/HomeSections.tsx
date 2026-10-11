/* Home page sections that are simple enough to live together. */
import { Link } from "react-router-dom";
import { ArrowRight, Lock, MessageCircle, Users, Video } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Chadhava, Puja, Temple } from "@/lib/supabase";
import { MIN_PROOF_COUNT, roundedCount, type SiteStats } from "@/lib/proof";
import { templeImg } from "@/lib/temples";
import SectionHeading from "@/components/SectionHeading";
import FitImage from "@/components/FitImage";
import FaqList from "@/components/shared/FaqList";
import { CardSkeleton, ChadhavaCard, PujaCard } from "@/components/cards/PujaCard";
import { cardGridClass, isWideGrid } from "@/components/cards/cardGrid";
import { LoadError } from "@/components/LoadError";
import { NamasteIcon, PrasadBoxIcon, SankalpIcon, TempleIcon } from "@/components/icons";

const SeeAll = ({ to, label }: { to: string; label: string }) => (
  <Link to={to} className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-saffron-dark hover:underline">
    {label} <ArrowRight size={16} />
  </Link>
);

/** Four promises right under the hero. The devotee count is real (paid orders). */
export const TrustStrip = ({ stats }: { stats: SiteStats | null }) => {
  const { t } = useLanguage();
  const devotees = stats && stats.devotees >= MIN_PROOF_COUNT ? stats.devotees : null;
  const items = [
    devotees
      ? { icon: Users, label: `${roundedCount(devotees)} ${t("home_trust_devotees")}` }
      : { icon: TempleIcon, label: t("hero_s1_t1") },
    { icon: Lock, label: t("home_trust_secure") },
    { icon: Video, label: t("home_trust_video") },
    { icon: PrasadBoxIcon, label: t("home_trust_prasad") },
  ];
  return (
    <div className="border-b border-line bg-surface">
      <ul className="container grid grid-cols-2 gap-x-4 gap-y-3 py-4 md:flex md:justify-between">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-[13px] font-semibold text-ink md:text-sm">
            <Icon size={18} strokeWidth={1.75} className="shrink-0 text-saffron-dark" /> {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const FeaturedPujas = ({
  pujas,
  loading,
  failed,
  retry,
  stats,
}: {
  pujas: Puja[];
  loading: boolean;
  failed: boolean;
  retry: () => void;
  stats: SiteStats | null;
}) => {
  const { t } = useLanguage();
  if (!loading && !failed && pujas.length === 0) return null;
  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <SectionHeading title={t("featured_title")} subtitle={t("featured_sub")} action={<SeeAll to="/puja" label={t("btn_see_all")} />} />
        <div className={loading || failed ? cardGridClass(3) : cardGridClass(Math.min(pujas.length, 6))}>
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : failed ? (
            <LoadError onRetry={retry} />
          ) : (
            pujas.slice(0, 6).map((p) => <PujaCard key={p.id} puja={p} booked={stats?.by_item?.[p.id]} wide={isWideGrid(pujas.length)} />)
          )}
        </div>
      </div>
    </section>
  );
};

/** Hidden entirely when no chadhava is open (never prints an empty message on home). */
export const FeaturedChadhavas = ({
  chadhavas,
  minPrices,
  stats,
}: {
  chadhavas: Chadhava[];
  minPrices: Record<string, number>;
  stats: SiteStats | null;
}) => {
  const { t } = useLanguage();
  if (chadhavas.length === 0) return null;
  return (
    <section className="border-t border-line py-10 md:py-14">
      <div className="container">
        <SectionHeading
          title={t("featured_ch_title")}
          subtitle={t("featured_ch_sub")}
          action={<SeeAll to="/chadhava" label={t("btn_see_all")} />}
        />
        <div className={cardGridClass(Math.min(chadhavas.length, 3))}>
          {chadhavas.slice(0, 3).map((c) => (
            <ChadhavaCard key={c.id} chadhava={c} minPrice={minPrices[c.id]} booked={stats?.by_item?.[c.id]} wide={isWideGrid(chadhavas.length)} />
          ))}
        </div>
      </div>
    </section>
  );
};

/** Real totals with what they mean, plus the six reasons to book. */
export const WhyUs = ({ stats }: { stats: SiteStats | null }) => {
  const { t } = useLanguage();
  const reasons = [
    { icon: TempleIcon, title: t("why_1_t"), desc: t("why_1_d") },
    { icon: SankalpIcon, title: t("why_2_t"), desc: t("why_2_d") },
    { icon: Video, title: t("why_3_t"), desc: t("why_3_d") },
    { icon: PrasadBoxIcon, title: t("why_4_t"), desc: t("why_4_d") },
    { icon: Lock, title: t("why_5_t"), desc: t("why_5_d") },
    { icon: MessageCircle, title: t("why_6_t"), desc: t("why_6_d") },
  ];
  const figures =
    stats && stats.devotees >= MIN_PROOF_COUNT
      ? [
          { value: roundedCount(stats.devotees), label: t("why_stat_devotees_d") },
          { value: roundedCount(stats.bookings), label: t("why_stat_pujas_d") },
          ...(stats.temples > 0 ? [{ value: String(stats.temples), label: t("why_stat_temples_d") }] : []),
        ]
      : [];

  return (
    <section className="border-t border-line bg-surface-muted/60 py-12 md:py-16">
      <div className="container">
        <SectionHeading title={t("why_title")} subtitle={t("why_sub")} />
        {figures.length > 0 && (
          <dl className="mb-6 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-surface">
            {figures.map((f) => (
              <div key={f.label} className="px-3 py-4 text-center md:px-6 md:py-5">
                <dt className="tabular text-xl font-bold text-maroon md:text-3xl">{f.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-ink-muted md:text-sm">{f.label}</dd>
              </div>
            ))}
          </dl>
        )}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex gap-4 rounded-xl border border-line bg-surface p-4 md:p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron-soft text-saffron-dark">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/** Partner temples as a photo grid (live from the temples table). */
export const TemplePartners = ({ temples }: { temples: Temple[] }) => {
  const { t, lang } = useLanguage();
  if (temples.length === 0) return null;
  return (
    <section className="border-t border-line py-12 md:py-16">
      <div className="container">
        <SectionHeading title={t("tp_title")} subtitle={t("tp_sub")} action={<SeeAll to="/temples" label={t("btn_see_all")} />} />
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {temples.slice(0, 6).map((tp) => {
            const name = lang === "hi" && tp.name_hi ? tp.name_hi : tp.name;
            const place = [tp.city, lang === "hi" && tp.state_hi ? tp.state_hi : tp.state].filter(Boolean).join(", ");
            return (
              <li key={tp.id}>
                <Link to="/temples" className="group block overflow-hidden rounded-xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-200 lg:hover:-translate-y-0.5 lg:hover:border-saffron/40 lg:hover:shadow-raised">
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                    <FitImage src={templeImg(tp)} alt={name} width={256} />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-sm font-semibold text-ink">{name}</p>
                    {place && <p className="line-clamp-1 text-xs text-ink-soft">{place}</p>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export const HomeFaq = () => {
  const { t } = useLanguage();
  const faqs = [1, 2, 3, 4, 5].map((n) => ({ question: t(`faq_home_q${n}`), answer: t(`faq_home_a${n}`) }));
  return (
    <section className="border-t border-line py-12 md:py-16">
      <div className="container grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:gap-12">
        <div>
          <SectionHeading title={t("faq_home_title")} className="mb-3" />
          <p className="text-[15px] text-ink-muted">{t("about_contact_d")}</p>
          <Link to="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-saffron-dark hover:underline">
            <NamasteIcon size={18} /> {t("faq_see_all")}
          </Link>
        </div>
        <FaqList faqs={faqs} firstOpen />
      </div>
    </section>
  );
};
