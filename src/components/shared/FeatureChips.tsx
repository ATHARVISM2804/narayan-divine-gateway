import { Flame, Video } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

/** Two promises under the devotee line on the pooja and chadhava pages: the video, and the rituals. */
const FeatureChips = ({ kind, className }: { kind: "puja" | "chadhava"; className?: string }) => {
  const { t } = useLanguage();
  const items = [
    { icon: Video, title: t(kind === "puja" ? "feat_video_t" : "feat_video_ch_t"), desc: t("feat_video_d") },
    { icon: Flame, title: t("feat_rituals_t"), desc: t("feat_rituals_d") },
  ];
  return (
    <ul className={cn("grid grid-cols-2 gap-3", className)}>
      {items.map(({ icon: Icon, title, desc }) => (
        <li key={title} className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-saffron-soft text-saffron-dark">
            <Icon size={16} strokeWidth={2} />
          </span>
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
