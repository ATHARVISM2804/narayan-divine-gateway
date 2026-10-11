import { Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { averageRating, type Review } from "@/lib/proof";
import StorageImage from "@/components/StorageImage";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

/** Avatar stack of real reviewers + average rating. Renders nothing without reviews. */
const RatingSummary = ({ reviews, onClick }: { reviews: Review[]; onClick?: () => void }) => {
  const { t } = useLanguage();
  const summary = averageRating(reviews);
  if (!summary) return null;
  const faces = reviews.slice(0, 5);

  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 text-left">
      <span className="flex -space-x-2">
        {faces.map((r) =>
          r.photo_url ? (
            <StorageImage key={r.id} src={r.photo_url} width={64} alt="" className="h-8 w-8 rounded-full border-2 border-surface object-cover" />
          ) : (
            <span key={r.id} className="grid h-8 w-8 place-items-center rounded-full border-2 border-surface bg-surface-muted text-xs font-semibold text-maroon">
              {initials(r.name)}
            </span>
          ),
        )}
      </span>
      <span className="flex items-center gap-1 text-sm font-semibold text-ink">
        <Star size={15} className="fill-saffron text-saffron" /> {summary.avg.toFixed(1)}
        <span className="font-medium text-ink-soft underline decoration-dotted underline-offset-4">
          ({summary.count} {t("pd_rating_label")})
        </span>
      </span>
    </button>
  );
};

export default RatingSummary;
