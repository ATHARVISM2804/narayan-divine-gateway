import { cn } from "@/lib/utils";

/** Section title block: optional eyebrow, title, one-line subtitle.
    Left-aligned by default; pass align="center" for short standalone sections. */
const SectionHeading = ({
  title,
  subtitle,
  light = false,
  eyebrow,
  align = "left",
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
  eyebrow?: string;
  align?: "left" | "center";
  /** Optional link/button shown on the right (left-aligned layout only). */
  action?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "mb-6 md:mb-8",
      align === "center" ? "text-center" : "flex items-end justify-between gap-4",
      className,
    )}
  >
    <div className={align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}>
      {eyebrow && (
        <p
          className={cn(
            "mb-2 text-xs font-semibold uppercase tracking-[0.06em]",
            light ? "text-gold-light" : "text-maroon",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={cn("text-xl font-bold md:text-2xl lg:text-[28px] lg:leading-tight", light ? "text-white" : "text-ink")}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-2 text-[15px] md:text-base lg:text-[17px]", light ? "text-white/75" : "text-ink-muted")}>
          {subtitle}
        </p>
      )}
    </div>
    {align === "left" && action && <div className="shrink-0">{action}</div>}
  </div>
);

export default SectionHeading;
