import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

/* Round colour icons, one per promise: a white symbol on a solid circle. */
const Disc = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className="shrink-0">
    <circle cx="12" cy="12" r="12" fill={color} />
    <g fill="#fff">{children}</g>
  </svg>
);

const VideoIcon = () => (
  <Disc color="#1573DF">
    <rect x="5.5" y="8" width="9" height="8" rx="1.8" />
    <path d="M15.2 11.2 18.5 9v6l-3.3-2.2z" />
  </Disc>
);

/** A lit diya held in an open hand. */
const RitualIcon = () => (
  <Disc color="#D03801">
    <path d="M12 4.6c1.4 1.6 2 2.8 2 3.8a2 2 0 0 1-4 0c0-1 .6-2.2 2-3.8z" />
    <path d="M7.4 11.2h9.2a4.6 2.7 0 0 1-9.2 0z" />
    <path d="M5.2 15.8h7.6l3.6-2a1.1 1.1 0 0 1 1.2 1.8l-4.2 3.2H5.2z" />
  </Disc>
);

const MantraIcon = () => (
  <Disc color="#6C2BD9">
    <text x="12" y="16.6" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="'Noto Sans Devanagari', 'Mukta', sans-serif">ॐ</text>
  </Disc>
);

/** Laddoos on a plate. */
const PrasadIcon = () => (
  <Disc color="#D61F69">
    <circle cx="12" cy="7.4" r="2.4" />
    <circle cx="9.3" cy="10.6" r="2.4" />
    <circle cx="14.7" cy="10.6" r="2.4" />
    <rect x="5.8" y="13.2" width="12.4" height="2" rx="1" />
    <rect x="8.4" y="15.6" width="7.2" height="2.6" rx=".6" />
  </Disc>
);

/** What every booking comes with, under the devotee line on the pooja and chadhava
    pages: a row of cards you swipe sideways on phones. */
const FeatureChips = ({ kind, className }: { kind: "puja" | "chadhava"; className?: string }) => {
  const { t } = useLanguage();
  const items = [
    { icon: VideoIcon, title: t(kind === "puja" ? "feat_video_t" : "feat_video_ch_t"), desc: t("feat_video_d") },
    { icon: RitualIcon, title: t("feat_rituals_t"), desc: t("feat_rituals_d") },
    { icon: MantraIcon, title: t("feat_mantra_t"), desc: t("feat_mantra_d") },
    { icon: PrasadIcon, title: t("feat_box_t"), desc: t("feat_box_d") },
  ];
  return (
    // Runs to the screen edge on phones so the next card peeks in; inside the column from md.
    // scroll-px matches px, or snapping would pull the first card flush against the edge.
    <ul className={cn("-mx-4 flex snap-x gap-3 overflow-x-auto scroll-px-4 px-4 scrollbar-hide sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:scroll-px-0 md:px-0", className)}>
      {items.map(({ icon: Icon, title, desc }) => (
        <li key={title} className="flex w-[168px] shrink-0 snap-start items-start gap-2 rounded-lg border border-line bg-surface p-2.5">
          <Icon />
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold leading-snug text-ink">{title}</span>
            <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{desc}</span>
          </span>
        </li>
      ))}
    </ul>
  );
};

export default FeatureChips;
