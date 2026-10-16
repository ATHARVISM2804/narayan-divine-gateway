import { Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SITE_RATING, compactCount, roundedCount, type Review } from "@/lib/proof";
import StorageImage from "@/components/StorageImage";
import { Highlight } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import d1 from "@/assets/devotees/d1.webp";
import d2 from "@/assets/devotees/d2.webp";
import d3 from "@/assets/devotees/d3.webp";
import d4 from "@/assets/devotees/d4.webp";
import d5 from "@/assets/devotees/d5.webp";

/** Faces cropped from our own pooja artwork; real reviewer photos take their place first. */
const ARTWORK_FACES = [d1, d2, d3, d4, d5];
const FACES = 5;

const avatar = "h-9 w-9 rounded-full object-cover ring-2 ring-surface shadow-sm sm:h-10 sm:w-10";

/**
 * Avatar stack + "★ 4.9 (7K+ ratings)" + "Till now 20,000+ devotees have booked…".
 * The devotee line keeps its height while stats load (`loading`), so the page doesn't jump.
 * `showRating={false}` leaves only the devotee line (the homepage hero).
 */
const SocialProofRow = ({
  reviews,
  devotees,
  loading,
  onRatingClick,
  showRating = true,
  className,
}: {
  reviews: Review[];
  devotees: number | null;
  loading: boolean;
  /** Set when there is a reviews section to scroll to. */
  onRatingClick?: () => void;
  showRating?: boolean;
  className?: string;
}) => {
  const { t, lang } = useLanguage();
  const photos = reviews.filter((r) => r.photo_url).slice(0, FACES);
  const fill = ARTWORK_FACES.slice(0, FACES - photos.length);

  const rating = (
    <>
      <Star size={18} className="shrink-0 fill-saffron text-saffron" aria-hidden="true" />
      <span className="tabular font-bold text-saffron-dark">{SITE_RATING.avg.toFixed(1)}</span>
      <span className="border-b border-dashed border-saffron/70 pb-px font-semibold text-saffron-dark">
        ({compactCount(SITE_RATING.count, lang)} {t("pd_rating_label")})
      </span>
    </>
  );

  return (
    <div className={cn("space-y-2.5", className)}>
      {showRating && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex -space-x-2.5" aria-hidden="true">
            {photos.map((r) => (
              <StorageImage key={r.id} src={r.photo_url!} width={80} alt="" className={avatar} />
            ))}
            {fill.map((src) => (
              <img key={src} src={src} alt="" width={40} height={40} loading="lazy" decoding="async" className={avatar} />
            ))}
          </span>
          {onRatingClick ? (
            <button type="button" onClick={onRatingClick} className="inline-flex items-center gap-1.5 text-[15px]">
              {rating}
            </button>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-[15px]">{rating}</p>
          )}
        </div>
      )}
      {devotees ? (
        <p className="text-[15px] text-ink-muted">
          {t("home_proof_pre")} <Highlight>{roundedCount(devotees)} {t("pd_devotees_word")}</Highlight> {t("home_proof_post")}
        </p>
      ) : (
        loading && <p aria-hidden="true" className="text-[15px]">&nbsp;</p>
      )}
    </div>
  );
};

export default SocialProofRow;
