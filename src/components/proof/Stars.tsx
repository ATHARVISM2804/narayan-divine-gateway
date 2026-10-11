import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const Stars = ({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) => (
  <span className={cn("inline-flex gap-0.5", className)} aria-label={`${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        strokeWidth={1.5}
        className={i <= Math.round(rating) ? "fill-saffron text-saffron" : "fill-line text-line"}
      />
    ))}
  </span>
);

export default Stars;
