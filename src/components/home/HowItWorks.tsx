import { Search, FileText, Flame, Video } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/context/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { Icon: Search, title: t("hiw_s1_title"), desc: t("hiw_s1_desc") },
    { Icon: FileText, title: t("hiw_s2_title"), desc: t("hiw_s2_desc") },
    { Icon: Flame, title: t("hiw_s3_title"), desc: t("hiw_s3_desc") },
    { Icon: Video, title: t("hiw_s4_title"), desc: t("hiw_s4_desc") },
  ];

  return (
    <section className="relative bg-ivory py-20">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="container">
        <SectionHeading title={t("hiw_title")} />

        <div className="relative mt-10 grid gap-10 md:grid-cols-4 md:gap-4">
          {/* Dashed connector */}
          <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-gold md:block" style={{ marginInline: "12.5%" }} />

          {steps.map((s, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-saffron font-display text-2xl text-white ring-4 ring-gold ring-offset-2 ring-offset-cream">
                {i + 1}
              </div>
              <s.Icon size={28} className="mt-4 text-saffron" />
              <h3 className="mt-2 font-display text-base text-maroon">{s.title}</h3>
              <p className="mt-1 max-w-[14rem] text-sm text-brown/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
