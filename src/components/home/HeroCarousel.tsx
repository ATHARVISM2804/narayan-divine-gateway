import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star, CheckCircle2, Radio } from "lucide-react";

interface Slide {
  id: number;
  bgClass: string;
  pill?: { text: string; cls: string };
  title: string;
  titleCls: string;
  subtitle: string;
  subtitleCls: string;
  primaryCta: string;
  secondaryCta?: string;
  ctaPrimaryCls: string;
  ctaSecondaryCls?: string;
  rightVisual: "phone" | "temple" | "pandit" | "video";
  extras?: React.ReactNode;
}

const slides: Slide[] = [
  {
    id: 0,
    bgClass: "bg-cream",
    pill: { text: "🪔 Trusted by 2 Lakh+ Devotees", cls: "bg-gold/30 text-maroon" },
    title: "Bringing Sacred Traditions to Your Doorstep",
    titleCls: "text-maroon",
    subtitle: "Connect with 50+ revered temples. Book pujas & chadhava from home, performed by expert pandits.",
    subtitleCls: "text-brown/80",
    primaryCta: "Book a Puja →",
    secondaryCta: "Explore Temples",
    ctaPrimaryCls: "bg-saffron text-white hover:bg-maroon",
    ctaSecondaryCls: "border border-gold text-saffron hover:bg-saffron hover:text-white",
    rightVisual: "phone",
  },
  {
    id: 1,
    bgClass: "bg-maroon",
    pill: { text: "🌺 Sacred Offerings", cls: "bg-gold/30 text-cream" },
    title: "Offer Chadhava with Faith, Receive Blessings with Grace",
    titleCls: "text-gold",
    subtitle: "Send your offerings to revered temples — flowers, prasad & seva delivered with devotion.",
    subtitleCls: "text-cream/80",
    primaryCta: "Offer Chadhava Now →",
    ctaPrimaryCls: "bg-gold text-maroon hover:bg-gold-light",
    rightVisual: "temple",
  },
  {
    id: 2,
    bgClass: "bg-ivory",
    pill: { text: "📿 Vedic Wisdom", cls: "bg-gold/30 text-maroon" },
    title: "Consult Expert Pandits Anytime, Anywhere",
    titleCls: "text-maroon",
    subtitle: "Get personalized puja guidance, kundali reading & Vedic remedies from certified pandits.",
    subtitleCls: "text-brown/80",
    primaryCta: "Consult a Pandit →",
    ctaPrimaryCls: "bg-saffron text-white hover:bg-maroon",
    rightVisual: "pandit",
  },
  {
    id: 3,
    bgClass: "bg-brown",
    pill: { text: "🔴 LIVE NOW — Kashi Vishwanath Aarti", cls: "bg-saffron text-white" },
    title: "Daily Darshan from India's Most Sacred Temples",
    titleCls: "text-gold",
    subtitle: "Watch live and recorded aarti from Kashi, Mathura, Tirupati & more.",
    subtitleCls: "text-cream/80",
    primaryCta: "Watch Live Darshan →",
    ctaPrimaryCls: "bg-saffron text-white hover:bg-gold",
    rightVisual: "video",
  },
];

const Mandala = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" strokeWidth="0.5">
    <circle cx="100" cy="100" r="90" />
    <circle cx="100" cy="100" r="70" />
    <circle cx="100" cy="100" r="50" />
    <circle cx="100" cy="100" r="30" />
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1="100" y1="10" x2="100" y2="190" transform={`rotate(${i * 15} 100 100)`} />
    ))}
    {Array.from({ length: 8 }).map((_, i) => (
      <path key={i} d="M100 30 C 90 60, 90 80, 100 100 C 110 80, 110 60, 100 30 Z" transform={`rotate(${i * 45} 100 100)`} />
    ))}
  </svg>
);

const PhoneFrame = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <div className={`relative mx-auto w-64 rounded-[2.5rem] border-[6px] border-maroon p-2 shadow-2xl ${dark ? "bg-maroon-deep" : "bg-ivory"}`}>
    <div className="absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-maroon-deep" />
    <div className="overflow-hidden rounded-[2rem]">{children}</div>
  </div>
);

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[640px] md:h-[600px]">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-all duration-700 ${s.bgClass} ${
              idx === current ? "opacity-100 translate-x-0" : idx < current ? "opacity-0 -translate-x-10" : "opacity-0 translate-x-10"
            }`}
            aria-hidden={idx !== current}
          >
            {/* Mandala watermark */}
            <Mandala className={`pointer-events-none absolute -right-20 -top-20 h-96 w-96 ${idx === 1 || idx === 3 ? "text-gold/10" : "text-gold/15"}`} />
            {idx === 3 && (
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            )}

            <div className="container relative grid h-full items-center gap-10 py-10 md:grid-cols-12">
              <div className="md:col-span-7 space-y-5">
                {s.pill && (
                  <span className={`inline-block rounded-full px-4 py-1.5 text-xs font-medium ${s.pill.cls}`}>{s.pill.text}</span>
                )}
                <h1 className={`font-display text-4xl md:text-5xl lg:text-6xl leading-tight ${s.titleCls}`}>{s.title}</h1>
                <p className={`max-w-xl text-base md:text-lg ${s.subtitleCls}`}>{s.subtitle}</p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button className={`rounded-full px-6 py-3 font-semibold shadow-md transition-all ${s.ctaPrimaryCls}`}>
                    {s.primaryCta}
                  </button>
                  {s.secondaryCta && (
                    <button className={`rounded-full px-6 py-3 font-semibold transition-all ${s.ctaSecondaryCls}`}>
                      {s.secondaryCta}
                    </button>
                  )}
                </div>

                {idx === 0 && (
                  <div className="flex items-center gap-3 pt-4">
                    <div className="flex -space-x-2">
                      {["A", "S", "R", "P"].map((n, i) => (
                        <div key={i} className="grid h-8 w-8 place-items-center rounded-full border-2 border-cream bg-saffron text-xs font-semibold text-white">
                          {n}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-brown/70">2 Lakh+ Bhakts trust Narayan Kripa</span>
                  </div>
                )}
                {idx === 2 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["📿 Kundali", "💑 Marriage Match", "🏠 Vastu", "💊 Health Remedies"].map((c) => (
                      <span key={c} className="rounded-full border border-gold bg-ivory px-3 py-1 text-xs text-maroon">{c}</span>
                    ))}
                  </div>
                )}
                {idx === 1 && <MuhuratCountdown />}
              </div>

              <div className="md:col-span-5 relative">
                {idx === 0 && (
                  <div className="relative">
                    <PhoneFrame>
                      <div className="h-32 bg-gradient-to-br from-saffron to-maroon p-3 text-white">
                        <p className="text-[10px] opacity-80">Featured Temple</p>
                        <p className="font-display text-base">Kashi Vishwanath</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-3">
                        {["Puja", "Chadhava", "Pandit", "Darshan"].map((s) => (
                          <div key={s} className="rounded-lg border border-gold/40 bg-cream p-2 text-center text-xs text-maroon">
                            {s}
                          </div>
                        ))}
                      </div>
                    </PhoneFrame>
                    <div className="absolute -right-2 top-8 flex items-center gap-2 rounded-xl bg-white p-3 shadow-lg animate-float">
                      <CheckCircle2 size={18} className="text-green-600" />
                      <div>
                        <p className="text-xs font-semibold text-maroon">Puja Booked</p>
                        <p className="text-[10px] text-brown/60">Confirmed ✓</p>
                      </div>
                    </div>
                    <div className="absolute -left-4 bottom-8 flex items-center gap-2 rounded-xl bg-white p-3 shadow-lg animate-float [animation-delay:1s]">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                      </span>
                      <p className="text-xs font-semibold text-maroon">Live Darshan</p>
                    </div>
                    {/* Floating petals */}
                    <span className="absolute right-10 -top-2 text-2xl text-gold animate-float">❁</span>
                    <span className="absolute left-2 top-1/3 text-xl text-gold/70 animate-float [animation-delay:1.5s]">❁</span>
                  </div>
                )}
                {idx === 1 && (
                  <div className="relative mx-auto h-72 w-full max-w-sm rounded-3xl border-2 border-gold bg-gradient-to-b from-maroon-deep to-maroon shadow-[0_0_60px_hsl(var(--gold)/0.3)]">
                    <div className="absolute inset-0 grid place-items-center">
                      <svg viewBox="0 0 100 100" className="h-48 w-48 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 90 L20 50 L35 35 L35 25 L40 20 L45 25 L45 35 L50 30 L55 35 L55 25 L60 20 L65 25 L65 35 L80 50 L80 90 Z" />
                        <rect x="42" y="60" width="16" height="30" />
                        <circle cx="50" cy="20" r="2" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                )}
                {idx === 2 && (
                  <div className="relative">
                    <div className="mx-auto h-72 w-64 rounded-3xl bg-gradient-to-br from-saffron/20 to-gold/20 border border-gold grid place-items-center">
                      <div className="text-center">
                        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-saffron text-5xl text-white">🧙‍♂️</div>
                        <p className="mt-3 font-display text-maroon">Pandit Sharma</p>
                        <p className="text-xs text-brown/60">Vedic Acharya • 25 yrs</p>
                      </div>
                    </div>
                    <div className="absolute -right-3 top-6 flex items-center gap-1 rounded-xl bg-white p-3 shadow-lg animate-float">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="hsl(var(--gold))" stroke="hsl(var(--gold))" />)}
                      <span className="ml-1 text-xs font-semibold text-maroon">4.9</span>
                    </div>
                  </div>
                )}
                {idx === 3 && (
                  <div className="relative">
                    <div className="mx-auto aspect-video w-full max-w-sm rounded-2xl border-2 border-gold bg-gradient-to-br from-maroon to-maroon-deep p-1">
                      <div className="grid h-full place-items-center rounded-xl bg-gradient-to-br from-orange-900/40 to-amber-900/40">
                        <button className="grid h-16 w-16 place-items-center rounded-full bg-saffron text-white shadow-2xl">
                          ▶
                        </button>
                      </div>
                    </div>
                    <div className="absolute -top-2 left-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white animate-pulse">
                      <Radio size={12} /> LIVE
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button onClick={prev} aria-label="Previous" className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-gold bg-cream/80 text-saffron backdrop-blur hover:bg-saffron hover:text-white transition-colors">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} aria-label="Next" className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-gold bg-cream/80 text-saffron backdrop-blur hover:bg-saffron hover:text-white transition-colors">
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${i === current ? "w-8 bg-saffron" : "w-2.5 border border-gold"}`}
          />
        ))}
      </div>
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
    <div className="inline-flex items-center gap-3 rounded-xl border border-gold/40 bg-maroon-deep/40 px-4 py-2">
      <span className="text-xs text-cream/80">Next Muhurat in</span>
      {(["h", "m", "s"] as const).map((k) => (
        <span key={k} className="font-display text-xl text-gold">
          {String(time[k]).padStart(2, "0")}
          <span className="ml-0.5 text-[10px] text-cream/60">{k}</span>
        </span>
      ))}
    </div>
  );
};

export default HeroCarousel;
