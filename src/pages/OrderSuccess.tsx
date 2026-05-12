import { Link, useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const OrderSuccess = () => {
  usePageTitle("Order Confirmed — Narayan Kripa");
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const orderId = params.get("id");
  const paymentId = params.get("payment");

  return (
    <main className="min-h-[70vh] bg-background flex items-center justify-center py-16">
      <div className="max-w-lg text-center px-4">
        <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-green-100 text-green-500 animate-scaleIn shadow-lg">
          <CheckCircle size={48} />
        </div>
        <h1 className="font-display text-3xl text-maroon md:text-4xl">{t("os_title")}</h1>
        <p className="mt-4 font-serif italic text-lg text-brown/70">{t("os_subtitle")}</p>

        <div className="mt-8 rounded-2xl border border-gold/50 bg-ivory p-6 text-left shadow-soft">
          <h3 className="font-display text-lg text-maroon mb-3">{t("os_details")}</h3>
          <div className="space-y-2 text-sm">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-brown/60">{t("os_order_id")}</span>
                <span className="font-mono text-xs text-maroon">{orderId.slice(0, 8)}…</span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between">
                <span className="text-brown/60">{t("os_payment_id")}</span>
                <span className="font-mono text-xs text-maroon">{paymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-brown/60">{t("os_status")}</span>
              <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700">{t("os_paid")}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gold/40 bg-cream p-5 text-left">
          <h4 className="font-display text-maroon mb-2">{t("os_next_title")}</h4>
          <ul className="space-y-2 text-sm text-brown/70">
            <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✦</span>{t("os_next1")}</li>
            <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✦</span>{t("os_next2")}</li>
            <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✦</span>{t("os_next3")}</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors">
            <Home size={16} /> {t("os_go_home")}
          </Link>
          <Link to="/puja" className="flex items-center gap-2 rounded-full border-2 border-gold px-6 py-3 text-sm font-semibold text-maroon hover:bg-gold transition-colors">
            <ShoppingBag size={16} /> {t("os_continue")}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;
