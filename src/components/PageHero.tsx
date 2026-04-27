import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

/* Decorative SVG corner brackets */
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

const PageHero = ({
  title,
  subtitle,
  variant = "maroon",
  breadcrumb,
  bgImage,
}: {
  title: string;
  subtitle?: string;
  variant?: "maroon" | "saffron" | "brown" | "ivory";
  breadcrumb?: string;
  bgImage?: string;
}) => {
  if (bgImage) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative h-[420px] md:h-[480px]">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          {/* Color overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-maroon-deep/90 via-maroon/70 to-maroon-deep/40" />

          {/* Mandalas */}
          <Mandala className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] text-gold/25" />
          <Mandala className="pointer-events-none absolute -left-32 -bottom-32 h-[24rem] w-[24rem] text-gold/15" />

          {/* Ornate gold border frame */}
          <div className="pointer-events-none absolute inset-4 md:inset-6 border border-gold/40 rounded-[2px]" />
          <div className="pointer-events-none absolute inset-6 md:inset-8 border border-gold/20" />

          <CornerOrnament className="pointer-events-none absolute left-4 top-4 h-12 w-12 text-gold/80" />
          <CornerOrnament className="pointer-events-none absolute right-4 top-4 h-12 w-12 -scale-x-100 text-gold/80" />
          <CornerOrnament className="pointer-events-none absolute left-4 bottom-4 h-12 w-12 -scale-y-100 text-gold/80" />
          <CornerOrnament className="pointer-events-none absolute right-4 bottom-4 h-12 w-12 -scale-100 text-gold/80" />

          {/* Floating golden particles */}
          {Array.from({ length: 6 }).map((_, k) => (
            <span
              key={k}
              className="pointer-events-none absolute block h-1.5 w-1.5 rounded-full bg-gold/70 shadow-[0_0_8px_hsl(var(--gold))]"
              style={{
                left: `${15 + k * 14}%`,
                bottom: "-10px",
                animation: `drift ${8 + (k % 4) * 2}s ease-in ${k * 0.7}s infinite`,
              }}
            />
          ))}

          {/* Content */}
          <div className="container relative z-10 grid h-full items-center py-10">
            <div className="max-w-3xl space-y-6">
              {breadcrumb && (
                <nav className="mb-6 text-xs md:text-sm font-medium text-gold/80 tracking-wide uppercase">
                  <Link to="/" className="hover:text-gold transition-colors">
                    Home
                  </Link>
                  <span className="mx-3 opacity-60">/</span>
                  <span className="text-cream">{breadcrumb}</span>
                </nav>
              )}

              {/* Sanskrit-style accent line */}
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-gold" />
                <Sparkles size={14} className="text-gold" />
                <span className="font-serif italic text-sm text-gold tracking-wider">
                  ॐ Narayan Kripa
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-cream drop-shadow-md">
                {title}
              </h1>

              {subtitle && (
                <p className="max-w-xl font-serif italic text-lg md:text-xl leading-relaxed text-cream/90">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent" />
      </section>
    );
  }

  const styles = {
    maroon: "bg-maroon text-cream",
    saffron: "bg-gradient-to-br from-saffron to-maroon text-white",
    brown: "bg-brown text-cream",
    ivory: "bg-ivory text-maroon",
  }[variant];

  return (
    <section className={`relative overflow-hidden ${styles}`}>
      {variant === "brown" && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}
      <div className="container relative py-16 text-center md:py-20">
        {breadcrumb && (
          <nav className="mb-3 text-xs opacity-80">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span>{breadcrumb}</span>
          </nav>
        )}
        <h1
          className={`font-display text-4xl md:text-5xl ${
            variant === "maroon" || variant === "brown"
              ? "text-gold"
              : variant === "ivory"
                ? "text-maroon"
                : "text-white"
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl font-serif italic opacity-90">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageHero;
