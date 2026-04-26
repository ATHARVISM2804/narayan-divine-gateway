const SectionHeading = ({
  title,
  subtitle,
  light = false,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
  eyebrow?: string;
}) => (
  <div className="mb-12 text-center">
    {eyebrow && (
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-[0.3em] ${
          light ? "text-gold/80" : "text-saffron"
        }`}
      >
        ❁ {eyebrow} ❁
      </p>
    )}
    <h2
      className={`font-display text-3xl md:text-5xl leading-tight ${
        light ? "text-gold" : "text-maroon"
      }`}
    >
      {title}
    </h2>

    {/* Ornate gold divider with central lotus */}
    <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold" />
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="hsl(var(--gold))" strokeWidth="0.5" />
        <path
          d="M12 4 C 7 10, 7 14, 12 20 C 17 14, 17 10, 12 4 Z"
          fill="hsl(var(--gold))"
        />
        <circle cx="12" cy="12" r="2" fill="hsl(var(--saffron))" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold" />
    </div>

    {subtitle && (
      <p
        className={`mx-auto mt-4 max-w-2xl font-serif italic text-base md:text-lg ${
          light ? "text-cream/80" : "text-brown/70"
        }`}
      >
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeading;
