import { ArrowRight, CalendarDays, Check, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { trackContact } from "@/lib/metaPixel";
import type { Review } from "@/lib/proof";
import Countdown from "@/components/shared/Countdown";
import TrustRow from "@/components/shared/TrustRow";
import SocialProofRow from "@/components/proof/SocialProofRow";
import { TempleIcon } from "@/components/icons";
import { Eyebrow, formatInr } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export interface Tier { label: string; price: number }

/** One package in the phone/tablet package list. The popup draws its own cards (PackageSheet). */
export const PackageOption = ({
  tier,
  image,
  selected,
  onSelect,
  action,
}: {
  tier: Tier;
  image: string;
  selected: boolean;
  onSelect: () => void;
  /** List only: shown inside the chosen package, e.g. its "Book this package" button. */
  action?: React.ReactNode;
}) => {
  const expanded = selected && action != null;
  const row = (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 p-3 text-left transition-colors",
        // Expanded, the border and tint belong to the wrapper around the row and its action.
        !expanded && "rounded-xl border-2 bg-surface",
        !expanded && (selected ? "border-saffron bg-saffron-soft" : "border-line hover:border-saffron/50"),
      )}
    >
      <img src={image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" loading="lazy" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug text-ink">{tier.label}</span>
        <span className="tabular mt-0.5 block text-lg font-bold text-saffron-dark">{formatInr(tier.price)}</span>
      </span>
      <span
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2",
          selected ? "border-saffron bg-saffron text-white" : "border-input",
        )}
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  );
  return expanded ? (
    <div className="rounded-xl border-2 border-saffron bg-saffron-soft">
      {row}
      <div className="px-3 pb-3">{action}</div>
    </div>
  ) : (
    row
  );
};

/**
 * Laptop booking panel (lg and up only): the facts, the countdown, the rating and
 * one "Select pooja package" button that opens the package popup (like Sri Mandir),
 * kept in view beside the content while it scrolls.
 * Phones keep the summary + package section + bottom bar.
 *
 * On short laptop screens (max-height 800px, e.g. 1536x730 at 125% zoom) the
 * spacing and title tighten so the button and trust row stay in view.
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
  statsLoading,
  hasPackages,
  onSelectPackage,
  onReviewsClick,
}: {
  occasion?: string | null;
  name: string;
  benefit?: string | null;
  location?: string | null;
  date?: string | null;
  deadline: Date | null;
  /** Site reviews: their photos fill the avatar stack. */
  reviews: Review[];
  devotees: number | null;
  statsLoading: boolean;
  hasPackages: boolean;
  /** Opens the package popup, like Sri Mandir's "Select puja package". */
  onSelectPackage: () => void;
  /** Set when the page has a reviews section to scroll to. */
  onReviewsClick?: () => void;
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

      <SocialProofRow
        reviews={reviews}
        devotees={devotees}
        loading={statsLoading}
        onRatingClick={onReviewsClick}
        className="mt-4 [@media(max-height:960px)]:hidden"
      />

      {hasPackages && (
        <button onClick={onSelectPackage} className="btn-book mt-5 w-full [@media(max-height:800px)]:mt-4">
          {t("pd_select_btn")} <ArrowRight size={18} />
        </button>
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
