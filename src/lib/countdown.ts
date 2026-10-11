import { useEffect, useState } from "react";

/** Booking close time: the exact countdown_datetime when set, otherwise the end
    of the displayed date (rolling into next year if that date has passed). */
export function bookingDeadline(dateStr: string | null | undefined, countdownDatetime?: string | null): Date | null {
  if (countdownDatetime) {
    const exact = new Date(countdownDatetime);
    if (!isNaN(exact.getTime())) return exact;
  }
  if (!dateStr) return null;
  const year = new Date().getFullYear();
  const hasYear = /\d{4}/.test(dateStr);
  const d = new Date(`${hasYear ? dateStr : `${dateStr} ${year}`} 23:59:59`);
  if (isNaN(d.getTime())) return null;
  if (d < new Date() && !hasYear) {
    const next = new Date(`${dateStr} ${year + 1} 23:59:59`);
    return isNaN(next.getTime()) ? d : next;
  }
  return d;
}

export interface TimeLeft { days: number; hours: number; mins: number; secs: number; expired: boolean }

export function timeLeft(target: Date, now = Date.now()): TimeLeft {
  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

/** Ticks every second until the deadline. Returns null when there is no deadline. */
export function useCountdown(deadline: Date | null): TimeLeft | null {
  const ms = deadline?.getTime() ?? null;
  const [left, setLeft] = useState<TimeLeft | null>(() => (ms == null ? null : timeLeft(new Date(ms))));
  useEffect(() => {
    if (ms == null) { setLeft(null); return; }
    const target = new Date(ms);
    setLeft(timeLeft(target));
    const id = setInterval(() => {
      const next = timeLeft(target);
      setLeft(next);
      if (next.expired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [ms]);
  return left;
}
