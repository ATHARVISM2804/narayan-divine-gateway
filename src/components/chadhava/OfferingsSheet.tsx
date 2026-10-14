import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { ChadhavaOffering } from "@/lib/supabase";
import BottomSheet from "@/components/shared/BottomSheet";
import OfferingRow from "@/components/chadhava/OfferingRow";
import { formatInr } from "@/components/ui/typography";

/**
 * "Choose your offering" popup: a bottom sheet on phones, a centred dialog from 640px.
 * Quantities are the page's own `selected` map, so the list on the page, the laptop
 * panel and the sticky bar stay in step with it.
 */
const OfferingsSheet = ({
  name,
  offerings,
  selected,
  onQty,
  includes,
  onContinue,
  onClose,
}: {
  name: string;
  offerings: ChadhavaOffering[];
  selected: Record<string, number>;
  onQty: (offeringId: string, qty: number) => void;
  includes: string[];
  onContinue: () => void;
  onClose: () => void;
}) => {
  const { t } = useLanguage();
  const count = Object.values(selected).reduce((s, q) => s + q, 0);
  const total = offerings.reduce((sum, o) => sum + (selected[o.id] || 0) * o.price, 0);

  const includesList = (
    <ul className="space-y-2">
      {includes.map((line) => (
        <li key={line} className="flex items-start gap-2 text-sm text-ink-muted">
          <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" /> {line}
        </li>
      ))}
    </ul>
  );

  return (
    <BottomSheet open onClose={onClose} title={t("ch_choose_offering")} className="sm:max-w-xl">
      <div className="px-4 pb-4 pt-3 sm:px-6 sm:pt-6">
        <h2 className="pr-10 text-lg font-bold leading-snug text-ink sm:text-xl">{t("ch_choose_offering")}</h2>
        <p className="mt-0.5 line-clamp-1 pr-10 text-sm font-medium text-saffron-dark">{name}</p>
        <p className="mt-1 text-sm text-ink-muted">{t("ch_choose_sub")}</p>

        {offerings.length === 0 ? (
          <p className="mt-4 rounded-xl border border-line p-6 text-center text-ink-muted">{t("ch_no_offerings")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {offerings.map((o) => (
              <OfferingRow key={o.id} offering={o} qty={selected[o.id] || 0} onQty={(q) => onQty(o.id, q)} />
            ))}
          </ul>
        )}

        <details className="group mt-4 rounded-xl border border-line bg-surface-muted/60 p-3.5 sm:p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink">
            {t("whats_included")}
            <ChevronDown size={16} className="text-ink-soft transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3">{includesList}</div>
        </details>
      </div>

      {/* Stays in reach of the thumb while the offerings scroll. */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-surface px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="tabular truncate text-lg font-bold text-ink">{formatInr(total)}</p>
          <p className="truncate text-xs font-medium text-ink-soft">
            {count > 0 ? `${count} ${t("ch_items_selected")}` : t("ch_select_hint")}
          </p>
        </div>
        <button type="button" onClick={onContinue} disabled={count === 0} className="btn-primary shrink-0 px-5 sm:px-8">
          {t("ch_proceed")} <ArrowRight size={18} />
        </button>
      </div>
    </BottomSheet>
  );
};

export default OfferingsSheet;
