import { cn } from "@/lib/utils";

/** Small uppercase label above a title, e.g. the occasion of a puja. */
export const Eyebrow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-xs font-semibold uppercase tracking-[0.06em] text-maroon", className)}>
    {children}
  </p>
);

/** Bold accent span for the one fact in a sentence that should catch the eye:
    "**1,240 devotees** have booked with us". */
export const Highlight = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <strong className={cn("font-semibold text-saffron-dark", className)}>{children}</strong>
);

const inr = new Intl.NumberFormat("en-IN");

/** Rupee amount in the accent color with tabular figures. */
export const Price = ({
  amount,
  prefix,
  className,
}: {
  amount: number;
  /** Small muted text before the amount, e.g. "From". */
  prefix?: string;
  className?: string;
}) => (
  <span className={cn("tabular font-bold text-saffron-dark", className)}>
    {prefix && <span className="mr-1 text-xs font-medium text-ink-soft">{prefix}</span>}
    ₹{inr.format(amount)}
  </span>
);

export const formatInr = (amount: number) => `₹${inr.format(amount)}`;
