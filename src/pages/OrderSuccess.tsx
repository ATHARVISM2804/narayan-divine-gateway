import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { CheckCircle, Home, ShoppingBag, Loader2, Clock, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { checkOrderPayment } from "@/lib/orderStatus";
import { trackPurchase } from "@/lib/metaPixel";

/*
 * Two ways to land here:
 *   ?id=…&payment=…        the browser already had the payment verified (normal flow)
 *   ?id=…&status=checking  verification failed in the browser; the server is asked to
 *                          confirm with Razorpay directly and this page polls until it does
 */
const POLL_MS = 3000;
const POLL_LIMIT_MS = 90_000;

type Phase = "confirmed" | "checking" | "unconfirmed";

const OrderSuccess = () => {
  usePageTitle("Order Confirmed — Narayan Kripa");
  const { t } = useLanguage();
  const { items, clearCart } = useCart();
  const [params] = useSearchParams();
  const orderId = params.get("id");
  const initialChecking = params.get("status") === "checking";

  const [phase, setPhase] = useState<Phase>(initialChecking ? "checking" : "confirmed");
  const [paymentId, setPaymentId] = useState<string | null>(params.get("payment"));
  const [retrying, setRetrying] = useState(false);
  const startedAt = useRef(Date.now());
  const cartRef = useRef(items);
  cartRef.current = items;

  // Payment was confirmed only now (server-side): report it and release the cart.
  const onLateConfirmation = (amountPaise: number, pid: string | null) => {
    const cart = cartRef.current;
    if (cart.length > 0) {
      trackPurchase({
        items: cart.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price })),
        value: amountPaise / 100,
        orderId: orderId || "",
        eventId: `purchase.${orderId}`,
      });
      clearCart();
    }
    setPaymentId(pid);
    setPhase("confirmed");
  };

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      const status = await checkOrderPayment(orderId);
      if (cancelled) return;
      if (status?.status === "paid") {
        if (initialChecking) onLateConfirmation(status.amount, status.razorpay_payment_id);
        else if (status.razorpay_payment_id) setPaymentId(status.razorpay_payment_id);
        return;
      }
      if (!initialChecking) return; // normal flow: verify-payment already confirmed it
      if (Date.now() - startedAt.current >= POLL_LIMIT_MS) { setPhase("unconfirmed"); return; }
      timer = setTimeout(poll, POLL_MS);
    };
    poll();

    return () => { cancelled = true; if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, initialChecking]);

  const checkAgain = async () => {
    if (!orderId) return;
    setRetrying(true);
    const status = await checkOrderPayment(orderId);
    setRetrying(false);
    if (status?.status === "paid") onLateConfirmation(status.amount, status.razorpay_payment_id);
  };

  const heading =
    phase === "confirmed" ? t("os_title") : phase === "checking" ? t("os_checking_title") : t("os_unconfirmed_title");
  const subheading =
    phase === "confirmed" ? t("os_subtitle") : phase === "checking" ? t("os_checking_sub") : t("os_unconfirmed_sub");

  return (
    <main className="min-h-[70vh] bg-background flex items-center justify-center py-16">
      <div className="max-w-lg text-center px-4">
        <div className={`mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full animate-scaleIn shadow-lg ${
          phase === "confirmed" ? "bg-green-100 text-green-500" : phase === "checking" ? "bg-yellow-100 text-saffron" : "bg-orange-100 text-orange-500"
        }`}>
          {phase === "confirmed" ? <CheckCircle size={48} /> : phase === "checking" ? <Loader2 size={48} className="animate-spin" /> : <Clock size={48} />}
        </div>
        <h1 className="font-display text-3xl text-maroon md:text-4xl">{heading}</h1>
        <p className="mt-4 font-serif italic text-lg text-brown/70">{subheading}</p>

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
              {phase === "confirmed" ? (
                <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700">{t("os_paid")}</span>
              ) : (
                <span className="rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-bold text-yellow-700">{t("os_status_checking")}</span>
              )}
            </div>
          </div>
        </div>

        {phase === "confirmed" ? (
          <div className="mt-6 rounded-2xl border border-gold/40 bg-cream p-5 text-left">
            <h4 className="font-display text-maroon mb-2">{t("os_next_title")}</h4>
            <ul className="space-y-2 text-sm text-brown/70">
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✦</span>{t("os_next1")}</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✦</span>{t("os_next2")}</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✦</span>{t("os_next3")}</li>
            </ul>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-gold/40 bg-cream p-5 text-left">
            <p className="text-sm text-brown/70">{t("os_unconfirmed_help")}</p>
            {phase === "unconfirmed" && (
              <button
                onClick={checkAgain}
                disabled={retrying}
                className="mt-4 flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-semibold text-white hover:bg-maroon transition-colors disabled:opacity-60"
              >
                <RefreshCw size={14} className={retrying ? "animate-spin" : ""} /> {t("os_check_again")}
              </button>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors">
            <Home size={16} /> {t("os_go_home")}
          </Link>
          <Link to="/my-orders" className="flex items-center gap-2 rounded-full border-2 border-gold px-6 py-3 text-sm font-semibold text-maroon hover:bg-gold transition-colors">
            <ShoppingBag size={16} /> {t("mo_track_title")}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;
