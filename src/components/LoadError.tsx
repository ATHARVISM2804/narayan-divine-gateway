import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackContact } from "@/lib/metaPixel";
import { whatsappLink } from "@/lib/whatsapp";

const waClass =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#25D366] px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98]";

/**
 * Shown when data could not be loaded and there is no saved copy.
 * Never says "nothing available"; offers Retry and a WhatsApp booking instead.
 */
export const LoadError = ({ onRetry, className = "" }: { onRetry: () => void; className?: string }) => {
  const { t } = useLanguage();
  return (
    <div role="alert" className={`col-span-full rounded-xl border border-line bg-surface px-5 py-10 text-center ${className}`}>
      <p className="text-lg font-bold text-ink">{t("load_error")}</p>
      <p className="mt-1 text-sm text-ink-muted">{t("load_error_sub")}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary min-h-[44px] px-5 text-sm"
        >
          <RefreshCw size={16} /> {t("btn_retry")}
        </button>
        <a
          href={whatsappLink(t("wa_msg_book"))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContact("whatsapp_load_error")}
          className={waClass}
        >
          {t("book_whatsapp")}
        </a>
      </div>
    </div>
  );
};

/** Thin notice when a saved copy is shown because the live data could not load. */
export const DegradedBanner = ({ className = "" }: { className?: string }) => {
  const { t } = useLanguage();
  return (
    <div role="status" className={`col-span-full flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-saffron/30 bg-saffron-soft px-4 py-3 text-center text-sm font-medium text-ink ${className}`}>
      <span>{t("degraded_banner")}</span>
      <a
        href={whatsappLink(t("wa_msg_book"))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContact("whatsapp_degraded_banner")}
        className="rounded-lg bg-[#25D366] px-3.5 py-1.5 text-xs font-semibold text-white"
      >
        {t("book_whatsapp")}
      </a>
    </div>
  );
};
