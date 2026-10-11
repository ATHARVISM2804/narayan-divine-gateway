import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Chadhava, Puja } from "@/lib/supabase";
import { prefetchProps } from "@/lib/prefetch";
import { MIN_PROOF_COUNT } from "@/lib/proof";
import FitImage from "@/components/FitImage";
import { TempleIcon } from "@/components/icons";
import { Eyebrow } from "@/components/ui/typography";

interface CardProps {
  to: string;
  image: string | null;
  title: string;
  occasion?: string | null;
  benefit?: string | null;
  place?: string | null;
  date?: string | null;
  booked?: number;
  cta: string;
  prefetch: ReturnType<typeof prefetchProps>;
  priority?: boolean;
}

/** One card layout for pujas and chadhava: image, what it is, where, when,
    and a full-width action. No "From ₹" price: prices show on the detail page.
    The whole card is the link. */
const BookingCard = ({ to, image, title, occasion, benefit, place, date, booked, cta, prefetch, priority }: CardProps) => {
  const { t } = useLanguage();
  return (
    <Link
      to={to}
      {...prefetch}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-saffron/40"
    >
      <div className="relative aspect-[1483/1061] overflow-hidden bg-surface-muted">
        {image ? (
          <FitImage src={image} alt={title} width={384} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} />
        ) : (
          <span className="grid h-full w-full place-items-center text-ink-soft">
            <TempleIcon size={36} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {occasion && <Eyebrow className="mb-1.5">{occasion}</Eyebrow>}
        <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug text-ink">{title}</h3>
        {benefit && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{benefit}</p>}
        <ul className="mt-3 space-y-1.5 text-sm font-medium text-ink-muted">
          {place && (
            <li className="flex items-start gap-2">
              <TempleIcon size={16} className="mt-0.5 shrink-0 text-saffron" />
              <span className="line-clamp-1">{place}</span>
            </li>
          )}
          {date && (
            <li className="flex items-start gap-2">
              <CalendarDays size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-saffron" />
              <span className="line-clamp-1">{date}</span>
            </li>
          )}
        </ul>
        <div className="flex-1" />
        {booked != null && booked >= MIN_PROOF_COUNT && (
          <p className="mt-4 text-xs font-medium text-ink-soft">
            {booked.toLocaleString("en-IN")} {t("pd_devotees_word")}
          </p>
        )}
        <span className="btn-primary mt-4 w-full group-hover:bg-saffron-dark">
          {cta} <ArrowRight size={18} />
        </span>
      </div>
    </Link>
  );
};

export const PujaCard = ({ puja, booked, priority }: { puja: Puja; booked?: number; priority?: boolean }) => {
  const { t, lang } = useLanguage();
  const hi = lang === "hi";
  return (
    <BookingCard
      to={`/puja/${puja.id}`}
      prefetch={prefetchProps("puja", puja.id)}
      image={puja.image_url}
      title={hi && puja.name_hi ? puja.name_hi : puja.name}
      occasion={hi && puja.occasion_hi ? puja.occasion_hi : puja.occasion}
      benefit={hi && puja.benefit_hi ? puja.benefit_hi : puja.benefit}
      place={hi && puja.location_hi ? puja.location_hi : puja.location}
      date={puja.date}
      booked={booked}
      cta={t("btn_participate")}
      priority={priority}
    />
  );
};

export const ChadhavaCard = ({
  chadhava,
  booked,
  priority,
}: {
  chadhava: Chadhava;
  booked?: number;
  priority?: boolean;
}) => {
  const { t, lang } = useLanguage();
  const hi = lang === "hi";
  return (
    <BookingCard
      to={`/chadhava/${chadhava.id}`}
      prefetch={prefetchProps("chadhava", chadhava.id)}
      image={chadhava.image_url}
      title={hi && chadhava.item_hi ? chadhava.item_hi : chadhava.item}
      occasion={hi && chadhava.occasion_hi ? chadhava.occasion_hi : chadhava.occasion}
      benefit={hi && chadhava.description_hi ? chadhava.description_hi : chadhava.description}
      place={hi && chadhava.temple_hi ? chadhava.temple_hi : chadhava.temple}
      date={chadhava.date}
      booked={booked}
      cta={t("btn_participate")}
      priority={priority}
    />
  );
};

export const CardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-xl border border-line bg-surface">
    <div className="aspect-[1483/1061] bg-surface-muted" />
    <div className="space-y-3 p-4">
      <div className="h-3 w-24 rounded bg-surface-muted" />
      <div className="h-5 w-4/5 rounded bg-surface-muted" />
      <div className="h-4 w-2/3 rounded bg-surface-muted" />
      <div className="mt-4 h-12 rounded-[10px] bg-surface-muted" />
    </div>
  </div>
);
