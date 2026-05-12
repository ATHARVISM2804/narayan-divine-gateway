import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CornerOrnament, Mandala, FloatingParticles } from "@/components/Ornaments";

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
  const { t } = useLanguage();

  if (bgImage) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative h-[320px] xs:h-[360px] sm:h-[420px] md:h-[480px]">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          {/* Color overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-maroon-deep/90 via-maroon/70 to-maroon-deep/40" />

          {/* Mandalas */}
          <Mandala className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 md:-right-24 md:-top-24 md:h-[28rem] md:w-[28rem] text-gold/25" />
          <Mandala className="pointer-events-none absolute -left-16 -bottom-16 h-36 w-36 md:-left-32 md:-bottom-32 md:h-[24rem] md:w-[24rem] text-gold/15" />

          {/* Ornate gold border frame */}
          <div className="pointer-events-none absolute inset-3 sm:inset-4 md:inset-6 border border-gold/40 rounded-[2px]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-5 sm:inset-6 md:inset-8 border border-gold/20" aria-hidden="true" />

          <CornerOrnament className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4 h-10 w-10 sm:h-12 sm:w-12 text-gold/80" />
          <CornerOrnament className="pointer-events-none absolute right-3 top-3 sm:right-4 sm:top-4 h-10 w-10 sm:h-12 sm:w-12 -scale-x-100 text-gold/80" />
          <CornerOrnament className="pointer-events-none absolute left-3 bottom-3 sm:left-4 sm:bottom-4 h-10 w-10 sm:h-12 sm:w-12 -scale-y-100 text-gold/80" />
          <CornerOrnament className="pointer-events-none absolute right-3 bottom-3 sm:right-4 sm:bottom-4 h-10 w-10 sm:h-12 sm:w-12 -scale-100 text-gold/80" />

          {/* Floating golden particles */}
          <FloatingParticles count={4} />

          {/* Content */}
          <div className="container relative z-10 grid h-full items-center py-8 sm:py-10">
            <div className="max-w-3xl space-y-4 sm:space-y-6">
              {breadcrumb && (
                <nav className="mb-4 sm:mb-6 text-xs md:text-sm font-medium text-gold/80 tracking-wide uppercase" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-gold transition-colors">
                    {t("breadcrumb_home")}
                  </Link>
                  <span className="mx-2 sm:mx-3 opacity-60">/</span>
                  <span className="text-cream">{breadcrumb}</span>
                </nav>
              )}

              {/* Sanskrit-style accent line */}
              <div className="flex items-center gap-3">
                <span className="h-px w-8 sm:w-10 bg-gold" />
                <Sparkles size={14} className="text-gold" />
                <span className="font-serif italic text-xs sm:text-sm text-gold tracking-wider">
                  ॐ Narayan Kripa
                </span>
              </div>

              <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-cream drop-shadow-md">
                {title}
              </h1>

              {subtitle && (
                <p className="max-w-xl font-serif italic text-sm xs:text-base sm:text-lg md:text-xl leading-relaxed text-cream/90">
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
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}
      <div className="container relative py-12 text-center sm:py-16 md:py-20">
        {breadcrumb && (
          <nav className="mb-3 text-xs opacity-80" aria-label="Breadcrumb">
            <Link to="/" className="hover:underline">
              {t("breadcrumb_home")}
            </Link>
            <span className="mx-2">›</span>
            <span>{breadcrumb}</span>
          </nav>
        )}
        <h1
          className={`font-display text-3xl sm:text-4xl md:text-5xl ${
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
