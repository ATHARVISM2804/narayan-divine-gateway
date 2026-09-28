import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackContact } from "@/lib/metaPixel";
import { whatsappLink } from "@/lib/whatsapp";

const waClass =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform active:scale-95";
const waStyle = { background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)" };

/**
 * Shown when data could not be loaded and there is no saved copy.
 * Never says "nothing available" — offers Retry and a WhatsApp booking instead.
 */
export const LoadError = ({ onRetry, className = "" }: { onRetry: () => void; className?: string }) => {
  const { t } = useLanguage();
  return (
    <div role="alert" className={`col-span-full rounded-2xl border border-gold/40 bg-ivory px-5 py-10 text-center ${className}`}>
      <p className="text-lg font-bold text-maroon">{t("load_error")}</p>
      <p className="mt-1 text-sm text-brown/70">{t("load_error_sub")}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-maroon"
        >
          <RefreshCw size={15} /> {t("btn_retry")}
        </button>
        <a
          href={whatsappLink(t("wa_msg_book"))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContact("whatsapp_load_error")}
          className={waClass}
          style={waStyle}
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
    <div role="status" className={`col-span-full flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-saffron/30 bg-saffron/10 px-4 py-3 text-center text-sm font-semibold text-maroon ${className}`}>
      <span>{t("degraded_banner")}</span>
      <a
        href={whatsappLink(t("wa_msg_book"))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContact("whatsapp_degraded_banner")}
        className="rounded-full px-4 py-1.5 text-xs font-bold text-white"
        style={waStyle}
      >
        {t("book_whatsapp")}
      </a>
    </div>
  );
};
