import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CalendarDays, Check, ChevronRight, ShoppingCart, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import type { Puja } from "@/lib/supabase";
import { trackViewContent } from "@/lib/metaPixel";
import { useCatalog } from "@/lib/catalog";
import { pujaCacheKey, pujaFetcher, pujaFromSnapshot } from "@/lib/catalogQueries";
import { bookingDeadline } from "@/lib/countdown";
import { MIN_PROOF_COUNT, reviewsFor, useReviews, useSiteStats } from "@/lib/proof";
import PujaGallery from "@/components/puja/PujaGallery";
import PujaSectionNav, { type NavSection } from "@/components/puja/PujaSectionNav";
import PujaSections from "@/components/puja/PujaSections";
import LeadCaptureModal from "@/components/puja/LeadCaptureModal";
import BookingPanel, { PackageOption } from "@/components/puja/BookingPanel";
import PackageSheet from "@/components/puja/PackageSheet";
import Countdown from "@/components/shared/Countdown";
import StickyActionBar from "@/components/shared/StickyActionBar";
import TrustRow from "@/components/shared/TrustRow";
import FaqList, { type Faq } from "@/components/shared/FaqList";
import SectionHeading from "@/components/SectionHeading";
import RatingSummary from "@/components/proof/RatingSummary";
import ReviewsSection from "@/components/proof/ReviewsSection";
import { DegradedBanner, LoadError } from "@/components/LoadError";
import { Eyebrow, Highlight, formatInr } from "@/components/ui/typography";
import { TempleIcon } from "@/components/icons";

import pkgSingle from "@/assets/pkg-single.webp";
import pkgCouple from "@/assets/pkg-couple.webp";
import pkgFamily4 from "@/assets/pkg-family4.webp";
import pkgFamily6 from "@/assets/pkg-family6.webp";

const tierImage = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("6") || l.includes("joint")) return pkgFamily6;
  if (l.includes("4") || l.includes("family")) return pkgFamily4;
  if (l.includes("couple") || l.includes("2")) return pkgCouple;
  return pkgSingle;
};

const isLaptop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

// On laptops the packages live in the sticky booking panel, not in the page flow.
const scrollToId = (id: string) => {
  const target = id === "packages" && isLaptop() ? "booking-panel" : id;
  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const DetailSkeleton = () => (
  <main className="container animate-pulse py-6 md:py-10">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
      <div className="aspect-[1483/1061] rounded-xl bg-surface-muted" />
      <div className="space-y-4">
        <div className="h-3 w-32 rounded bg-surface-muted" />
        <div className="h-7 w-full rounded bg-surface-muted" />
        <div className="h-5 w-2/3 rounded bg-surface-muted" />
        <div className="h-4 w-1/2 rounded bg-surface-muted" />
        <div className="h-12 w-full rounded-[10px] bg-surface-muted" />
      </div>
    </div>
  </main>
);

const PujaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { addItem } = useCart();
  const { t, lang } = useLanguage();

  const { data: puja, loading, degraded, failed, notFound, retry } = useCatalog<Puja>(
    id ? pujaCacheKey(id) : null,
    pujaFetcher(id ?? ""),
    id ? pujaFromSnapshot(id) : undefined,
  );
  const { data: allReviews } = useReviews();
  const { data: stats } = useSiteStats();

  // Only the package *name* is remembered; its price is read from the current data on every
  // render. The page can first show a saved copy (device cache or build snapshot) and then
  // live data: a stored {label, price} kept the old price (₹951) in the panel, bar, lead form
  // and cart after the page itself showed the new one.
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const selected = puja?.prices?.find((t) => t.label === selectedLabel) ?? null;
  const setSelected = (tier: { label: string } | null) => setSelectedLabel(tier?.label ?? null);
  const [showLead, setShowLead] = useState(false);
  const [showPackages, setShowPackages] = useState(false);

  const deadline = useMemo(() => (puja ? bookingDeadline(puja.date, puja.countdown_datetime) : null), [puja]);

  usePageTitle(puja ? `${lang === "hi" && puja.name_hi ? puja.name_hi : puja.name} | Narayan Kripa` : "Narayan Kripa");

  // Leave only when the puja really does not exist (or was unpublished). A failed
  // request shows an error with Retry instead of bouncing the visitor.
  useEffect(() => {
    if (notFound) nav("/puja", { replace: true });
  }, [notFound, nav]);

  // ViewContent once per puja (the ref guards StrictMode's double effects).
  const viewTracked = useRef<string | null>(null);
  useEffect(() => {
    if (!puja || viewTracked.current === puja.id) return;
    viewTracked.current = puja.id;
    const cheapest = (puja.prices || []).reduce<number | undefined>(
      (min, tier) => (min === undefined || tier.price < min ? tier.price : min),
      undefined,
    );
    trackViewContent({ id: puja.id, name: puja.name, value: cheapest, category: "puja" });
  }, [puja]);

  useEffect(() => {
    if (!loading && window.location.hash === "#packages") setTimeout(() => scrollToId("packages"), 300);
  }, [loading]);

  if (loading) return <DetailSkeleton />;
  if (failed)
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <LoadError onRetry={retry} className="w-full max-w-lg" />
      </main>
    );
  if (!puja) return null;

  const hi = lang === "hi";
  const name = hi && puja.name_hi ? puja.name_hi : puja.name;
  const location = hi && puja.location_hi ? puja.location_hi : puja.location;
  const benefit = hi && puja.benefit_hi ? puja.benefit_hi : puja.benefit;
  const occasion = hi && puja.occasion_hi ? puja.occasion_hi : puja.occasion;
  const includes = hi && puja.includes_hi?.length ? puja.includes_hi : puja.includes;
  const dbFaqs = (hi && puja.faqs_hi?.length ? puja.faqs_hi : puja.faqs) ?? [];
  const standardFaqs: Faq[] = [1, 2, 3, 4, 5].map((n) => ({ question: t(`faq_home_q${n}`), answer: t(`faq_home_a${n}`) }));
  const faqs = [...dbFaqs, ...standardFaqs.filter((f) => !dbFaqs.some((d) => d.question === f.question))];

  const prices = puja.prices ?? [];
  const minPrice = prices.length ? Math.min(...prices.map((p) => p.price)) : null;
  const reviews = reviewsFor(allReviews, { pujaId: puja.id });
  const bookedCount = stats?.by_item?.[puja.id];
  const devotees = stats && stats.devotees >= MIN_PROOF_COUNT ? stats.devotees : null;

  const sections: NavSection[] = [
    ...(puja.about || puja.about_hi ? [{ id: "aboutPuja", labelKey: "pd_about" }] : []),
    ...(puja.benefits?.length || puja.benefits_hi?.length ? [{ id: "pujaBenefits", labelKey: "pd_benefits" }] : []),
    { id: "pujaProcess", labelKey: "pd_process" },
    ...(puja.temple_name || puja.temple_image || puja.past_video_url ? [{ id: "templeDetails", labelKey: "pd_temple" }] : []),
    { id: "packages", labelKey: "pd_tab_packages", mobileOnly: true },
    ...(reviews.length ? [{ id: "reviews", labelKey: "pd_tab_reviews" }] : []),
    { id: "faqSection", labelKey: "pd_faqs" },
  ];

  const itemFor = (tier: { label: string; price: number }) => ({
    id: `puja-${puja.id}-${tier.label}`,
    name: `${puja.name} (${tier.label})`,
    description: `${puja.date} • ${puja.location}`,
    price: tier.price,
    category: "puja" as const,
    image: puja.image_url || undefined,
  });

  const addToCart = () => {
    if (!selected) return;
    addItem(itemFor(selected));
    toast.success(`${name} (${selected.label}) ${t("toast_added_to_cart")}`, {
      action: { label: t("cart_view"), onClick: () => nav("/cart") },
    });
  };

  const handleLeadConfirm = () => {
    if (!selected) return;
    addItem(itemFor(selected));
    setShowLead(false);
    nav("/checkout");
  };

  // Package popup (old site's flow): opens with a package already chosen, so it is one tap to continue.
  const openPackages = () => {
    if (!selected && prices[0]) setSelected(prices[0]);
    setShowPackages(true);
  };
  const onBarClick = () => (selected ? setShowLead(true) : openPackages());
  const includeItems = includes && includes.length > 0 ? includes : [t("rcv1"), t("rcv2"), t("rcv4"), t("rcv3"), t("rcv5")];

  return (
    <main className="pb-24 lg:pb-16">
      {degraded && (
        <div className="container pt-3">
          <DegradedBanner />
        </div>
      )}

      {/* Laptops: content on the left, booking panel sticky on the right.
          Below lg this wrapper adds nothing and the page stacks as before. */}
      <div className="lg:container lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
        <div className="min-w-0">
          {/* Summary: gallery + the facts a visitor needs before deciding */}
          <section className="container pb-8 pt-4 md:pb-12 md:pt-6 lg:px-0 lg:pb-8">
            <nav aria-label="Breadcrumb" className="mb-4 hidden items-center gap-1.5 text-sm text-ink-soft md:flex">
              <Link to="/" className="hover:text-ink">{t("breadcrumb_home")}</Link>
              <ChevronRight size={14} />
              <Link to="/puja" className="hover:text-ink">{t("nav_puja")}</Link>
              <ChevronRight size={14} />
              <span className="truncate text-ink">{name}</span>
            </nav>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-8 lg:block">
              <PujaGallery images={puja.gallery?.length ? puja.gallery : []} fallbackUrl={puja.image_url} name={name} />

              <div className="flex flex-col lg:hidden">
                {occasion && <Eyebrow className="mb-2">{occasion}</Eyebrow>}
                <h1 className="text-[22px] font-bold leading-snug text-ink md:text-[28px]">{name}</h1>
                {benefit && <p className="mt-2 text-base font-semibold leading-snug text-ink-muted md:text-lg">{benefit}</p>}

                <ul className="mt-4 space-y-2 text-[15px] font-medium text-ink-muted">
                  {location && (
                    <li className="flex items-start gap-2.5">
                      <TempleIcon size={18} className="mt-0.5 shrink-0 text-saffron" /> {location}
                    </li>
                  )}
                  {puja.date && (
                    <li className="flex items-start gap-2.5">
                      <CalendarDays size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-saffron" /> {puja.date}
                    </li>
                  )}
                </ul>

                <div className="mt-5">
                  <Countdown deadline={deadline} label={t("timer_label")} expiredLabel={t("timer_expired")} />
                </div>

                {(reviews.length > 0 || devotees) && (
                  <div className="mt-5 space-y-2.5">
                    <RatingSummary reviews={reviews} onClick={() => scrollToId("reviews")} />
                    {devotees && (
                      <p className="text-[15px] text-ink-muted">
                        <Highlight>{devotees.toLocaleString("en-IN")} {t("pd_devotees_word")}</Highlight> {t("pd_devotees_line_post")}
                      </p>
                    )}
                  </div>
                )}

                <button onClick={openPackages} className="btn-primary mt-6 w-full md:max-w-sm">
                  {t("pd_select_btn")} <ArrowRight size={18} />
                </button>

                <TrustRow className="mt-5 border-t border-line pt-4" />
              </div>
            </div>
          </section>

          <PujaSectionNav sections={sections} />

          <PujaSections puja={puja} bookedCount={bookedCount} />

          {/* Packages: inline, selectable, with what every package includes */}
          <section id="packages" className="scroll-mt-32 border-b border-line py-10 md:py-12 lg:hidden">
            <div className="container max-w-4xl">
              <SectionHeading title={t("pd_packages")} subtitle={t("select_package_sub")} />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t("pd_packages")}>
                {prices.map((tier) => (
                  <PackageOption
                    key={tier.label}
                    tier={tier}
                    image={tierImage(tier.label)}
                    selected={selected?.label === tier.label}
                    onSelect={() => setSelected(selected?.label === tier.label ? null : tier)}
                  />
                ))}
              </div>

              {selected && (
                <button onClick={addToCart} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
                  <ShoppingCart size={16} /> {t("btn_add_cart")}
                </button>
              )}

              <div className="mt-6 rounded-xl border border-line bg-surface-muted/60 p-4 md:p-5">
                <h3 className="mb-3 text-[15px] font-semibold text-ink">{t("pd_includes")}</h3>
                <ul className="space-y-2.5">
                  {includeItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[15px] text-ink-muted">
                      <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <TrustRow className="mt-5" />
            </div>
          </section>

          <ReviewsSection
            id="reviews"
            reviews={reviews}
            className="scroll-mt-32 border-b border-line py-10 md:py-12"
            containerClassName="container lg:px-0"
          />

          <section id="faqSection" className="scroll-mt-32 py-10 md:py-12 lg:pb-0">
            <div className="container max-w-4xl lg:max-w-none lg:px-0">
              <SectionHeading title={t("pd_faqs")} />
              <FaqList faqs={faqs} />
            </div>
          </section>
        </div>

        <aside id="booking-panel" className="hidden scroll-mt-24 lg:sticky lg:top-16 lg:block lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:py-4 lg:scrollbar-hide">
          <BookingPanel
            occasion={occasion}
            name={name}
            benefit={benefit}
            location={location}
            date={puja.date}
            deadline={deadline}
            reviews={reviews}
            devotees={devotees}
            tiers={prices}
            tierImage={tierImage}
            selected={selected}
            onSelect={setSelected}
            onContinue={() => selected && setShowLead(true)}
            onAddToCart={addToCart}
            onReviewsClick={() => scrollToId("reviews")}
            includes={includeItems}
          />
        </aside>
      </div>

      {prices.length > 0 && (
        <StickyActionBar
          title={selected ? formatInr(selected.price) : minPrice != null ? `${t("pd_from")} ${formatInr(minPrice)}` : name}
          subtitle={selected ? selected.label : t("pd_select_hint")}
          cta={selected ? t("btn_continue") : t("pd_tab_packages")}
          onClick={onBarClick}
          onInfoClick={selected ? openPackages : undefined}
          className="lg:hidden"
        />
      )}

      {showPackages && (
        <PackageSheet
          name={name}
          tiers={prices}
          tierImage={tierImage}
          selected={selected}
          onSelect={setSelected}
          includes={includeItems}
          onContinue={() => { setShowPackages(false); setShowLead(true); }}
          onAddToCart={() => { addToCart(); setShowPackages(false); }}
          onClose={() => setShowPackages(false)}
        />
      )}

      {showLead && selected && (
        <LeadCaptureModal
          pujaName={puja.name}
          packageLabel={selected.label}
          price={selected.price}
          onConfirm={handleLeadConfirm}
          onClose={() => setShowLead(false)}
        />
      )}
    </main>
  );
};

export default PujaDetail;
