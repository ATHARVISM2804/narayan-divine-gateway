import { ArrowRight, CalendarDays, Check, ChevronDown, MessageCircle, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { trackContact } from "@/lib/metaPixel";
import type { Review } from "@/lib/proof";
import Countdown from "@/components/shared/Countdown";
import TrustRow from "@/components/shared/TrustRow";
import RatingSummary from "@/components/proof/RatingSummary";
import { TempleIcon } from "@/components/icons";
import { Eyebrow, Highlight, formatInr } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export interface Tier { label: string; price: number }

/** One selectable package. `compact` is the laptop booking panel; the default is
    the phone/tablet package grid. */
export const PackageOption = ({
  tier,
  image,
  selected,
  onSelect,
  compact = false,
}: {
  tier: Tier;
  /** Package art; the compact panel option leaves it out to make room for the label. */
  image: string;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) => (
  <button
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={cn(
      "flex items-center rounded-xl border-2 bg-surface text-left transition-colors",
      compact ? "gap-2 px-3 py-2.5" : "gap-3 p-3",
      selected ? "border-saffron bg-saffron-soft" : "border-line hover:border-saffron/50",
    )}
  >
    {!compact && <img src={image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" loading="lazy" />}
    <span className="min-w-0 flex-1">
      <span className={cn("block font-semibold leading-snug text-ink", compact ? "text-sm" : "text-[15px]")}>{tier.label}</span>
      <span className={cn("tabular mt-0.5 block font-bold text-saffron-dark", compact ? "text-base" : "text-lg")}>{formatInr(tier.price)}</span>
    </span>
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full border-2",
        compact ? "h-5 w-5" : "h-6 w-6",
        selected ? "border-saffron bg-saffron text-white" : "border-input",
      )}
    >
      {selected && <Check size={compact ? 12 : 14} strokeWidth={3} />}
    </span>
  </button>
);

/**
 * Laptop booking panel (lg and up only): the facts, the countdown, the package
 * choice and the next step, kept in view beside the content while it scrolls.
 * Phones keep the summary + package section + bottom bar.
 *
 * On short laptop screens (max-height 800px, e.g. 1536x730 at 125% zoom) the
 * spacing and title tighten so the Continue button and trust row stay in view.
 */
const BookingPanel = ({
  occasion,
  name,
  benefit,
  location,
  date,
  deadline,
  reviews,
  devotees,
  tiers,
  tierImage,
  selected,
  onSelect,
  onContinue,
  onAddToCart,
  onReviewsClick,
  includes,
}: {
  occasion?: string | null;
  name: string;
  benefit?: string | null;
  location?: string | null;
  date?: string | null;
  deadline: Date | null;
  reviews: Review[];
  devotees: number | null;
  tiers: Tier[];
  tierImage: (label: string) => string;
  selected: Tier | null;
  onSelect: (tier: Tier | null) => void;
  onContinue: () => void;
  onAddToCart: () => void;
  onReviewsClick: () => void;
  includes: string[];
}) => {
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card [@media(max-height:800px)]:p-5">
      {occasion && <Eyebrow className="mb-2">{occasion}</Eyebrow>}
      <h1 title={name} className="text-[26px] font-bold leading-tight text-ink [@media(max-height:800px)]:line-clamp-2 [@media(max-height:800px)]:text-[22px]">{name}</h1>
      {benefit && <p className="mt-2 text-base font-semibold leading-snug text-ink-muted [@media(max-height:800px)]:mt-1 [@media(max-height:800px)]:text-[15px]">{benefit}</p>}

      <ul className="mt-3 space-y-1.5 text-sm font-medium text-ink-muted [@media(max-height:800px)]:mt-2 [@media(max-height:800px)]:flex [@media(max-height:800px)]:flex-wrap [@media(max-height:800px)]:gap-x-4 [@media(max-height:800px)]:gap-y-1 [@media(max-height:800px)]:space-y-0">
        {location && (
          <li className="flex items-start gap-2">
            <TempleIcon size={16} className="mt-0.5 shrink-0 text-saffron" /> {location}
          </li>
        )}
        {date && (
          <li className="flex items-start gap-2">
            <CalendarDays size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-saffron" /> {date}
          </li>
        )}
      </ul>

      <div className="mt-4 [@media(max-height:800px)]:mt-3">
        <Countdown deadline={deadline} label={t("timer_label")} expiredLabel={t("timer_expired")} compact />
      </div>

      {(reviews.length > 0 || devotees) && (
        <div className="mt-4 space-y-1.5 [@media(max-height:960px)]:hidden">
          <RatingSummary reviews={reviews} onClick={onReviewsClick} />
          {devotees && (
            <p className="text-sm text-ink-muted">
              <Highlight>{devotees.toLocaleString("en-IN")} {t("pd_devotees_word")}</Highlight> {t("pd_devotees_line_post")}
            </p>
          )}
        </div>
      )}

      {tiers.length > 0 && (
        <div className="mt-5 border-t border-line pt-5 [@media(max-height:800px)]:mt-4 [@media(max-height:800px)]:pt-4">
          <p className="mb-2.5 text-sm font-semibold text-ink">{t("pd_packages")}</p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("pd_packages")}>
            {tiers.map((tier) => (
              <PackageOption
                key={tier.label}
                tier={tier}
                image={tierImage(tier.label)}
                selected={selected?.label === tier.label}
                onSelect={() => onSelect(selected?.label === tier.label ? null : tier)}
                compact
              />
            ))}
          </div>

          <button onClick={onContinue} disabled={!selected} className="btn-primary mt-4 w-full [@media(max-height:800px)]:mt-3">
            {selected ? (
              <>
                {t("btn_continue")} · {formatInr(selected.price)} <ArrowRight size={18} />
              </>
            ) : (
              t("pd_select_hint")
            )}
          </button>
          {selected && (
            <button onClick={onAddToCart} className="mt-2.5 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
              <ShoppingCart size={16} /> {t("btn_add_cart")}
            </button>
          )}

          <details className="group mt-4 rounded-xl bg-surface-muted/70 px-4 py-3 [@media(max-height:800px)]:mt-3 [@media(max-height:800px)]:py-2.5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {t("pd_includes")}
              <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-2.5 space-y-2">
              {includes.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                  <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

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
  );
};

export default BookingPanel;
