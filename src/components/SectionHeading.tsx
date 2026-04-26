const SectionHeading = ({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) => (
  <div className="mb-10 text-center">
    <h2 className={`font-display text-3xl md:text-4xl ${light ? "text-gold" : "text-maroon"}`}>{title}</h2>
    <div className="mx-auto mt-3 flex items-center justify-center gap-2">
      <span className="h-px w-12 bg-gold/60" />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 4 C 7 10, 7 14, 12 20 C 17 14, 17 10, 12 4 Z" fill="hsl(var(--gold))" />
      </svg>
      <span className="h-px w-12 bg-gold/60" />
    </div>
    {subtitle && (
      <p className={`mt-3 font-serif italic ${light ? "text-cream/80" : "text-brown/70"}`}>{subtitle}</p>
    )}
  </div>
);

export default SectionHeading;
