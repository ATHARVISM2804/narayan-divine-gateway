import { ListChecks, Video } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/context/LanguageContext";
import { SankalpIcon, TempleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Four steps from choosing a puja to receiving the video. */
const HowItWorks = ({ className }: { className?: string }) => {
  const { t } = useLanguage();
  const steps = [
    { Icon: ListChecks, title: t("hiw_s1_title"), desc: t("hiw_s1_desc") },
    { Icon: SankalpIcon, title: t("hiw_s2_title"), desc: t("hiw_s2_desc") },
    { Icon: TempleIcon, title: t("hiw_s3_title"), desc: t("hiw_s3_desc") },
    { Icon: Video, title: t("hiw_s4_title"), desc: t("hiw_s4_desc") },
  ];

  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="container">
        <SectionHeading title={t("hiw_title")} />
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ Icon, title, desc }, i) => (
            <li key={i} className="flex gap-4 rounded-xl border border-line bg-surface p-4 lg:flex-col lg:gap-3 lg:p-5">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-saffron-soft text-saffron-dark">
                <Icon size={22} strokeWidth={1.75} />
                <span className="tabular absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-maroon text-xs font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
