import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Long text starts as a short, faded preview with a "Read more" button.
 * `length` is the text's character count: shorter texts render in full with no
 * button. The fade is a mask, so it works on any background.
 */
const ReadMore = ({
  length,
  threshold = 600,
  collapsedClass = "max-h-[18rem]",
  children,
  className,
}: {
  length: number;
  threshold?: number;
  collapsedClass?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  if (length <= threshold) return <div className={className}>{children}</div>;

  const toggle = () => {
    setOpen((o) => !o);
    // Collapsing from far down the text: bring the section back into view.
    if (open) requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  return (
    <div ref={ref} className={cn("scroll-mt-32", className)}>
      <div
        className={cn(
          "overflow-hidden",
          !open && collapsedClass,
          !open && "[mask-image:linear-gradient(to_bottom,black_65%,transparent)]",
        )}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-saffron-dark underline-offset-4 hover:underline"
      >
        {open ? t("btn_read_less") : t("btn_read_more")}
        <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
      </button>
    </div>
  );
};

export default ReadMore;
