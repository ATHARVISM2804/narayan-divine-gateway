import { Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCountdown } from "@/lib/countdown";
import { cn } from "@/lib/utils";

/** "Booking closes in" boxes. Digits turn maroon on the final day.
    It ticks by itself, so only these boxes re-render each second, not the whole page. */
const Countdown = ({
  deadline,
  label,
  expiredLabel,
  compact = false,
  onDark = false,
}: {
  deadline: Date | null;
  label: string;
  expiredLabel: string;
  compact?: boolean;
  onDark?: boolean;
}) => {
  const { t } = useLanguage();
  const left = useCountdown(deadline);
  if (!left) return null;

  if (left.expired) {
    return (
      <p className={cn("inline-flex items-center gap-2 text-sm font-semibold", onDark ? "text-white/80" : "text-ink-soft")}>
        <Clock size={16} /> {expiredLabel}
      </p>
    );
  }

  const urgent = left.days === 0;
  const units = [
    { v: left.days, l: t("timer_days") },
    { v: left.hours, l: t("timer_hours") },
    { v: left.mins, l: t("timer_mins") },
    { v: left.secs, l: t("timer_secs") },
  ];

  return (
    <div>
      <p className={cn("mb-2 text-sm font-semibold", onDark ? "text-white/85" : "text-ink")}>{label}</p>
      {/* flex-wrap: on the narrowest phones (320px) a box wraps instead of running off-screen */}
      <div className="flex flex-wrap gap-1.5" role="timer" aria-live="off">
        {units.map(({ v, l }) => (
          <div
            key={l}
            className={cn(
              "flex items-baseline gap-1 rounded-lg",
              compact ? "px-2 py-1" : "px-2 py-1.5 sm:px-2.5",
              onDark ? "bg-white/15" : urgent ? "bg-maroon/10" : "bg-saffron-soft",
            )}
          >
            <span
              className={cn(
                "tabular font-bold leading-none",
                compact ? "text-base" : "text-lg",
                onDark ? "text-white" : urgent ? "text-maroon" : "text-saffron-dark",
              )}
            >
              {String(v).padStart(2, "0")}
            </span>
            <span className={cn("text-xs font-medium", onDark ? "text-white/70" : "text-ink-soft")}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Countdown;
