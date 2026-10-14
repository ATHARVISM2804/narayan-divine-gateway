import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/** `tone="light"` is for dark backgrounds (the footer): the wordmark artwork is
    dark-brown lettering that disappears on maroon, so it is filtered to cream.
    The gold temple icon reads well on dark and stays as it is. The footer logo
    is also a little larger than the header's. */
const Logo = ({ tone = "default" }: { tone?: "default" | "light" }) => {
  const location = useLocation();
  const light = tone === "light";

  const handleClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Only the header logo is above the fold; the footer one can load lazily.
  const priority = light ? { loading: "lazy" as const } : { fetchPriority: "high" as const };

  return (
    <Link to="/" onClick={handleClick} className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <img
        src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712834/favicon-removebg-preview_kx4s41.png"
        alt="Narayan Kripa Logo Icon"
        width={64}
        height={64}
        {...priority}
        className={cn("h-10 w-auto shrink-0 object-contain sm:h-11", light && "h-14 sm:h-16")}
      />
      <img
        src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712826/Screenshot_2026-05-02_143432-removebg-preview_vqcmpo.png"
        alt="Narayan Kripa Text"
        width={120}
        height={48}
        {...priority}
        className={cn(
          "-ml-1 h-7 w-auto min-w-0 shrink object-contain sm:h-8",
          light && "h-10 brightness-0 invert sepia-[.35] saturate-[1.4] sm:h-11",
        )}
      />
    </Link>
  );
};

export default Logo;
