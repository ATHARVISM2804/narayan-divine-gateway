import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, ChevronRight, MessageCircle, Minus, Plus } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { trackContact, trackViewContent } from "@/lib/metaPixel";
import { whatsappLink } from "@/lib/whatsapp";
import { useCatalog } from "@/lib/catalog";
import { chadhavaCacheKey, chadhavaFetcher, chadhavaFromSnapshot, type ChadhavaWithOfferings } from "@/lib/catalogQueries";
import { bookingDeadline, useCountdown } from "@/lib/countdown";
import { MIN_PROOF_COUNT, reviewsFor, useReviews, useSiteStats } from "@/lib/proof";
import PujaGallery from "@/components/puja/PujaGallery";
import PujaSectionNav, { type NavSection } from "@/components/puja/PujaSectionNav";
import FitImage from "@/components/FitImage";
import Countdown from "@/components/shared/Countdown";
import RichText from "@/components/shared/RichText";
import ReadMore from "@/components/shared/ReadMore";
import StickyActionBar from "@/components/shared/StickyActionBar";
import TrustRow from "@/components/shared/TrustRow";
import FaqList, { type Faq } from "@/components/shared/FaqList";
import SectionHeading from "@/components/SectionHeading";
import RatingSummary from "@/components/proof/RatingSummary";
import ReviewsSection from "@/components/proof/ReviewsSection";
import { DegradedBanner, LoadError } from "@/components/LoadError";
import { Eyebrow, Highlight, formatInr } from "@/components/ui/typography";
import { TempleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const ChadhavaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { addItem } = useCart();
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState<Record<string, number>>({});

  const { data, loading, degraded, failed, notFound, retry } = useCatalog<ChadhavaWithOfferings>(
    id ? chadhavaCacheKey(id) : null,
    chadhavaFetcher(id ?? ""),
    id ? chadhavaFromSnapshot(id) : undefined,
  );
  const { data: allReviews } = useReviews();
  const { data: stats } = useSiteStats();
  const chadhava = data?.chadhava ?? null;
  const offerings = useMemo(() => data?.offerings ?? [], [data]);

  const deadline = useMemo(() => (chadhava ? bookingDeadline(chadhava.date, chadhava.countdown_datetime) : null), [chadhava]);
  const left = useCountdown(deadline);

  usePageTitle(chadhava ? `${lang === "hi" && chadhava.item_hi ? chadhava.item_hi : chadhava.item} | Narayan Kripa` : "Narayan Kripa");

  useEffect(() => {
    if (notFound) nav("/chadhava", { replace: true });
  }, [notFound, nav]);

  // ViewContent once per chadhava (ref guards StrictMode's double effects).
  const viewTracked = useRef<string | null>(null);
  useEffect(() => {
    if (!chadhava || viewTracked.current === chadhava.id) return;
    viewTracked.current = chadhava.id;
    trackViewContent({ id: chadhava.id, name: `${chadhava.item} | ${chadhava.temple}`, value: chadhava.price, category: "chadhava" });
  }, [chadhava]);

  const setQty = (offId: string, qty: number) =>
    setSelected((prev) => {
      const copy = { ...prev };
      if (qty <= 0) delete copy[offId];
      else copy[offId] = qty;
      return copy;
    });

  const selectedCount = Object.values(selected).reduce((s, q) => s + q, 0);
  const totalPrice = offerings.reduce((sum, o) => sum + (selected[o.id] || 0) * o.price, 0);

  const handleProceed = () => {
    if (!chadhava || selectedCount === 0) return scrollToId("offerings");
    offerings.forEach((o) => {
      const qty = selected[o.id];
      if (!qty) return;
      // Only the offering id, so the edge function can look the price up directly.
      addItem(
        {
          id: `chadhava-${o.id}`,
          name: o.name,
          description: chadhava.item,
          price: o.price,
          category: "chadhava",
          image: o.image_url || chadhava.image_url || undefined,
        },
        qty,
      );
    });
    nav("/checkout");
  };

  if (loading)
    return (
      <main className="container animate-pulse py-6 md:py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="aspect-[1483/1061] rounded-xl bg-surface-muted" />
          <div className="space-y-4">
            <div className="h-7 w-full rounded bg-surface-muted" />
            <div className="h-5 w-2/3 rounded bg-surface-muted" />
            <div className="h-12 w-full rounded-[10px] bg-surface-muted" />
          </div>
        </div>
      </main>
    );
  if (failed)
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <LoadError onRetry={retry} className="w-full max-w-lg" />
      </main>
    );
  if (!chadhava) return null;

  const hi = lang === "hi";
  const item = hi && chadhava.item_hi ? chadhava.item_hi : chadhava.item;
  const temple = hi && chadhava.temple_hi ? chadhava.temple_hi : chadhava.temple;
  const desc = hi && chadhava.description_hi ? chadhava.description_hi : chadhava.description;
  const about = hi && chadhava.about_hi ? chadhava.about_hi : chadhava.about;
  const occasion = hi && chadhava.occasion_hi ? chadhava.occasion_hi : chadhava.occasion;
  const dbFaqs = (hi && chadhava.faqs_hi?.length ? chadhava.faqs_hi : chadhava.faqs) ?? [];
  const standardFaqs: Faq[] = [1, 3, 4, 5].map((n) => ({ question: t(`faq_home_q${n}`), answer: t(`faq_home_a${n}`) }));
  const faqs = [...dbFaqs, ...standardFaqs.filter((f) => !dbFaqs.some((d) => d.question === f.question))];

  const reviews = reviewsFor(allReviews, { chadhavaId: chadhava.id });
  const bookedCount = stats?.by_item?.[chadhava.id];
  const minPrice = offerings.length ? Math.min(...offerings.map((o) => o.price)) : chadhava.price;

  const sections: NavSection[] = [
    { id: "offerings", labelKey: "ch_view_offerings" },
    ...(about ? [{ id: "aboutChadhava", labelKey: "ch_about_temple" }] : []),
    { id: "howItWorks", labelKey: "how_works" },
    ...(reviews.length ? [{ id: "reviews", labelKey: "pd_tab_reviews" }] : []),
    { id: "faqSection", labelKey: "pd_faqs" },
  ];

  return (
    <main className="pb-24 lg:pb-16">
      {degraded && (
        <div className="container pt-3">
          <DegradedBanner />
        </div>
      )}

      {/* Laptops: content on the left, the order panel sticky on the right.
          Below lg this wrapper adds nothing and the page stacks as before. */}
      <div className="lg:container lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
        <div className="min-w-0">
          <section className="container pb-8 pt-4 md:pb-12 md:pt-6 lg:px-0 lg:pb-8">
            <nav aria-label="Breadcrumb" className="mb-4 hidden items-center gap-1.5 text-sm text-ink-soft md:flex">
              <Link to="/" className="hover:text-ink">{t("breadcrumb_home")}</Link>
              <ChevronRight size={14} />
              <Link to="/chadhava" className="hover:text-ink">{t("breadcrumb_chadhava")}</Link>
              <ChevronRight size={14} />
              <span className="truncate text-ink">{item}</span>
            </nav>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-8 lg:block">
              <PujaGallery images={chadhava.gallery?.length ? chadhava.gallery : []} fallbackUrl={chadhava.image_url} name={item} />

              <div className="flex flex-col lg:hidden">
                {occasion && <Eyebrow className="mb-2">{occasion}</Eyebrow>}
                <h1 className="text-[22px] font-bold leading-snug text-ink md:text-[28px]">{item}</h1>
                {desc && <p className="mt-2 text-base font-semibold leading-snug text-ink-muted md:text-lg">{desc}</p>}

                <ul className="mt-4 space-y-2 text-[15px] font-medium text-ink-muted">
                  {temple && (
                    <li className="flex items-start gap-2.5">
                      <TempleIcon size={18} className="mt-0.5 shrink-0 text-saffron" /> {temple}
                    </li>
                  )}
                  {chadhava.date && (
                    <li className="flex items-start gap-2.5">
                      <CalendarDays size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-saffron" /> {chadhava.date}
                    </li>
                  )}
                </ul>

                <div className="mt-5">
                  <Countdown left={left} label={t("timer_label_chadhava")} expiredLabel={t("timer_expired_chadhava")} />
                </div>

                {(reviews.length > 0 || (bookedCount ?? 0) >= MIN_PROOF_COUNT) && (
                  <div className="mt-5 space-y-2.5">
                    <RatingSummary reviews={reviews} onClick={() => scrollToId("reviews")} />
                    {bookedCount != null && bookedCount >= MIN_PROOF_COUNT && (
                      <p className="text-[15px] text-ink-muted">
                        <Highlight>{bookedCount.toLocaleString("en-IN")}</Highlight> {t("pd_booked_here")}
                      </p>
                    )}
                  </div>
                )}

                <button onClick={() => scrollToId("offerings")} className="btn-primary mt-6 w-full md:max-w-sm">
                  {t("ch_choose_offering")} <ArrowRight size={18} />
                </button>

                <TrustRow className="mt-5 border-t border-line pt-4" />
              </div>
            </div>
          </section>

          <PujaSectionNav sections={sections} />

          <section id="offerings" className="scroll-mt-32 border-b border-line py-10 md:py-12">
            <div className="container max-w-4xl lg:max-w-none lg:px-0">
              <SectionHeading title={t("ch_choose_offering")} subtitle={t("ch_choose_sub")} />

              {offerings.length === 0 ? (
                <p className="rounded-xl border border-line bg-surface p-8 text-center text-ink-muted">{t("ch_no_offerings")}</p>
              ) : (
                <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                  {offerings.map((o) => {
                    const qty = selected[o.id] || 0;
                    const name = hi && o.name_hi ? o.name_hi : o.name;
                    const odesc = hi && o.description_hi ? o.description_hi : o.description;
                    return (
                      <li key={o.id} className={cn("flex items-center gap-3 p-3 transition-colors md:p-4", qty > 0 && "bg-saffron-soft")}>
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                          {o.image_url ? (
                            <FitImage src={o.image_url} alt={name} width={128} />
                          ) : (
                            <span className="grid h-full w-full place-items-center text-ink-soft">
                              <TempleIcon size={22} />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold leading-snug text-ink">{name}</p>
                          {odesc && <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-soft">{odesc}</p>}
                          <p className="tabular mt-1 text-base font-bold text-saffron-dark">{formatInr(o.price)}</p>
                        </div>
                        {qty === 0 ? (
                          <button
                            onClick={() => setQty(o.id, 1)}
                            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-[10px] border border-saffron px-4 text-sm font-semibold text-saffron-dark transition-colors hover:bg-saffron hover:text-white"
                          >
                            <Plus size={16} /> {t("ch_add")}
                          </button>
                        ) : (
                          <div className="flex h-10 shrink-0 items-center overflow-hidden rounded-[10px] bg-saffron text-white">
                            <button onClick={() => setQty(o.id, qty - 1)} className="grid h-full w-10 place-items-center hover:bg-saffron-dark" aria-label="Remove one">
                              <Minus size={16} />
                            </button>
                            <span className="tabular w-6 text-center text-sm font-bold">{qty}</span>
                            <button onClick={() => setQty(o.id, qty + 1)} className="grid h-full w-10 place-items-center hover:bg-saffron-dark" aria-label="Add one">
                              <Plus size={16} />
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-6 rounded-xl border border-line bg-surface-muted/60 p-4 md:p-5">
                <h3 className="mb-3 text-[15px] font-semibold text-ink">{t("whats_included")}</h3>
                <ul className="space-y-2.5">
                  {[t("inc1"), t("inc2"), t("inc4"), t("inc3"), t("inc5")].map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-[15px] text-ink-muted">
                      <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" /> {line}
                    </li>
                  ))}
                </ul>
              </div>
              <TrustRow className="mt-5" />
            </div>
          </section>

          {about && (
            <section id="aboutChadhava" className="scroll-mt-32 border-b border-line bg-surface-muted/60 py-10 md:py-12 lg:bg-transparent">
              <div className="container max-w-4xl lg:max-w-none lg:px-0">
                <SectionHeading title={t("ch_about_temple")} className="mb-4" />
                <ReadMore length={about.length} className="lg:max-w-3xl">
                  <RichText text={about} />
                </ReadMore>
              </div>
            </section>
          )}

          <section id="howItWorks" className="scroll-mt-32 border-b border-line py-10 md:py-12">
            <div className="container max-w-4xl lg:max-w-none lg:px-0">
              <SectionHeading title={t("ch_how_title")} className="mb-5" />
              <ol className="relative space-y-5 border-l border-dashed border-saffron/40 pl-7">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="relative">
                    <span className="tabular absolute -left-[42px] top-0 grid h-7 w-7 place-items-center rounded-full bg-saffron text-sm font-bold text-white">
                      {n}
                    </span>
                    <p className="text-base font-semibold text-ink">{t(`ch_how_s${n}_title`)}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{t(`ch_how_s${n}_desc`)}</p>
                  </li>
                ))}
              </ol>
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

        {/* Laptop order panel: facts, countdown, what is selected so far and the next step. */}
        <aside className="hidden lg:sticky lg:top-16 lg:block lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:py-4 lg:scrollbar-hide">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card [@media(max-height:800px)]:p-5">
            {occasion && <Eyebrow className="mb-2">{occasion}</Eyebrow>}
            <h1 title={item} className="text-[26px] font-bold leading-tight text-ink [@media(max-height:800px)]:line-clamp-2 [@media(max-height:800px)]:text-[22px]">{item}</h1>
            {desc && <p className="mt-2 text-base font-semibold leading-snug text-ink-muted [@media(max-height:800px)]:mt-1 [@media(max-height:800px)]:text-[15px]">{desc}</p>}
            <ul className="mt-3 space-y-1.5 text-sm font-medium text-ink-muted [@media(max-height:800px)]:mt-2 [@media(max-height:800px)]:flex [@media(max-height:800px)]:flex-wrap [@media(max-height:800px)]:gap-x-4 [@media(max-height:800px)]:gap-y-1 [@media(max-height:800px)]:space-y-0">
              {temple && (
                <li className="flex items-start gap-2">
                  <TempleIcon size={16} className="mt-0.5 shrink-0 text-saffron" /> {temple}
                </li>
              )}
              {chadhava.date && (
                <li className="flex items-start gap-2">
                  <CalendarDays size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-saffron" /> {chadhava.date}
                </li>
              )}
            </ul>
            <div className="mt-4 [@media(max-height:800px)]:mt-3">
              <Countdown left={left} label={t("timer_label_chadhava")} expiredLabel={t("timer_expired_chadhava")} compact />
            </div>
            {(reviews.length > 0 || (bookedCount ?? 0) >= MIN_PROOF_COUNT) && (
              <div className="mt-4 space-y-1.5 [@media(max-height:960px)]:hidden">
                <RatingSummary reviews={reviews} onClick={() => scrollToId("reviews")} />
                {bookedCount != null && bookedCount >= MIN_PROOF_COUNT && (
                  <p className="text-sm text-ink-muted">
                    <Highlight>{bookedCount.toLocaleString("en-IN")}</Highlight> {t("pd_booked_here")}
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 border-t border-line pt-5 [@media(max-height:800px)]:mt-4 [@media(max-height:800px)]:pt-4">
              {selectedCount > 0 ? (
                <>
                  <ul className="space-y-1.5 text-sm text-ink-muted">
                    {offerings
                      .filter((o) => selected[o.id])
                      .map((o) => (
                        <li key={o.id} className="flex justify-between gap-3">
                          <span className="min-w-0 truncate">
                            {hi && o.name_hi ? o.name_hi : o.name} × {selected[o.id]}
                          </span>
                          <span className="tabular shrink-0">{formatInr(o.price * selected[o.id])}</span>
                        </li>
                      ))}
                  </ul>
                  <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                    <span className="text-sm font-semibold text-ink">
                      {selectedCount} {t("ch_items_selected")}
                    </span>
                    <span className="tabular text-xl font-bold text-saffron-dark">{formatInr(totalPrice)}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-ink-muted">{t("ch_select_hint")}</span>
                  <span className="shrink-0 text-sm text-ink-muted">
                    {t("pd_from")} <span className="tabular text-lg font-bold text-saffron-dark">{formatInr(minPrice)}</span>
                  </span>
                </div>
              )}
              <button onClick={handleProceed} className="btn-primary mt-4 w-full">
                {selectedCount > 0 ? t("ch_proceed") : t("ch_choose_offering")} <ArrowRight size={18} />
              </button>
            </div>

            <TrustRow className="mt-5 border-t border-line pt-4 sm:gap-x-4 [@media(max-height:800px)]:hidden" />
            <a
              href={whatsappLink(t("wa_msg_book"))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContact("whatsapp_panel")}
              className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-ink-muted hover:text-saffron-dark"
            >
              <MessageCircle size={16} className="text-success" /> {t("book_whatsapp")}
            </a>
          </div>
        </aside>
      </div>

      <StickyActionBar
        title={selectedCount > 0 ? formatInr(totalPrice) : `${t("pd_from")} ${formatInr(minPrice)}`}
        subtitle={selectedCount > 0 ? `${selectedCount} ${t("ch_items_selected")}` : t("ch_select_hint")}
        cta={selectedCount > 0 ? t("ch_proceed") : t("ch_view_offerings")}
        onClick={handleProceed}
        className="lg:hidden"
      />
    </main>
  );
};

export default ChadhavaDetail;
