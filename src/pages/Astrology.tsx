import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import heroAstrology from "@/assets/hero-astrology-page.png";
import { useLanguage } from "@/context/LanguageContext";

const Astrology = () => {
  usePageTitle("Vedic Astrology & Pandit Consultation — Narayan Kripa");
  const { t } = useLanguage();

  const services = [
    { name: t("ast_s1"), desc: t("ast_s1_desc"), icon: "📜" },
    { name: t("ast_s2"), desc: t("ast_s2_desc"), icon: "💑" },
    { name: t("ast_s3"), desc: t("ast_s3_desc"), icon: "💼" },
    { name: t("ast_s4"), desc: t("ast_s4_desc"), icon: "🏠" },
    { name: t("ast_s5"), desc: t("ast_s5_desc"), icon: "🔢" },
    { name: t("ast_s6"), desc: t("ast_s6_desc"), icon: "🃏" },
  ];

  const zodiacs = [
    { sign: t("ast_aries"), symbol: "♈", line: t("ast_aries_line") },
    { sign: t("ast_taurus"), symbol: "♉", line: t("ast_taurus_line") },
    { sign: t("ast_gemini"), symbol: "♊", line: t("ast_gemini_line") },
    { sign: t("ast_cancer"), symbol: "♋", line: t("ast_cancer_line") },
    { sign: t("ast_leo"), symbol: "♌", line: t("ast_leo_line") },
    { sign: t("ast_virgo"), symbol: "♍", line: t("ast_virgo_line") },
    { sign: t("ast_libra"), symbol: "♎", line: t("ast_libra_line") },
    { sign: t("ast_scorpio"), symbol: "♏", line: t("ast_scorpio_line") },
    { sign: t("ast_sagittarius"), symbol: "♐", line: t("ast_sagittarius_line") },
    { sign: t("ast_capricorn"), symbol: "♑", line: t("ast_capricorn_line") },
    { sign: t("ast_aquarius"), symbol: "♒", line: t("ast_aquarius_line") },
    { sign: t("ast_pisces"), symbol: "♓", line: t("ast_pisces_line") },
  ];

  return (
  <main>
    <PageHero title={t("ast_hero")} subtitle={t("ast_hero_sub")} variant="brown" breadcrumb={t("ast_breadcrumb")} bgImage={heroAstrology} />

    <section className="bg-background py-16">
      <div className="container">
        <SectionHeading title={t("ast_section_title")} subtitle={t("ast_section_sub")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.name} className="rounded-2xl border border-gold/50 bg-ivory p-6 transition-all hover:-translate-y-1 hover:border-saffron hover:shadow-lg">
              <div className="text-4xl">{s.icon}</div>
              <h3 className="mt-3 font-display text-maroon">{s.name}</h3>
              <p className="text-sm text-brown/70">{s.desc}</p>
              <Link to="/contact" className="mt-4 inline-block text-sm font-semibold text-saffron hover:text-maroon">{t("ast_consult")}</Link>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-cream py-16">
      <div className="container">
        <SectionHeading title={t("ast_horoscope_title")} subtitle={t("ast_horoscope_sub")} />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {zodiacs.map((z) => (
            <article key={z.sign} className="rounded-2xl border border-gold/40 bg-ivory p-5 text-center transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-2xl text-white">{z.symbol}</div>
              <h4 className="mt-2 font-display text-maroon">{z.sign}</h4>
              <p className="mt-1 text-xs text-brown/70">{z.line}</p>
              <Link to="/contact" className="mt-3 inline-block text-xs font-semibold text-saffron hover:text-maroon">{t("ast_read_more")}</Link>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-maroon py-16 text-cream">
      <div className="container text-center">
        <h2 className="font-display text-3xl text-gold md:text-4xl">{t("ast_cta_title")}</h2>
        <p className="mx-auto mt-3 max-w-xl font-serif italic text-cream/80">{t("ast_cta_sub")}</p>
        <Link to="/contact" className="mt-6 inline-block rounded-full bg-saffron px-8 py-3 font-semibold text-white hover:bg-gold hover:text-maroon transition-colors">{t("ast_cta_btn")}</Link>
      </div>
    </section>
  </main>
  );
};

export default Astrology;
