import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Slides up from the bottom on phones, centred dialog on larger screens.
    Closes on backdrop tap and Escape, and locks page scroll while open. */
const BottomSheet = ({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="animate-fade-in absolute inset-0 bg-ink/50" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className={cn(
          "animate-sheet-up relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-surface outline-none sm:max-w-md sm:rounded-2xl",
          className,
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line sm:hidden" />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
