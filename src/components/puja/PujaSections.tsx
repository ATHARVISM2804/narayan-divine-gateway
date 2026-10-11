import { useState } from "react";
import { Check, MapPin, PlayCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Puja } from "@/lib/supabase";
import FitImage from "@/components/FitImage";
import SectionHeading from "@/components/SectionHeading";
import LiteYouTube from "@/components/proof/LiteYouTube";
import RichText from "@/components/shared/RichText";
import ReadMore from "@/components/shared/ReadMore";
import { Highlight } from "@/components/ui/typography";
import { MIN_PROOF_COUNT } from "@/lib/proof";

const Section = ({ id, muted, children }: { id: string; muted?: boolean; children: React.ReactNode }) => (
  // From lg up the sections sit flush in the left column of the detail page, so the
  // full-width colour bands and the narrow centred column give way to dividers.
  <section id={id} className={`scroll-mt-32 border-b border-line py-10 md:py-12 ${muted ? "bg-surface-muted/60 lg:bg-transparent" : ""}`}>
    <div className="container max-w-4xl lg:max-w-none lg:px-0">{children}</div>
  </section>
);

/** About, benefits, process and temple. Each hides when the puja has no data
    for it; process falls back to the standard three steps. */
const PujaSections = ({ puja, bookedCount }: { puja: Puja; bookedCount?: number }) => {
  const { t, lang } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);

  const pick = <T,>(hi: T | null | undefined, en: T | null | undefined, hasHi = Boolean(hi)) => (lang === "hi" && hasHi ? hi : en);
  const about = pick(puja.about_hi, puja.about);
  const benefits = pick(puja.benefits_hi, puja.benefits, Boolean(puja.benefits_hi?.length));
  const steps = pick(puja.process_steps_hi, puja.process_steps, Boolean(puja.process_steps_hi?.length));
  const templeName = pick(puja.temple_name_hi, puja.temple_name);
  const templeDesc = pick(puja.temple_description_hi, puja.temple_description);
  const location = pick(puja.location_hi, puja.location);

  const processSteps =
    steps && steps.length > 0
      ? steps
      : [
          { title: t("step1t"), description: t("step1d") },
          { title: t("step2t"), description: t("step2d") },
          { title: t("step3t"), description: t("step3d") },
        ];

  const pastVideo = puja.past_video_url;

  return (
    <>
      {about && (
        <Section id="aboutPuja">
          <SectionHeading title={t("pd_about")} className="mb-4" />
          <ReadMore length={about.length} threshold={400} collapsedClass="max-h-[12rem]" className="lg:max-w-3xl">
            <RichText text={about} />
          </ReadMore>
        </Section>
      )}

      {benefits && benefits.length > 0 && (
        <Section id="pujaBenefits" muted>
          <SectionHeading title={t("pd_benefits")} className="mb-5" />
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                  <Check size={14} strokeWidth={2.5} />
                </span>
                <span className="text-[15px] font-medium leading-relaxed text-ink">{b}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="pujaProcess">
        <SectionHeading title={t("pd_process")} className="mb-5" />
        <ol className="relative space-y-5 border-l border-dashed border-saffron/40 pl-7">
          {processSteps.map((s, i) => (
            <li key={i} className="relative">
              <span className="tabular absolute -left-[42px] top-0 grid h-7 w-7 place-items-center rounded-full bg-saffron text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-base font-semibold text-ink">{s.title}</p>
              {s.description && <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{s.description}</p>}
            </li>
          ))}
        </ol>
      </Section>

      {(templeName || templeDesc || puja.temple_image || pastVideo) && (
        <Section id="templeDetails" muted>
          <SectionHeading title={t("pd_where")} className="mb-5" />
          {/* Photo on top at every width: beside a long story it used to stretch into
              a tall, mostly blurred column. Then the facts, then the story. */}
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            {puja.temple_image && (
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
                <FitImage
                  src={puja.temple_image}
                  alt={templeName || location || ""}
                  width={640}
                  sizes="(min-width: 1024px) 900px, 100vw"
                />
              </div>
            )}
            <div className="p-5 md:p-6 lg:p-8">
              {templeName && <h3 className="text-lg font-bold text-ink lg:text-xl">{templeName}</h3>}
              {location && (
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-ink-soft">
                  <MapPin size={15} /> {location}
                </p>
              )}
              {((bookedCount != null && bookedCount >= MIN_PROOF_COUNT) || (pastVideo && !showVideo)) && (
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                  {bookedCount != null && bookedCount >= MIN_PROOF_COUNT && (
                    <p className="text-[15px] text-ink-muted">
                      <Highlight>{bookedCount.toLocaleString("en-IN")}</Highlight> {t("pd_booked_here")}
                    </p>
                  )}
                  {pastVideo && !showVideo && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="inline-flex items-center gap-2 text-[15px] font-semibold text-saffron-dark hover:underline"
                    >
                      <PlayCircle size={20} /> {t("pd_watch_video")}
                    </button>
                  )}
                </div>
              )}
              {templeDesc && (
                <ReadMore length={templeDesc.length} className="mt-5 border-t border-line pt-5 lg:max-w-3xl">
                  <RichText text={templeDesc} />
                </ReadMore>
              )}
            </div>
            {pastVideo && showVideo && (
              <div className="border-t border-line p-4">
                <LiteYouTube url={pastVideo} title={t("pd_watch_video")} />
              </div>
            )}
          </div>
        </Section>
      )}
    </>
  );
};

export default PujaSections;
