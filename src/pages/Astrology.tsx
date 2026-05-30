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

  const steps = [
    { icon: "📞", title: "Choose Your Pandit", desc: "Browse certified experts by specialty" },
    { icon: "🗓️", title: "Pick a Slot", desc: "Book a convenient time — same day available" },
    { icon: "🔮", title: "Get Guidance", desc: "Personalised Vedic consultation via call/chat" },
  ];

  const trustBadges = [
    { icon: "✅", text: "Government Certified" },
    { icon: "🎓", text: "Sanskrit Scholars" },
    { icon: "🔒", text: "100% Confidential" },
    { icon: "⭐", text: "4.8★ Avg Rating" },
  ];

  return (
    <main>
      <PageHero
        title={t("ast_hero")}
        subtitle={t("ast_hero_sub")}
        variant="brown"
        breadcrumb={t("ast_breadcrumb")}
        bgImage={heroAstrology}
      />

      {/* ── Astrology Services ── */}
      <section className="bg-background py-16">
        <div className="container">
          <SectionHeading title={t("ast_section_title")} subtitle={t("ast_section_sub")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.name}
                className="rounded-2xl border border-gold/50 bg-ivory p-6 transition-all hover:-translate-y-1 hover:border-saffron hover:shadow-lg"
              >
                <div className="text-4xl">{s.icon}</div>
                <h3 className="mt-3 font-display text-maroon">{s.name}</h3>
                <p className="text-sm text-brown/70">{s.desc}</p>
                <Link to="/contact" className="mt-4 inline-block text-sm font-semibold text-saffron hover:text-maroon">
                  {t("ast_consult")}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Speak to a Certified Pandit ── */}
      <section className="relative overflow-hidden bg-cream py-16">
        {/* Decorative mandala watermarks */}
        <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 text-gold/[0.06]" fill="none" stroke="currentColor" strokeWidth="0.4">
          <circle cx="100" cy="100" r="95" /><circle cx="100" cy="100" r="70" /><circle cx="100" cy="100" r="45" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1="100" y1="5" x2="100" y2="195" transform={`rotate(${i * 15} 100 100)`} />
          ))}
        </svg>
        <svg viewBox="0 0 200 200" className="pointer-events-none absolute -left-20 bottom-20 h-64 w-64 text-saffron/[0.04]" fill="none" stroke="currentColor" strokeWidth="0.4">
          <circle cx="100" cy="100" r="95" /><circle cx="100" cy="100" r="60" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="100" y1="5" x2="100" y2="195" transform={`rotate(${i * 22.5} 100 100)`} />
          ))}
        </svg>

        <div className="container relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-saffron/10 border border-saffron/30 px-4 py-1.5 text-xs font-bold text-saffron uppercase tracking-wider mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Pandits Available Now
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-maroon">
              Speak to a <span className="text-gold-shimmer">Certified Pandit</span>
            </h2>
            <p className="mt-3 font-serif italic text-brown/60 max-w-xl mx-auto text-base">
              Get personalised Vedic guidance from verified Sanskrit scholars —
              instantly, from the comfort of your home.
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {trustBadges.map((b) => (
              <span key={b.text} className="flex items-center gap-2 rounded-full bg-ivory border border-gold/40 px-4 py-2 text-sm font-semibold text-maroon shadow-soft">
                <span>{b.icon}</span> {b.text}
              </span>
            ))}
          </div>

          {/* How it works card */}
          <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-ivory via-cream to-ivory p-6 md:p-10 shadow-soft">
            <h3 className="font-display text-2xl text-maroon text-center mb-8">How It Works</h3>
            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-2xl shadow-md ring-4 ring-gold/20">
                      {s.icon}
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-gold text-[11px] font-bold text-maroon shadow">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-maroon text-sm">{s.title}</p>
                    <p className="text-xs text-brown/60 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-saffron to-maroon px-8 py-4 text-sm font-bold text-white shadow-md hover:shadow-gold-glow hover:-translate-y-0.5 transition-all"
              >
                🙏 Book Your Free Consultation
              </Link>
              <p className="mt-3 text-xs text-brown/40 font-serif italic">
                No credit card required • First session free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-maroon py-16 text-cream">
        <div className="container text-center">
          <h2 className="font-display text-3xl text-gold md:text-4xl">{t("ast_cta_title")}</h2>
          <p className="mx-auto mt-3 max-w-xl font-serif italic text-cream/80">{t("ast_cta_sub")}</p>
          <Link
            to="/contact"
            className="mt-6 inline-block rounded-full bg-saffron px-8 py-3 font-semibold text-white hover:bg-gold hover:text-maroon transition-colors"
          >
            {t("ast_cta_btn")}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Astrology;
