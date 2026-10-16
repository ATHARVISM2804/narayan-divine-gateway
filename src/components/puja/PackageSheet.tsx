import { useEffect, useRef } from "react";
import { ArrowRight, Check, Lock, MessageCircle, ShoppingCart, Users, Video } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import BottomSheet from "@/components/shared/BottomSheet";
import LeadForm from "@/components/puja/LeadForm";
import type { Tier } from "@/components/puja/BookingPanel";
import { tierMembers } from "@/lib/packages";
import { formatInr } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type BookingStep = "package" | "details";

/** Small package button: member pill, name, price, round tick. */
const PackageChip = ({ tier, members, selected, onSelect }: {
  tier: Tier; members?: string; selected: boolean; onSelect: () => void;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={cn(
      "relative flex min-w-0 flex-col items-start rounded-xl border-2 px-3 py-2.5 text-left transition-colors",
      selected ? "border-saffron bg-saffron-soft" : "border-line bg-surface hover:border-saffron/50",
    )}
  >
    {members && (
      <span className="inline-flex items-center gap-1 rounded-full bg-saffron/10 px-2 py-0.5 text-[11px] font-semibold text-saffron-dark">
        <Users size={12} strokeWidth={2.25} /> {members}
      </span>
    )}
    <span className="mt-1.5 line-clamp-1 block w-full pr-5 text-sm font-semibold leading-snug text-ink">{tier.label}</span>
    <span className="tabular block text-base font-bold text-saffron-dark">{formatInr(tier.price)}</span>
    <span
      className={cn(
        "absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full border-2",
        selected ? "border-saffron bg-saffron text-white" : "border-input bg-surface",
      )}
    >
      {selected && <Check size={12} strokeWidth={3} />}
    </span>
  </button>
);

/**
 * Booking popup, two steps in one sheet (like Sri Mandir):
 *  1. "package": what every package includes, the package buttons, Proceed.
 *  2. "details": WhatsApp number + name, with ← back to the packages.
 * A bottom sheet on phones, a centred dialog from 640px. The step and the choice
 * belong to the page, so the sticky bar, the inline list and the laptop panel
 * always agree with it, and "Book this package" can open straight on step 2.
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
  const members = (label: string) => {
    const n = tierMembers(label);
    return n ? `${n} ${t("pkg_person")}` : undefined;
  };
  const details = step === "details" && selected;

  // Each step starts at its top, not where the other one was scrolled to.
  useEffect(() => {
    const panel = top.current?.parentElement;
    if (panel) panel.scrollTop = 0;
  }, [step]);

  const trust = [
    { icon: Lock, label: t("trust_secure") },
    { icon: Video, label: t("trust_video") },
    { icon: MessageCircle, label: t("trust_support") },
  ];

  return (
    <BottomSheet open onClose={onClose} title={details ? t("lead_details_title") : t("pd_packages")} className="sm:max-w-xl">
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
          <div className="px-4 pb-4 pt-3 sm:px-6 sm:pt-6">
            {includes.length > 0 && (
              <>
                <h2 className="pr-10 text-lg font-bold leading-snug text-ink">{t("pd_includes")}</h2>
                <p className="mt-0.5 line-clamp-1 pr-10 text-sm font-medium text-saffron-dark">{name}</p>
                <ul className="mt-3 space-y-2">
                  {includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-snug text-ink-muted">
                      <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" /> {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className={cn("font-bold text-ink", includes.length > 0 ? "mt-5 text-base" : "pr-10 text-lg")}>
              {t("pkg_select_title")}
            </h3>
            {includes.length === 0 && <p className="mt-0.5 line-clamp-1 pr-10 text-sm font-medium text-saffron-dark">{name}</p>}
            <div role="radiogroup" aria-label={t("pkg_select_title")} className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {tiers.map((tier) => (
                <PackageChip
                  key={tier.label}
                  tier={tier}
                  members={members(tier.label)}
                  selected={selected?.label === tier.label}
                  onSelect={() => onSelect(tier)}
                />
              ))}
            </div>

            <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {trust.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                  <Icon size={14} strokeWidth={1.75} className="shrink-0 text-success" /> {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Stays in reach of the thumb while the list scrolls. */}
          <div className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-surface px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="tabular truncate text-lg font-bold text-ink">{selected ? formatInr(selected.price) : ""}</p>
              <p className="truncate text-xs font-medium text-ink-soft">{selected ? selected.label : t("pd_select_hint")}</p>
            </div>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={!selected}
              aria-label={t("btn_add_cart")}
              title={t("btn_add_cart")}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] border border-line text-ink-muted transition-colors hover:border-saffron/50 hover:text-ink disabled:opacity-40"
            >
              <ShoppingCart size={20} />
            </button>
            <button type="button" onClick={() => onStep("details")} disabled={!selected} className="btn-primary shrink-0 px-5 sm:px-8">
              {t("btn_proceed")} <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}
    </BottomSheet>
  );
};

export default PackageSheet;
