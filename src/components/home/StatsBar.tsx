import { useEffect, useRef, useState } from "react";

const stats = [
  { icon: "🛕", value: 50, suffix: "+", label: "Temple Partners" },
  { icon: "🙏", value: 200000, suffix: "+", label: "Devotees Served" },
  { icon: "📿", value: 1000, suffix: "+", label: "Pujas Conducted" },
  { icon: "⭐", value: 4.8, suffix: "", label: "Average Rating", decimal: true },
  { icon: "🌍", value: 20, suffix: "+", label: "Cities Covered" },
];

const formatNum = (n: number, decimal = false) =>
  decimal ? n.toFixed(1) : n >= 1000 ? n.toLocaleString("en-IN") : String(n);

const Counter = ({ to, decimal = false }: { to: number; decimal?: boolean }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const dur = 1500;
          const step = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            setVal(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{formatNum(decimal ? val : Math.round(val), decimal)}</span>;
};

const StatsBar = () => (
  <section className="relative border-y-2 border-gold/40 bg-gradient-to-b from-ivory via-cream to-ivory">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-saffron to-transparent" />
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-saffron to-transparent" />
    <div className="container grid grid-cols-2 gap-y-8 py-10 md:grid-cols-5 md:gap-0">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col items-center text-center md:px-4 ${
            i !== 0 ? "md:border-l md:border-gold/40" : ""
          }`}
        >
          <span className="text-3xl mb-2 flicker">{s.icon}</span>
          <span className="font-display text-3xl text-saffron md:text-4xl drop-shadow-sm">
            <Counter to={s.value} decimal={s.decimal} />
            {s.suffix}
          </span>
          <span className="mt-1.5 text-xs font-medium uppercase tracking-wider text-brown/70">{s.label}</span>
        </div>
      ))}
    </div>
  </section>
);

export default StatsBar;
