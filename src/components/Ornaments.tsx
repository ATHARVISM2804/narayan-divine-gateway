/* Shared decorative SVG components used across HeroCarousel and PageHero.
   Extracted to avoid duplication and ensure consistency. */

/** Ornate corner bracket decoration */
export const CornerOrnament = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 80 80"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M2 30 L2 2 L30 2" />
    <path d="M10 20 L10 10 L20 10" />
    <circle cx="14" cy="14" r="2" fill="currentColor" />
    <path d="M2 40 Q 14 28 26 40" opacity="0.6" />
  </svg>
);

/** Mandala watermark decoration */
export const Mandala = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="0.4"
    aria-hidden="true"
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

/** Floating golden particles — decorative animation */
export const FloatingParticles = ({ count = 6 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, k) => (
      <span
        key={k}
        className="pointer-events-none absolute block h-1.5 w-1.5 rounded-full bg-gold/70 shadow-[0_0_8px_hsl(var(--gold))]"
        aria-hidden="true"
        style={{
          left: `${15 + k * Math.floor(80 / count)}%`,
          bottom: "-10px",
          animation: `drift ${8 + (k % 4) * 2}s ease-in ${k * 0.7}s infinite`,
        }}
      />
    ))}
  </>
);
