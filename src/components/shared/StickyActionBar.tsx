import { ArrowRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** Bottom bar that keeps the next step one tap away. Pages that render it
    should hide MobileCartBar (see MobileCartBar's route list).

    Without a `title` it is one full-width button (the pooja and chadhava pages).
    `hidden` slides it away, e.g. while the same button is already on screen. */
const StickyActionBar = ({
  title,
  subtitle,
  cta,
  onClick,
  onInfoClick,
  disabled,
  hidden = false,
  className,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  cta: string;
  onClick: () => void;
  /** Makes the price/label side a button too, e.g. to change the chosen package. */
  onInfoClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
}) => {
  const info = (
    <>
      <span className="block truncate text-base font-bold text-ink">{title}</span>
      {subtitle && (
        <span className="flex items-center gap-1 text-xs font-medium text-ink-soft">
          <span className="truncate">{subtitle}</span>
          {onInfoClick && <ChevronUp size={14} className="shrink-0" aria-hidden="true" />}
        </span>
      )}
    </>
  );
  // React 18 has no `inert` prop; a string attribute still reaches the DOM.
  const offProps: Record<string, string> = hidden ? { inert: "" } : {};
  return (
    <div
      aria-hidden={hidden || undefined}
      {...offProps}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-raised transition-transform duration-200 ease-out",
        hidden && "pointer-events-none translate-y-full",
        className,
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="container flex items-center gap-3 py-2.5">
        {title == null ? null : onInfoClick ? (
          <button type="button" onClick={onInfoClick} className="min-w-0 flex-1 text-left">{info}</button>
        ) : (
          <div className="min-w-0 flex-1">{info}</div>
        )}
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn("btn-primary", title == null ? "w-full" : "shrink-0 px-5 sm:px-8")}
        >
          {cta} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default StickyActionBar;
