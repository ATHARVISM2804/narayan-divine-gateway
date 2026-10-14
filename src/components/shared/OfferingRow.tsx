import { Minus, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FitImage from "@/components/FitImage";
import { TempleIcon } from "@/components/icons";
import { formatInr } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** What a row needs; chadhava offerings and a puja's add-on offerings both fit. */
export interface OfferingLike {
  id: string;
  name: string;
  name_hi?: string | null;
  description?: string | null;
  description_hi?: string | null;
  price: number;
  image_url?: string | null;
}

/** One offering with Add / − qty +: chadhava page and popup, and checkout add-ons. */
const OfferingRow = ({ offering: o, qty, onQty, max, placeholder }: {
  offering: OfferingLike;
  qty: number;
  onQty: (qty: number) => void;
  /** Highest quantity allowed (the server's limit); + stops there. */
  max?: number;
  /** Shown when the offering has no picture; a temple by default. */
  placeholder?: React.ReactNode;
}) => {
  const { t, lang } = useLanguage();
  const hi = lang === "hi";
  const name = hi && o.name_hi ? o.name_hi : o.name;
  const desc = hi && o.description_hi ? o.description_hi : o.description;

  return (
    <li className={cn("flex items-center gap-3 p-3 transition-colors md:p-4", qty > 0 && "bg-saffron-soft")}>
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {o.image_url ? (
          <FitImage src={o.image_url} alt={name} width={128} />
        ) : (
          <span className="grid h-full w-full place-items-center text-ink-soft">
            {placeholder ?? <TempleIcon size={22} />}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-snug text-ink">{name}</p>
        {desc && <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-soft">{desc}</p>}
        <p className="tabular mt-1 text-base font-bold text-saffron-dark">{formatInr(o.price)}</p>
      </div>
      {qty === 0 ? (
        <button
          onClick={() => onQty(1)}
          className="inline-flex h-10 shrink-0 items-center gap-1 rounded-[10px] border border-saffron px-4 text-sm font-semibold text-saffron-dark transition-colors hover:bg-saffron hover:text-white"
        >
          <Plus size={16} /> {t("ch_add")}
        </button>
      ) : (
        <div className="flex h-10 shrink-0 items-center overflow-hidden rounded-[10px] bg-saffron text-white">
          <button onClick={() => onQty(qty - 1)} className="grid h-full w-10 place-items-center hover:bg-saffron-dark" aria-label={t("ch_qty_remove")}>
            <Minus size={16} />
          </button>
          <span className="tabular w-6 text-center text-sm font-bold" aria-live="polite">{qty}</span>
          <button
            onClick={() => onQty(qty + 1)}
            disabled={max !== undefined && qty >= max}
            className="grid h-full w-10 place-items-center hover:bg-saffron-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label={t("ch_qty_add")}
          >
            <Plus size={16} />
          </button>
        </div>
      )}
    </li>
  );
};

export default OfferingRow;
