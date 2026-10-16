import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

/** Slides up from the bottom on phones, centred dialog on larger screens.
    Closes on backdrop tap and Escape, and locks page scroll while open.
    `centerFrom` picks where it turns into a dialog (sm = 640px, md = 768px);
    `bare` leaves out the drag handle and close button for a child that draws its own. */
const BottomSheet = ({
  open,
  onClose,
  title,
  children,
  className,
  centerFrom = "sm",
  bare = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  centerFrom?: "sm" | "md";
  bare?: boolean;
}) => {
  const panel = useRef<HTMLDivElement>(null);
  // Parents pass a new inline onClose on every render (PujaDetail re-renders every
  // second for its countdown). Read it from a ref so a re-render never re-runs the
  // effect below: re-running it pulled focus out of the input being typed in, which
  // closed the phone keyboard straight away.
  const { t } = useLanguage();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const close = () => onCloseRef.current();

  // Runs once per open, never on re-renders.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    const prev = document.body.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    if (!panel.current?.contains(document.activeElement)) panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      // Back to the button that opened the sheet, for keyboard and screen-reader users.
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={cn("fixed inset-0 z-[70] flex items-end justify-center", centerFrom === "md" ? "md:items-center md:p-4" : "sm:items-center")}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="animate-fade-in absolute inset-0 bg-ink/50" onClick={close} />
      <div
        ref={panel}
        tabIndex={-1}
        className={cn(
          "animate-sheet-up relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-surface outline-none",
          centerFrom === "md" ? "md:max-w-md md:rounded-3xl" : "sm:max-w-md sm:rounded-2xl",
          className,
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {!bare && (
          <>
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line sm:hidden" />
            <button
              onClick={close}
              aria-label={t("mo_close")}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <X size={18} />
            </button>
          </>
        )}
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
