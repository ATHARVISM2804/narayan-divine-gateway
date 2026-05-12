import { useEffect, useMemo, useState } from "react";
import { Star, Quote } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/context/LanguageContext";

const Testimonials = () => {
  const { t: tr } = useLanguage();

  const items = useMemo(() => [
    { name: tr("test_1_name"), city: tr("test_1_city"), initials: tr("test_1_initials"), quote: tr("test_1_quote"), rating: 5 },
    { name: tr("test_2_name"), city: tr("test_2_city"), initials: tr("test_2_initials"), quote: tr("test_2_quote"), rating: 5 },
    { name: tr("test_3_name"), city: tr("test_3_city"), initials: tr("test_3_initials"), quote: tr("test_3_quote"), rating: 5 },
  ], [tr]);

  const mini = useMemo(() => [
    { name: tr("test_mini_1_name"), city: tr("test_mini_1_city"), quote: tr("test_mini_1_quote") },
    { name: tr("test_mini_2_name"), city: tr("test_mini_2_city"), quote: tr("test_mini_2_quote") },
    { name: tr("test_mini_3_name"), city: tr("test_mini_3_city"), quote: tr("test_mini_3_quote") },
  ], [tr]);

  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((c) => (c + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);
  const curr = items[i];

  return (
    <section className="relative overflow-hidden bg-twilight py-20 text-cream">
      {/* Mandala background watermarks */}
      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -left-24 top-10 h-[28rem] w-[28rem] text-gold/10"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
      >
        <circle cx="100" cy="100" r="95" />
        <circle cx="100" cy="100" r="70" />
        <circle cx="100" cy="100" r="45" />
        {Array.from({ length: 16 }).map((_, k) => (
          <line key={k} x1="100" y1="5" x2="100" y2="195" transform={`rotate(${k * 11.25} 100 100)`} />
        ))}
      </svg>
      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -right-32 bottom-0 h-[32rem] w-[32rem] text-gold/10"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
      >
        <circle cx="100" cy="100" r="95" />
        <circle cx="100" cy="100" r="70" />
        <circle cx="100" cy="100" r="45" />
        {Array.from({ length: 12 }).map((_, k) => (
          <line key={k} x1="100" y1="5" x2="100" y2="195" transform={`rotate(${k * 15} 100 100)`} />
        ))}
      </svg>

      <div className="container relative">
        <SectionHeading
          eyebrow={tr("test_eyebrow")}
          title={tr("test_title")}
          subtitle={tr("test_sub")}
          light
        />

        <div className="relative mx-auto mt-10 max-w-3xl rounded-3xl border border-gold/40 bg-maroon-deep/60 p-8 md:p-14 shadow-gold-glow backdrop-blur">
          {/* Corner ornaments */}
          <Quote className="absolute left-6 top-6 h-10 w-10 text-gold/40" />
          <Quote className="absolute right-6 bottom-6 h-10 w-10 text-gold/40 rotate-180" />

          <blockquote
            key={i}
            className="font-serif text-xl italic text-cream md:text-2xl leading-relaxed animate-fadeIn text-center"
          >
            "{curr.quote}"
          </blockquote>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gold-grad font-display text-lg font-bold text-maroon ring-sacred">
              {curr.initials}
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-gold">{curr.name}</p>
              <p className="text-xs text-cream/60">{curr.city}</p>
            </div>
            <div className="flex">
              {Array.from({ length: curr.rating }).map((_, k) => (
                <Star key={k} size={16} fill="hsl(var(--gold))" stroke="hsl(var(--gold))" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Testimonial ${k + 1}`}
              className={`h-2 rounded-full transition-all ${k === i ? "w-10 bg-gradient-to-r from-saffron to-gold" : "w-2 bg-gold/40"}`}
            />
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {mini.map((m) => (
            <div
              key={m.name}
              className="group relative overflow-hidden rounded-2xl border border-gold/40 bg-ivory/95 p-5 text-brown shadow-soft transition-transform hover:-translate-y-1"
            >
              <Quote size={22} className="text-gold/50 mb-2" />
              <p className="font-serif italic text-sm leading-relaxed">"{m.quote}"</p>
              <div className="mt-4 flex items-center justify-between border-t border-gold/30 pt-3 text-xs">
                <span className="font-semibold text-maroon">
                  {m.name}, <span className="font-normal text-brown/60">{m.city}</span>
                </span>
                <span className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} fill="hsl(var(--gold))" stroke="hsl(var(--gold))" />
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
