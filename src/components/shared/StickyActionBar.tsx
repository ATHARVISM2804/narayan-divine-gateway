import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Bottom bar that keeps the next step one tap away. Pages that render it
    should hide MobileCartBar (see MobileCartBar's route list). */
const StickyActionBar = ({
  title,
  subtitle,
  cta,
  onClick,
  disabled,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  cta: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <div
    className={cn("fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-raised", className)}
    style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
  >
    <div className="container flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-bold text-ink">{title}</div>
        {subtitle && <div className="truncate text-xs font-medium text-ink-soft">{subtitle}</div>}
      </div>
      <button onClick={onClick} disabled={disabled} className="btn-primary shrink-0 px-5 sm:px-8">
        {cta} <ArrowRight size={18} />
      </button>
    </div>
  </div>
);

export default StickyActionBar;
