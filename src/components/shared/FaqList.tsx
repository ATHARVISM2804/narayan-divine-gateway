import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Faq { question: string; answer: string }

/** Accordion FAQ. One item open at a time; the first can start open. */
const FaqList = ({ faqs, firstOpen = false }: { faqs: Faq[]; firstOpen?: boolean }) => {
  const [open, setOpen] = useState<number | null>(firstOpen ? 0 : null);
  if (faqs.length === 0) return null;
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left md:px-5"
            >
              <span className="text-[15px] font-semibold text-ink">{f.question}</span>
              <ChevronDown size={18} className={cn("shrink-0 text-ink-soft transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
            {isOpen && <p className="-mt-1 px-4 pb-4 text-[15px] leading-relaxed text-ink-muted md:px-5">{f.answer}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default FaqList;
