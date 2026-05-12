import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Sparkles } from "lucide-react";
import heroTemple from "@/assets/hero-temple.jpg";
import heroChadhava from "@/assets/hero-chadhava.jpg";
import heroPandit from "@/assets/hero-pandit.jpg";
import heroDarshan from "@/assets/hero-darshan.jpg";
import { useLanguage } from "@/context/LanguageContext";
import { CornerOrnament, Mandala, FloatingParticles } from "@/components/Ornaments";

interface Slide {
  id: number;
  image: string;
  overlay: string;
  pill: { text: string; cls: string };
  title: string;
  titleAccent: string;
  titleCls: string;
  subtitle: string;
  subtitleCls: string;
  primaryCta: string;
  linkPrimary: string;
  secondaryCta?: string;
  linkSecondary?: string;
  ctaPrimaryCls: string;
  ctaSecondaryCls?: string;
}

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const { t } = useLanguage();

  const slides: Slide[] = useMemo(() => [
    {
      id: 0, image: heroTemple,
      overlay: "bg-gradient-to-r from-maroon-deep/85 via-maroon/60 to-maroon-deep/30",
      pill: { text: t("hero_s1_pill"), cls: "bg-gold/90 text-maroon" },
      title: t("hero_s1_title"),
      titleAccent: t("hero_s1_accent"),
      titleCls: "text-cream",
      subtitle: t("hero_s1_sub"),
      subtitleCls: "text-cream/85",
      primaryCta: t("hero_s1_cta1") + "  →", linkPrimary: "/puja",
      secondaryCta: t("hero_s1_cta2"), linkSecondary: "/temples",
      ctaPrimaryCls: "bg-saffron text-white hover:bg-gold hover:text-maroon",
      ctaSecondaryCls: "border border-gold text-gold hover:bg-gold hover:text-maroon",

    },
    {
      id: 1, image: heroChadhava,
      overlay: "bg-gradient-to-r from-maroon-deep/90 via-maroon/70 to-transparent",
      pill: { text: t("hero_s2_pill"), cls: "bg-gold/90 text-maroon" },
      title: t("hero_s2_title") + " " + t("hero_s2_accent"),
      titleAccent: t("hero_s2_rest"),
      titleCls: "text-gold",
      subtitle: t("hero_s2_sub"),
      subtitleCls: "text-cream/85",
      primaryCta: t("hero_s2_cta1") + "  →", linkPrimary: "/chadhava",
      secondaryCta: t("hero_s2_cta2"), linkSecondary: "/temples",
      ctaPrimaryCls: "bg-gold text-maroon hover:bg-gold-light",
      ctaSecondaryCls: "border border-gold text-gold hover:bg-gold hover:text-maroon",
    },
    {
      id: 2, image: heroPandit,
      overlay: "bg-gradient-to-r from-ivory/95 via-cream/80 to-cream/30",
      pill: { text: t("hero_s3_pill"), cls: "bg-maroon text-gold" },
      title: t("hero_s3_title") + " " + t("hero_s3_accent"),
      titleAccent: t("hero_s3_rest"),
      titleCls: "text-maroon",
      subtitle: t("hero_s3_sub"),
      subtitleCls: "text-brown/80",
      primaryCta: t("hero_s3_cta1") + "  →", linkPrimary: "/astrology",
      secondaryCta: t("hero_s3_cta2"), linkSecondary: "/astrology",
      ctaPrimaryCls: "bg-saffron text-white hover:bg-maroon",
      ctaSecondaryCls: "border border-maroon/40 text-maroon hover:bg-maroon hover:text-gold",
    },
    {
      id: 3, image: heroDarshan,
      overlay: "bg-gradient-to-r from-maroon-deep/90 via-maroon-deep/70 to-maroon-deep/30",
      pill: { text: "🔴  LIVE  —  Kashi Vishwanath Aarti", cls: "bg-saffron text-white animate-pulse" },
      title: t("hero_s4_title") + " " + t("hero_s4_accent"),
      titleAccent: t("hero_s4_rest"),
      titleCls: "text-gold",
      subtitle: t("hero_s4_sub"),
      subtitleCls: "text-cream/85",
      primaryCta: t("hero_s4_cta1") + "  →", linkPrimary: "/temples",
      secondaryCta: t("hero_s4_cta2"), linkSecondary: "/temples",
      ctaPrimaryCls: "bg-saffron text-white hover:bg-gold hover:text-maroon",
      ctaSecondaryCls: "border border-gold text-gold hover:bg-gold hover:text-maroon",
    },
  ], [t]);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      5500,
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const prev = () =>
    setCurrent((c) => (c - 1 + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden" aria-label="Hero carousel">
      <div className="relative h-[85dvh] min-h-[500px] max-h-[850px] xs:min-h-[520px] sm:h-[600px] sm:min-h-0 sm:max-h-none md:h-[680px]">
        {slides.map((s, idx) => {
          const active = idx === current;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                active ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              aria-hidden={!active}
            >
              {/* Background image with slow Ken-Burns zoom — GPU composited */}
              <div
                className={`absolute inset-0 bg-cover bg-center will-change-transform transition-transform duration-[8000ms] ease-out ${
                  active ? "scale-110" : "scale-100"
                }`}
                style={{ backgroundImage: `url(${s.image})` }}
              />
              {/* Color overlay for legibility */}
              <div className={`absolute inset-0 ${s.overlay}`} />
              {/* Mandala watermark */}
              <Mandala
                className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 md:-right-24 md:-top-24 md:h-[28rem] md:w-[28rem] ${
                  idx === 2 ? "text-maroon/15" : "text-gold/25"
                }`}
              />
              <Mandala
                className={`pointer-events-none absolute -left-16 -bottom-16 h-36 w-36 md:-left-32 md:-bottom-32 md:h-[24rem] md:w-[24rem] ${
                  idx === 2 ? "text-maroon/10" : "text-gold/15"
                }`}
              />

              {/* Ornate gold border frame */}
              <div className="pointer-events-none absolute inset-3 sm:inset-4 md:inset-6 border border-gold/40 rounded-[2px]" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-5 sm:inset-6 md:inset-8 border border-gold/20" aria-hidden="true" />
              <CornerOrnament
                className={`pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4 h-10 w-10 sm:h-12 sm:w-12 ${
                  idx === 2 ? "text-maroon/60" : "text-gold/80"
                }`}
              />
              <CornerOrnament
                className={`pointer-events-none absolute right-3 top-3 sm:right-4 sm:top-4 h-10 w-10 sm:h-12 sm:w-12 -scale-x-100 ${
                  idx === 2 ? "text-maroon/60" : "text-gold/80"
                }`}
              />
              <CornerOrnament
                className={`pointer-events-none absolute left-3 bottom-3 sm:left-4 sm:bottom-4 h-10 w-10 sm:h-12 sm:w-12 -scale-y-100 ${
                  idx === 2 ? "text-maroon/60" : "text-gold/80"
                }`}
              />
              <CornerOrnament
                className={`pointer-events-none absolute right-3 bottom-3 sm:right-4 sm:bottom-4 h-10 w-10 sm:h-12 sm:w-12 -scale-100 ${
                  idx === 2 ? "text-maroon/60" : "text-gold/80"
                }`}
              />

              {/* Floating golden particles — reduced count for performance */}
              <FloatingParticles count={4} />

              {/* Content */}
              <div className="container relative z-10 flex h-full flex-col justify-center pb-16 pt-20 sm:grid sm:items-center sm:py-10 md:grid-cols-12 md:gap-10">
                <div className="space-y-3 sm:space-y-5 md:col-span-8 lg:col-span-7">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold tracking-wide shadow-md ${s.pill.cls}`}
                  >
                    {s.pill.text}
                  </span>

                  {/* Sanskrit-style accent line above title */}
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 sm:w-10 bg-gold" />
                    <Sparkles
                      size={14}
                      className={idx === 2 ? "text-saffron" : "text-gold"}
                    />
                    <span className="font-serif italic text-xs sm:text-sm text-gold tracking-wider">
                      ॐ  Narayan Kripa
                    </span>
                  </div>

                  <h1
                    className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)] ${s.titleCls}`}
                  >
                    {s.title}{" "}
                    <span className="block mt-1 text-gold-shimmer">
                      {s.titleAccent}
                    </span>
                  </h1>

                  <p
                    className={`max-w-xl font-serif italic text-base sm:text-lg md:text-xl leading-relaxed ${s.subtitleCls}`}
                  >
                    {s.subtitle}
                  </p>

                  <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-3 pt-1 sm:pt-2">
                    <Link
                      to={s.linkPrimary}
                      className={`inline-flex items-center justify-center rounded-full min-h-[48px] px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-semibold shadow-sacred transition-all hover:-translate-y-0.5 text-center ${s.ctaPrimaryCls}`}
                    >
                      {s.primaryCta}
                    </Link>
                    {s.secondaryCta && s.linkSecondary && (
                      <Link
                        to={s.linkSecondary}
                        className={`inline-flex items-center justify-center rounded-full min-h-[48px] px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-semibold backdrop-blur-sm bg-white/5 transition-all hover:-translate-y-0.5 text-center ${s.ctaSecondaryCls}`}
                      >
                        {s.secondaryCta}
                      </Link>
                    )}
                  </div>

                  {idx === 0 && (
                    <div className="flex items-center gap-3 pt-3 sm:pt-4">
                      <div className="flex -space-x-2">
                        {["A", "S", "R", "P", "M"].map((n, i) => (
                          <div
                            key={i}
                            className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border-2 border-gold bg-saffron text-xs font-bold text-white shadow-md"
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill="hsl(var(--gold))"
                              stroke="hsl(var(--gold))"
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <p className="text-[11px] sm:text-xs text-cream/85">
                          {t("hero_s1_trust")}
                        </p>
                      </div>
                    </div>
                  )}

                  {idx === 1 && <MuhuratCountdown />}

                  {idx === 2 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[
                        `📿 ${t("hero_s3_tag1")}`,
                        `💑 ${t("hero_s3_tag2")}`,
                        `🏠 ${t("hero_s3_tag3")}`,
                        `💊 ${t("hero_s3_tag4")}`,
                      ].map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-maroon/30 bg-ivory/80 backdrop-blur px-3 py-1.5 text-[11px] xs:text-xs font-medium text-maroon shadow-sm"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {idx === 3 && (
                    <div className="flex items-center gap-3 pt-2">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                      </span>
                      <span className="text-sm text-cream/90 font-medium">
                        12,438 devotees watching now
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls — increased touch target */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-4 top-1/2 z-20 grid h-10 w-10 sm:h-12 sm:w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/60 bg-maroon-deep/40 text-gold backdrop-blur-md hover:bg-saffron hover:text-white transition-all hover:scale-110"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 sm:right-4 top-1/2 z-20 grid h-10 w-10 sm:h-12 sm:w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/60 bg-maroon-deep/40 text-gold backdrop-blur-md hover:bg-saffron hover:text-white transition-all hover:scale-110"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:gap-2.5 rounded-full border border-gold/40 bg-maroon-deep/40 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current ? "true" : undefined}
            className={`h-2.5 rounded-full transition-all ${
              i === current
                ? "w-10 bg-gradient-to-r from-saffron to-gold"
                : "w-2.5 bg-gold/40 hover:bg-gold"
            }`}
          />
        ))}
      </div>

      {/* Decorative gold band underneath */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent" />
    </section>
  );
};

const MuhuratCountdown = () => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const target = new Date();
      target.setHours(target.getHours() + 5);
      target.setMinutes(30, 0, 0);
      const diff = Math.max(0, target.getTime() - Date.now());
      setTime({
        h: Math.floor(diff / 3.6e6),
        m: Math.floor((diff % 3.6e6) / 6e4),
        s: Math.floor((diff % 6e4) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 rounded-2xl border border-gold/50 bg-maroon-deep/60 backdrop-blur px-3 py-2 sm:gap-4 sm:px-5 sm:py-3 shadow-gold-glow">
      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gold/80">
        Next Muhurat
      </span>
      <div className="flex items-center gap-1 sm:gap-2">
        {(["h", "m", "s"] as const).map((k, i) => (
          <div key={k} className="flex items-center gap-1 sm:gap-1.5">
            <div className="text-center">
              <div className="font-display text-base sm:text-lg md:text-2xl text-gold leading-none">
                {String(time[k]).padStart(2, "0")}
              </div>
              <div className="mt-0.5 text-[8px] sm:text-[9px] uppercase tracking-wider text-cream/60">
                {k === "h" ? "Hrs" : k === "m" ? "Min" : "Sec"}
              </div>
            </div>
            {i < 2 && <span className="text-gold/60">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
