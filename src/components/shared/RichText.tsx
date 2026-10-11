import { Check } from "lucide-react";
import { parseRichText } from "@/lib/richText";
import { cn } from "@/lib/utils";

/** Admin-written long text with headings, bold labels and bullets (rules in lib/richText.ts). */
const RichText = ({ text, className }: { text: string | null | undefined; className?: string }) => {
  const blocks = parseRichText(text);
  if (blocks.length === 0) return null;
  return (
    <div className={className}>
      {blocks.map((b, i) =>
        b.type === "heading" ? (
          <h4 key={i} className="mt-6 text-base font-semibold leading-snug text-ink first:mt-0 lg:text-[17px]">
            {b.text}
          </h4>
        ) : b.type === "list" ? (
          <ul key={i} className="mt-3 space-y-2 first:mt-0">
            {b.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-muted md:text-base">
                <Check size={16} strokeWidth={2.5} className="mt-1 shrink-0 text-success" /> {item}
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className={cn("mt-3 text-[15px] leading-[1.75] text-ink-muted first:mt-0 md:text-base")}>
            {b.label && <strong className="font-semibold text-ink">{b.label}: </strong>}
            {b.text}
          </p>
        ),
      )}
    </div>
  );
};

export default RichText;
