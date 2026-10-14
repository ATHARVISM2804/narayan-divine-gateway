import { ArrowRight, Check, ChevronDown, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import BottomSheet from "@/components/shared/BottomSheet";
import { PackageOption, type Tier } from "@/components/puja/BookingPanel";
import { tierMembers } from "@/lib/packages";
import { formatInr } from "@/components/ui/typography";

/**
 * "Select pooja package" popup: a bottom sheet on phones, a centred dialog from 640px.
 * The choice is the page's own `selected` state, so the sticky bar, the inline list
 * and the laptop panel always agree with it.
 */
const PackageSheet = ({
  name,
  tiers,
  tierImage,
  selected,
  onSelect,
  includes,
  onContinue,
  onAddToCart,
  onClose,
}: {
  name: string;
  tiers: Tier[];
  tierImage: (label: string) => string;
  selected: Tier | null;
  onSelect: (tier: Tier) => void;
  includes: string[];
  onContinue: () => void;
  onAddToCart: () => void;
  onClose: () => void;
}) => {
  const { t } = useLanguage();
  const badge = (label: string) => {
    const n = tierMembers(label);
    return n ? `${n} ${t("pkg_person")}` : undefined;
  };

  const includesList = (
    <ul className="space-y-2">
      {includes.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
          <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" /> {item}
        </li>
      ))}
    </ul>
  );

  return (
    <BottomSheet open onClose={onClose} title={t("pd_packages")} className="sm:max-w-2xl">
      <div className="px-4 pb-4 pt-3 sm:px-6 sm:pt-6">
        <h2 className="pr-10 text-lg font-bold leading-snug text-ink sm:text-xl">{t("pd_packages")}</h2>
        <p className="mt-0.5 line-clamp-1 pr-10 text-sm font-medium text-saffron-dark">{name}</p>
        <p className="mt-1 text-sm text-ink-muted">{t("select_package_sub")}</p>

        <div role="radiogroup" aria-label={t("pd_packages")} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiers.map((tier) => (
            <PackageOption
              key={tier.label}
              variant="card"
              tier={tier}
              image={tierImage(tier.label)}
              badge={badge(tier.label)}
              selected={selected?.label === tier.label}
              onSelect={() => onSelect(tier)}
            />
          ))}
        </div>

        {includes.length > 0 && (
          <div className="mt-4 rounded-xl border border-line bg-surface-muted/60 p-3.5 sm:p-4">
            {/* Phones: folded so the packages and the button stay in view. */}
            <details className="group sm:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink">
                {t("pd_includes")}
                <ChevronDown size={16} className="text-ink-soft transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3">{includesList}</div>
            </details>
            <div className="hidden sm:block">
              <h3 className="mb-2.5 text-sm font-semibold text-ink">{t("pd_includes")}</h3>
              {includesList}
            </div>
          </div>
        )}
      </div>

      {/* Stays in reach of the thumb while the packages scroll. */}
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
        <button type="button" onClick={onContinue} disabled={!selected} className="btn-primary shrink-0 px-5 sm:px-8">
          {t("btn_continue")} <ArrowRight size={18} />
        </button>
      </div>
    </BottomSheet>
  );
};

export default PackageSheet;
