import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Puja } from "@/lib/supabase";

const PujaSections = ({ puja }: { puja: Puja }) => {
  const { t, lang } = useLanguage();
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const about = (lang === "hi" && puja.about_hi) ? puja.about_hi : puja.about;
  const benefits = (lang === "hi" && puja.benefits_hi?.length) ? puja.benefits_hi : puja.benefits;
  const steps = (lang === "hi" && puja.process_steps_hi?.length) ? puja.process_steps_hi : puja.process_steps;
  const templeName = (lang === "hi" && puja.temple_name_hi) ? puja.temple_name_hi : puja.temple_name;
  const templeDesc = (lang === "hi" && puja.temple_description_hi) ? puja.temple_description_hi : puja.temple_description;
  const faqs = (lang === "hi" && puja.faqs_hi?.length) ? puja.faqs_hi : puja.faqs;

  const ABOUT_LIMIT = 300;
  const isLongAbout = (about?.length || 0) > ABOUT_LIMIT;
  const shownAbout = about ? (isLongAbout && !aboutExpanded ? about.slice(0, ABOUT_LIMIT) + "…" : about) : null;

  return (
    <>
      {/* ── About ── */}
      {about && (
        <section id="aboutPuja" className="scroll-mt-32 py-10 border-b border-gold/20">
          <div className="container max-w-4xl">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-4 flex items-center gap-2">
              📖 {t("pd_about")}
            </h2>
            <p className="text-sm md:text-base font-medium text-brown/80 leading-relaxed whitespace-pre-line">{shownAbout}</p>
            {isLongAbout && (
              <button onClick={() => setAboutExpanded(!aboutExpanded)}
                className="mt-3 flex items-center gap-1 text-sm font-bold text-saffron hover:text-maroon transition-colors">
                {aboutExpanded ? <><ChevronUp size={15} /> {t("btn_read_less")}</> : <><ChevronDown size={15} /> {t("btn_read_more")}</>}
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Benefits ── */}
      {benefits && benefits.length > 0 && (
        <section id="pujaBenefits" className="scroll-mt-32 py-10 bg-gradient-to-b from-cream to-ivory border-b border-gold/20">
          <div className="container max-w-4xl">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-6 flex items-center gap-2">
              ✨ {t("pd_benefits")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-ivory border border-gold/30 p-4 shadow-soft">
                  <div className="shrink-0 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-white text-sm font-bold shadow-md">
                    <Check size={14} />
                  </div>
                  <p className="text-sm font-semibold text-brown/80 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Process ── */}
      {steps && steps.length > 0 && (
        <section id="pujaProcess" className="scroll-mt-32 py-10 border-b border-gold/20">
          <div className="container max-w-4xl">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-6 flex items-center gap-2">
              🔱 {t("pd_process")}
            </h2>
            <div className="relative pl-8">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-saffron via-gold to-maroon/30" />
              <div className="flex flex-col gap-6">
                {steps.map((s, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="absolute -left-8 shrink-0 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-white font-bold text-sm shadow-md z-10">
                      {i + 1}
                    </div>
                    <div className="ml-4 rounded-xl bg-ivory border border-gold/30 p-4 shadow-soft flex-1">
                      <p className="font-bold text-maroon text-sm">{s.title}</p>
                      <p className="text-xs text-brown/60 mt-1 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Temple Details ── */}
      {(templeName || templeDesc || puja.temple_image) && (
        <section id="templeDetails" className="scroll-mt-32 py-10 bg-gradient-to-b from-cream to-ivory border-b border-gold/20">
          <div className="container max-w-4xl">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-6 flex items-center gap-2">
              🛕 {t("pd_temple")}
            </h2>
            <div className="rounded-2xl overflow-hidden border border-gold/40 bg-ivory shadow-soft">
              {puja.temple_image && (
                <div className="h-48 md:h-64 overflow-hidden">
                  <img src={puja.temple_image} alt={templeName || "Temple"} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 md:p-6">
                {templeName && <h3 className="font-body text-lg font-bold text-maroon mb-2">{templeName}</h3>}
                {templeDesc && <p className="text-sm font-medium text-brown/75 leading-relaxed whitespace-pre-line">{templeDesc}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQs ── */}
      {faqs && faqs.length > 0 && (
        <section id="faqSection" className="scroll-mt-32 py-10 border-b border-gold/20">
          <div className="container max-w-4xl">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-6 flex items-center gap-2">
              ❓ {t("pd_faqs")}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-gold/30 bg-ivory overflow-hidden shadow-soft">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left">
                    <span className="font-bold text-maroon text-sm pr-4">{faq.question}</span>
                    {openFaq === i ? <ChevronUp size={16} className="text-saffron shrink-0" /> : <ChevronDown size={16} className="text-brown/40 shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 border-t border-gold/20 pt-3">
                      <p className="text-sm text-brown/70 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default PujaSections;
