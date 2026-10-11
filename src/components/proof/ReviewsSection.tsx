import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Review } from "@/lib/proof";
import SectionHeading from "@/components/SectionHeading";
import LiteYouTube from "./LiteYouTube";
import Stars from "./Stars";

const fmtDate = (iso: string, lang: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });
};

/** Video testimonials in a swipeable row, then dated text reviews.
    Hides itself when there is nothing real to show. */
const ReviewsSection = ({
  reviews,
  id,
  title,
  subtitle,
  limit = 6,
  className,
}: {
  reviews: Review[];
  id?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}) => {
  const { t, lang } = useLanguage();
  const [shown, setShown] = useState(limit);
  const videos = reviews.filter((r) => r.video_url);
  const texts = reviews.filter((r) => (lang === "hi" && r.text_hi) || r.text);
  if (videos.length === 0 && texts.length === 0) return null;

  return (
    <section id={id} className={className ?? "scroll-mt-32 py-10 md:py-14"}>
      <div className="container">
        <SectionHeading title={title ?? t("test_title")} subtitle={subtitle ?? t("test_sub")} />

        {videos.length > 0 && (
          <div className="-mx-4 mb-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
            {videos.slice(0, 8).map((r) => {
              const city = lang === "hi" && r.city_hi ? r.city_hi : r.city;
              return (
                <figure key={r.id} className="w-[46%] shrink-0 snap-start sm:w-[30%] md:w-auto">
                  <LiteYouTube url={r.video_url!} title={`${t("rev_play")}: ${r.name}`} vertical />
                  <figcaption className="mt-2">
                    <p className="text-sm font-semibold text-ink">{r.name}</p>
                    {city && <p className="text-xs text-ink-soft">{city}</p>}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}

        {texts.length > 0 && (
          <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {texts.slice(0, shown).map((r) => {
                const text = lang === "hi" && r.text_hi ? r.text_hi : r.text;
                const city = lang === "hi" && r.city_hi ? r.city_hi : r.city;
                return (
                  <article key={r.id} className="rounded-xl border border-line bg-surface p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-ink">{r.name}</p>
                        <p className="text-xs text-ink-soft">
                          {[city, fmtDate(r.review_date, lang)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{text}</p>
                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-success">
                      <BadgeCheck size={14} /> {t("rev_verified")}
                    </p>
                  </article>
                );
              })}
            </div>
            {texts.length > shown && (
              <div className="mt-5 text-center">
                <button onClick={() => setShown((n) => n + 6)} className="btn-secondary min-h-[44px]">
                  {t("btn_read_more")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
