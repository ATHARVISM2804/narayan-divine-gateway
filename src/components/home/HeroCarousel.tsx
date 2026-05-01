import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Radio, Sparkles } from "lucide-react";
import heroTemple from "@/assets/hero-temple.jpg";
import heroChadhava from "@/assets/hero-chadhava.jpg";
import heroPandit from "@/assets/hero-pandit.jpg";
import heroDarshan from "@/assets/hero-darshan.jpg";

interface Slide {
  id: number;
  image: string;
  // overlay gradient over the image to keep text legible
  overlay: string;
  pill: { text: string; cls: string };
  title: string;
  titleAccent: string; // emphasised word
  titleCls: string;
  subtitle: string;
  subtitleCls: string;
  primaryCta: string;
  secondaryCta?: string;
  ctaPrimaryCls: string;
  ctaSecondaryCls?: string;
  badge?: React.ReactNode;
}

const slides: Slide[] = [
  {
    id: 0,
    image: heroTemple,
    overlay:
      "bg-gradient-to-r from-maroon-deep/85 via-maroon/60 to-maroon-deep/30",
    pill: {
      text: "🪔  Trusted by 2 Lakh+ Devotees",
      cls: "bg-gold/90 text-maroon",
    },
    title: "Bringing Sacred Traditions",
    titleAccent: "to Your Doorstep",
    titleCls: "text-cream",
    subtitle:
      "Connect with 50+ revered temples. Book pujas & chadhava from home, performed by expert pandits with full Vedic procedure.",
    subtitleCls: "text-cream/85",
    primaryCta: "Book a Puja  →",
    secondaryCta: "Explore Temples",
    ctaPrimaryCls: "bg-saffron text-white hover:bg-gold hover:text-maroon",
    ctaSecondaryCls:
      "border border-gold text-gold hover:bg-gold hover:text-maroon",
  },
  {
    id: 1,
    image: heroChadhava,
    overlay:
      "bg-gradient-to-r from-maroon-deep/90 via-maroon/70 to-transparent",
    pill: { text: "🌺  Sacred Offerings", cls: "bg-gold/90 text-maroon" },
    title: "Offer Chadhava with Faith,",
    titleAccent: "Receive Blessings with Grace",
    titleCls: "text-gold",
    subtitle:
      "Send your offerings to revered temples — flowers, prasad, vastra & seva delivered with devotion at the auspicious muhurat.",
    subtitleCls: "text-cream/85",
    primaryCta: "Offer Chadhava Now  →",
    secondaryCta: "View Temples",
    ctaPrimaryCls: "bg-gold text-maroon hover:bg-gold-light",
    ctaSecondaryCls:
      "border border-gold text-gold hover:bg-gold hover:text-maroon",
  },
  {
    id: 2,
    image: heroPandit,
    overlay:
      "bg-gradient-to-r from-ivory/95 via-cream/80 to-cream/30",
    pill: { text: "📿  Vedic Wisdom", cls: "bg-maroon text-gold" },
    title: "Consult Expert Pandits",
    titleAccent: "Anytime, Anywhere",
    titleCls: "text-maroon",
    subtitle:
      "Get personalised pooja guidance according to your kundali, and let our expert pandits suggest the most auspicious puja for you.",
    subtitleCls: "text-brown/80",
    primaryCta: "Consult a Pandit  →",
    secondaryCta: "View Services",
    ctaPrimaryCls: "bg-saffron text-white hover:bg-maroon",
    ctaSecondaryCls:
      "border border-maroon/40 text-maroon hover:bg-maroon hover:text-gold",
  },
  {
    id: 3,
    image: heroDarshan,
    overlay:
      "bg-gradient-to-r from-maroon-deep/90 via-maroon-deep/70 to-maroon-deep/30",
    pill: {
      text: "🔴  LIVE  —  Kashi Vishwanath Aarti",
      cls: "bg-saffron text-white animate-pulse",
    },
    title: "Daily Darshan from India's",
    titleAccent: "Most Sacred Temples",
    titleCls: "text-gold",
    subtitle:
      "Watch live and recorded aarti from Kashi, Mathura, Tirupati, Vaishno Devi & more — feel the divine presence from anywhere.",
    subtitleCls: "text-cream/85",
    primaryCta: "Watch Live Darshan  →",
    secondaryCta: "Schedule",
    ctaPrimaryCls: "bg-saffron text-white hover:bg-gold hover:text-maroon",
    ctaSecondaryCls:
      "border border-gold text-gold hover:bg-gold hover:text-maroon",
  },
];

/* Decorative SVG corner brackets — ornate frame */
const CornerOrnament = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 80 80"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
  >
    <path d="M2 30 L2 2 L30 2" />
    <path d="M10 20 L10 10 L20 10" />
    <circle cx="14" cy="14" r="2" fill="currentColor" />
    <path d="M2 40 Q 14 28 26 40" opacity="0.6" />
  </svg>
);

const Mandala = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="0.4"
  >
    <circle cx="100" cy="100" r="95" />
    <circle cx="100" cy="100" r="80" />
    <circle cx="100" cy="100" r="60" />
    <circle cx="100" cy="100" r="40" />
    <circle cx="100" cy="100" r="20" />
    {Array.from({ length: 16 }).map((_, i) => (
      <line
        key={i}
        x1="100"
        y1="5"
        x2="100"
        y2="195"
        transform={`rotate(${i * 11.25} 100 100)`}
      />
    ))}
    {Array.from({ length: 12 }).map((_, i) => (
      <path
        key={`p${i}`}
        d="M100 20 C 88 55, 88 80, 100 100 C 112 80, 112 55, 100 20 Z"
        transform={`rotate(${i * 30} 100 100)`}
      />
    ))}
  </svg>
);

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      5500,
    );
    return () => clearInterval(t);
  }, []);

  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const prev = () =>
    setCurrent((c) => (c - 1 + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[100dvh] min-h-[620px] max-h-[850px] sm:h-[600px] sm:min-h-0 sm:max-h-none md:h-[680px]">
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
              {/* Background image with slow Ken-Burns zoom */}
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out ${
                  active ? "scale-110" : "scale-100"
                }`}
                style={{ backgroundImage: `url(${s.image})` }}
              />
              {/* Color overlay for legibility */}
              <div className={`absolute inset-0 ${s.overlay}`} />
              {/* Mandala watermark */}
              <Mandala
                className={`pointer-events-none absolute -right-16 -top-16 h-64 w-64 md:-right-24 md:-top-24 md:h-[28rem] md:w-[28rem] ${
                  idx === 2 ? "text-maroon/15" : "text-gold/25"
                }`}
              />
              <Mandala
                className={`pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 md:-left-32 md:-bottom-32 md:h-[24rem] md:w-[24rem] ${
                  idx === 2 ? "text-maroon/10" : "text-gold/15"
                }`}
              />

              {/* Ornate gold border frame */}
              <div className="pointer-events-none absolute inset-4 md:inset-6 border border-gold/40 rounded-[2px]" />
              <div className="pointer-events-none absolute inset-6 md:inset-8 border border-gold/20" />
              <CornerOrnament
                className={`pointer-events-none absolute left-4 top-4 h-12 w-12 ${
                  idx === 2 ? "text-maroon/60" : "text-gold/80"
                }`}
              />
              <CornerOrnament
                className={`pointer-events-none absolute right-4 top-4 h-12 w-12 -scale-x-100 ${
                  idx === 2 ? "text-maroon/60" : "text-gold/80"
                }`}
              />
              <CornerOrnament
                className={`pointer-events-none absolute left-4 bottom-4 h-12 w-12 -scale-y-100 ${
                  idx === 2 ? "text-maroon/60" : "text-gold/80"
                }`}
              />
              <CornerOrnament
                className={`pointer-events-none absolute right-4 bottom-4 h-12 w-12 -scale-100 ${
                  idx === 2 ? "text-maroon/60" : "text-gold/80"
                }`}
              />

              {/* Floating golden particles */}
              {Array.from({ length: 8 }).map((_, k) => (
                <span
                  key={k}
                  className="pointer-events-none absolute block h-1.5 w-1.5 rounded-full bg-gold/70 shadow-[0_0_8px_hsl(var(--gold))]"
                  style={{
                    left: `${10 + k * 11}%`,
                    bottom: "-10px",
                    animation: `drift ${8 + (k % 4) * 2}s ease-in ${k * 0.7}s infinite`,
                  }}
                />
              ))}

              {/* Content */}
              <div className="container relative z-10 flex h-full flex-col justify-center pb-20 pt-24 sm:grid sm:items-center sm:py-10 md:grid-cols-12 md:gap-10">
                <div className="space-y-4 sm:space-y-6 md:col-span-8 lg:col-span-7 px-4 sm:px-0">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold tracking-wide shadow-md ${s.pill.cls}`}
                  >
                    {s.pill.text}
                  </span>

                  {/* Sanskrit-style accent line above title */}
                  <div className="flex items-center gap-3">
                    <span className="h-px w-10 bg-gold" />
                    <Sparkles
                      size={14}
                      className={idx === 2 ? "text-saffron" : "text-gold"}
                    />
                    <span className="font-serif italic text-sm text-gold tracking-wider">
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

                  <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                    <button
                      className={`rounded-full px-4 py-2 sm:px-7 sm:py-3.5 text-sm sm:text-base font-semibold shadow-sacred transition-all hover:-translate-y-0.5 ${s.ctaPrimaryCls}`}
                    >
                      {s.primaryCta}
                    </button>
                    {s.secondaryCta && (
                      <button
                        className={`rounded-full px-4 py-2 sm:px-7 sm:py-3.5 text-sm sm:text-base font-semibold backdrop-blur-sm bg-white/5 transition-all hover:-translate-y-0.5 ${s.ctaSecondaryCls}`}
                      >
                        {s.secondaryCta}
                      </button>
                    )}
                  </div>

                  {idx === 0 && (
                    <div className="flex items-center gap-3 pt-4">
                      <div className="flex -space-x-2">
                        {["A", "S", "R", "P", "M"].map((n, i) => (
                          <div
                            key={i}
                            className="grid h-9 w-9 place-items-center rounded-full border-2 border-gold bg-saffron text-xs font-bold text-white shadow-md"
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
                              size={13}
                              fill="hsl(var(--gold))"
                              stroke="hsl(var(--gold))"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-cream/85">
                          2 Lakh+ Bhakts trust Narayan Kripa
                        </p>
                      </div>
                    </div>
                  )}

                  {idx === 1 && <MuhuratCountdown />}

                  {idx === 2 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[
                        "📿 Kundali",
                        "💑 Marriage Match",
                        "🏠 Vastu",
                        "💊 Health Remedies",
                      ].map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-maroon/30 bg-ivory/80 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-maroon shadow-sm"
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

      {/* Controls */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-2 sm:left-4 top-1/2 z-20 grid h-8 w-8 sm:h-12 sm:w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/60 bg-maroon-deep/40 text-gold backdrop-blur-md hover:bg-saffron hover:text-white transition-all hover:scale-110"
      >
        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-2 sm:right-4 top-1/2 z-20 grid h-8 w-8 sm:h-12 sm:w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/60 bg-maroon-deep/40 text-gold backdrop-blur-md hover:bg-saffron hover:text-white transition-all hover:scale-110"
      >
        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:gap-2 rounded-full border border-gold/40 bg-maroon-deep/40 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === current
                ? "w-10 bg-gradient-to-r from-saffron to-gold"
                : "w-2 bg-gold/40 hover:bg-gold"
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
    <div className="inline-flex items-center gap-3 rounded-2xl border border-gold/50 bg-maroon-deep/60 backdrop-blur px-4 py-2.5 sm:gap-4 sm:px-5 sm:py-3 shadow-gold-glow">
      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gold/80">
        Next Muhurat
      </span>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {(["h", "m", "s"] as const).map((k, i) => (
          <div key={k} className="flex items-center gap-1 sm:gap-1.5">
            <div className="text-center">
              <div className="font-display text-lg sm:text-xl md:text-2xl text-gold leading-none">
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
