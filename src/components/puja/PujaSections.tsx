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
        <section id="aboutPuja" className="scroll-mt-32 py-10 md:py-14 border-b border-gold/20">
          <div className="container">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-6 flex items-center gap-2">
              📖 {t("pd_about")}
            </h2>
            <div className="rounded-2xl bg-ivory border border-gold/20 p-6 md:p-8 shadow-soft">
              <p className="text-sm md:text-base font-medium text-brown/80 leading-[1.8] whitespace-pre-line">{shownAbout}</p>
              {isLongAbout && (
                <button onClick={() => setAboutExpanded(!aboutExpanded)}
                  className="mt-4 flex items-center gap-1 text-sm font-bold text-saffron hover:text-maroon transition-colors">
                  {aboutExpanded ? <><ChevronUp size={15} /> {t("btn_read_less")}</> : <><ChevronDown size={15} /> {t("btn_read_more")}</>}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Benefits ── */}
      {benefits && benefits.length > 0 && (
        <section id="pujaBenefits" className="scroll-mt-32 py-10 md:py-14 bg-gradient-to-b from-cream to-ivory border-b border-gold/20">
          <div className="container">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-8 flex items-center gap-2">
              ✨ {t("pd_benefits")}
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl bg-ivory border border-gold/30 p-5 shadow-soft hover:shadow-md hover:border-saffron/40 transition-all">
                  <div className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-white shadow-md">
                    <Check size={16} />
                  </div>
                  <p className="text-[14px] md:text-[15px] font-semibold text-brown/80 leading-relaxed pt-1.5">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Process ── */}
      {steps && steps.length > 0 && (
        <section id="pujaProcess" className="scroll-mt-32 py-10 md:py-14 border-b border-gold/20">
          <div className="container">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-8 flex items-center gap-2">
              🔱 {t("pd_process")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((s, i) => (
                <div key={i} className="relative rounded-2xl bg-ivory border border-gold/30 p-6 shadow-soft hover:shadow-md hover:border-saffron/40 transition-all">
                  {/* Step number */}
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-white font-bold text-lg shadow-md mb-4">
                    {i + 1}
                  </div>
                  <p className="font-bold text-maroon text-[15px] md:text-base leading-snug">{s.title}</p>
                  <p className="text-xs md:text-sm text-brown/60 mt-2 leading-relaxed">{s.description}</p>

                  {/* Arrow connector (desktop only, not on last) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-cream border border-gold/30 shadow-sm">
                      <span className="text-saffron font-bold text-sm">→</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Temple Details ── */}
      {(templeName || templeDesc || puja.temple_image) && (
        <section id="templeDetails" className="scroll-mt-32 py-10 md:py-14 bg-gradient-to-b from-cream to-ivory border-b border-gold/20">
          <div className="container">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-8 flex items-center gap-2">
              🛕 {t("pd_temple")}
            </h2>
            <div className="rounded-2xl overflow-hidden border border-gold/40 bg-ivory shadow-soft">
              <div className={`grid grid-cols-1 ${puja.temple_image ? "lg:grid-cols-5" : ""}`}>
                {/* Image — takes 3 of 5 cols */}
                {puja.temple_image && (
                  <div className="lg:col-span-3 h-56 md:h-72 lg:h-full min-h-[280px] overflow-hidden">
                    <img src={puja.temple_image} alt={templeName || "Temple"} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Text — takes 2 of 5 cols */}
                <div className={`${puja.temple_image ? "lg:col-span-2" : ""} p-6 md:p-8 flex flex-col justify-center`}>
                  {templeName && <h3 className="font-body text-xl font-bold text-maroon mb-3">{templeName}</h3>}
                  {templeDesc && <p className="text-sm md:text-[15px] font-medium text-brown/75 leading-[1.8] whitespace-pre-line">{templeDesc}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQs ── */}
      {faqs && faqs.length > 0 && (
        <section id="faqSection" className="scroll-mt-32 py-10 md:py-14 border-b border-gold/20">
          <div className="container">
            <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-8 flex items-center gap-2">
              ❓ {t("pd_faqs")}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl border border-gold/30 bg-ivory overflow-hidden shadow-soft hover:shadow-md hover:border-saffron/40 transition-all">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left gap-4">
                    <span className="font-bold text-maroon text-sm md:text-[15px]">{faq.question}</span>
                    {openFaq === i ? <ChevronUp size={16} className="text-saffron shrink-0" /> : <ChevronDown size={16} className="text-brown/40 shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 border-t border-gold/20 pt-4">
                      <p className="text-sm md:text-[15px] text-brown/70 leading-relaxed">{faq.answer}</p>
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
