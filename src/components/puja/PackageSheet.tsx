import { useEffect, useRef } from "react";
import { ArrowRight, BadgeIndianRupee, Check, Lock, MessageCircle, ShoppingCart, User, Video, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import BottomSheet from "@/components/shared/BottomSheet";
import LeadForm from "@/components/puja/LeadForm";
import type { Tier } from "@/components/puja/BookingPanel";
import { tierImage, tierMembers, tierTone } from "@/lib/packages";
import { formatInr } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type BookingStep = "package" | "details";

/** Round tick in a package's top-right corner. */
const Radio = ({ on }: { on: boolean }) => (
  <span
    className={cn(
      "absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full border-2",
      on ? "border-saffron bg-saffron text-white" : "border-line bg-surface",
    )}
  >
    {on && <Check size={14} strokeWidth={3} />}
  </span>
);

/**
 * One package, as on Sri Mandir: a coloured member pill, the name, the price in
 * the package's colour and its photo. Phones get a full-width row (photo left),
 * tablets and laptops a card in a row of four (photo bottom-right).
 */
const TierCard = ({ tier, selected, onSelect }: { tier: Tier; selected: boolean; onSelect: () => void }) => {
  const { t } = useLanguage();
  const n = tierMembers(tier.label);
  const tone = tierTone(tier.label);
  const img = tierImage(tier.label);
  const pillText = n ? `${n} ${t("pkg_person")}` : null;
  const pill = (extra: string) =>
    pillText && (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-md font-semibold",
          selected ? "bg-saffron text-white" : tone.pill,
          extra,
        )}
      >
        <User size={12} strokeWidth={2.25} /> {pillText}
      </span>
    );
  const forWhom = n === 1 ? t("pkg_for_one") : n ? t("pkg_for").replace("{n}", String(n)) : null;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${tier.label}, ${formatInr(tier.price)}`}
      onClick={onSelect}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border text-left transition-all duration-200",
        selected
          ? "border-saffron bg-gradient-to-br from-saffron-soft to-surface shadow-card md:-translate-y-0.5"
          : "border-line bg-surface hover:border-saffron/50",
      )}
    >
      <Radio on={selected} />

      {/* Phones: photo on the left, details on the right. */}
      <span className="flex gap-3 p-2.5 md:hidden">
        <span className="w-[88px] shrink-0">
          <img src={img} alt="" className="aspect-square w-full rounded-lg object-cover" loading="lazy" decoding="async" />
          {pill("mt-1.5 flex w-full py-1 text-[12px]")}
        </span>
        <span className="min-w-0 flex-1 pr-8 pt-1">
          <span className="line-clamp-2 block text-[15px] font-bold leading-snug text-ink">{tier.label}</span>
          {forWhom && <span className="mt-1 block text-[13px] text-ink-soft">{forWhom}</span>}
          <span className={cn("tabular mt-1.5 block text-lg font-bold", tone.price)}>{formatInr(tier.price)}</span>
        </span>
      </span>

      {/* Tablets and laptops: pill, name, then price and photo along the bottom. */}
      <span className="hidden h-[168px] flex-col p-2.5 md:flex">
        {pill("self-start px-2 py-0.5 text-[11px]")}
        <span className="mt-2.5 line-clamp-1 block pr-1 text-[15px] font-semibold text-ink">{tier.label}</span>
        <span className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t to-transparent", tone.wash)} />
        <span className="relative mt-auto flex items-end justify-between gap-2">
          <span className={cn("tabular text-lg font-bold", tone.price)}>{formatInr(tier.price)}</span>
          <img src={img} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" loading="lazy" decoding="async" />
        </span>
      </span>
    </button>
  );
};

/**
 * Booking popup, two steps, laid out like Sri Mandir's:
 *  1. "package": what every package includes, the packages, a trust ticker and
 *     one price + Proceed bar.
 *  2. "details": WhatsApp number + name, with ← back to the packages.
 * Phones: step 1 slides up from the bottom, step 2 fills the screen.
 * From 768px both steps are a card in the middle of the screen.
 * The step and the choice belong to the page, so the sticky bar, the inline list
 * and the laptop button agree with it, and "Book this package" can open on step 2.
 */
const PackageSheet = ({
  name,
  pujaName,
  tiers,
  selected,
  onSelect,
  includes,
  step,
  onStep,
  onConfirm,
  onAddToCart,
  onClose,
}: {
  /** Pooja name shown to the devotee (Hindi when the site is in Hindi). */
  name: string;
  /** Pooja name saved with the lead. */
  pujaName: string;
  tiers: Tier[];
  selected: Tier | null;
  onSelect: (tier: Tier) => void;
  includes: string[];
  step: BookingStep;
  onStep: (step: BookingStep) => void;
  onConfirm: (name: string, phone: string) => void;
  onAddToCart: () => void;
  onClose: () => void;
}) => {
  const { t } = useLanguage();
  const top = useRef<HTMLDivElement>(null);
  const details = step === "details" && selected;

  // Each step starts at its top, not where the other one was scrolled to.
  useEffect(() => {
    const panel = top.current?.parentElement;
    if (panel) panel.scrollTop = 0;
  }, [step]);

  const trust = [
    { icon: Lock, label: t("trust_secure") },
    { icon: Video, label: t("trust_video") },
    { icon: BadgeIndianRupee, label: t("trust_no_hidden") },
    { icon: MessageCircle, label: t("trust_support") },
  ];
  const trustItems = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className={cn("flex shrink-0 items-center", hidden && "motion-reduce:hidden")}>
      {trust.map(({ icon: Icon, label }) => (
        <li key={label} className="mx-4 flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-ink-muted">
          <Icon size={15} strokeWidth={1.75} className="shrink-0 text-ink-soft" /> {label}
        </li>
      ))}
    </ul>
  );

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={details ? t("lead_details_title") : t("pd_packages")}
      centerFrom="md"
      bare
      className={
        details
          ? "h-[100dvh] max-h-[100dvh] rounded-none md:h-auto md:max-h-[92dvh] md:max-w-[400px] md:rounded-3xl"
          : "md:max-w-[680px]"
      }
    >
      <div ref={top} />
      {details ? (
        <LeadForm
          pujaName={pujaName}
          packageLabel={selected.label}
          price={selected.price}
          onConfirm={onConfirm}
          onBack={() => onStep("package")}
        />
      ) : (
        <>
          {/* Zero-height sticky row: the X stays in reach while the packages scroll. */}
          <div className="sticky top-0 z-10 flex h-0 justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label={t("mo_close")}
              className="mr-3 mt-3 grid h-9 w-9 place-items-center rounded-full bg-surface/90 text-ink transition-colors hover:bg-surface-muted"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 pb-4 pt-5 md:px-5">
            {includes.length > 0 && (
              <>
                <h2 className="pr-12 text-lg font-bold leading-snug text-ink md:text-xl">{t("pd_includes")}</h2>
                <p className="mt-0.5 line-clamp-1 pr-12 text-sm font-medium text-saffron-dark">{name}</p>
                <ul className="mt-3 space-y-2">
                  {includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-snug text-ink-muted">
                      <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" /> {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className={cn("text-lg font-bold text-ink md:text-xl", includes.length > 0 ? "mt-5" : "pr-12")}>
              {t("pkg_select_title")}
            </h3>
            <div role="radiogroup" aria-label={t("pkg_select_title")} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-2.5">
              {tiers.map((tier) => (
                <TierCard key={tier.label} tier={tier} selected={selected?.label === tier.label} onSelect={() => onSelect(tier)} />
              ))}
            </div>
          </div>

          {/* Stays in reach of the thumb while the packages scroll. */}
          <div className="sticky bottom-0 bg-surface">
            <div className="flex overflow-hidden border-y border-line bg-surface-muted py-2">
              <div className="flex w-max animate-marquee motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
                {trustItems(false)}
                {trustItems(true)}
              </div>
            </div>
            <div className="px-4 pb-4 pt-2 md:px-5">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={onAddToCart}
                  disabled={!selected}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                >
                  <ShoppingCart size={15} /> {t("btn_add_cart")}
                </button>
              </div>
              <button
                type="button"
                onClick={() => onStep("details")}
                disabled={!selected}
                className="flex w-full items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-saffron to-saffron-dark px-4 py-3 text-left text-white shadow-card transition-transform active:scale-[0.99] disabled:opacity-50"
              >
                <span className="min-w-0">
                  <span className="tabular block text-lg font-bold leading-tight">{selected ? formatInr(selected.price) : ""}</span>
                  <span className="block truncate text-xs font-medium text-white/90">{selected ? selected.label : t("pd_select_hint")}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-base font-semibold">
                  {t("btn_proceed")} <ArrowRight size={20} />
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </BottomSheet>
  );
};

export default PackageSheet;
