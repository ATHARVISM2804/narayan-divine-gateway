import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { CheckCircle, Home, ShoppingBag, Loader2, Clock, RefreshCw, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { checkOrderPayment } from "@/lib/orderStatus";
import { trackPurchase } from "@/lib/metaPixel";
import { claimConfirmation } from "@/lib/pendingPayment";

/*
 * Two ways to land here:
 *   ?id=...&payment=...    the browser already had the payment verified (normal flow)
 *   ?id=...&status=checking verification failed in the browser, or the customer came back
 *                          from redirect-mode checkout (razorpay-callback); the server is asked
 *                          to confirm with Razorpay directly and this page polls until it does
 */
const POLL_MS = 3000;
const POLL_LIMIT_MS = 90_000;

type Phase = "confirmed" | "checking" | "unconfirmed";

const OrderSuccess = () => {
  usePageTitle("Order Confirmed | Narayan Kripa");
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
    // Claimed once per order, whichever path (this page, checkout, return-from-UPI) gets here first.
    if (orderId && claimConfirmation(orderId) && cart.length > 0) {
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

  const steps = [t("os_next1"), t("os_next2"), t("os_next3")];

  return (
    <main className="container max-w-lg py-10 md:py-16">
      <div className="text-center">
        <span
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${
            phase === "confirmed" ? "bg-success/10 text-success" : "bg-saffron-soft text-saffron-dark"
          }`}
        >
          {phase === "confirmed" ? (
            <CheckCircle size={34} strokeWidth={1.75} />
          ) : phase === "checking" ? (
            <Loader2 size={34} className="animate-spin" />
          ) : (
            <Clock size={34} strokeWidth={1.75} />
          )}
        </span>
        <h1 className="mt-4 text-[22px] font-bold text-ink md:text-[28px]">{heading}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{subheading}</p>
      </div>

      <div className="mt-6 rounded-xl border border-line bg-surface p-4 md:p-5">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">{t("os_details")}</h2>
        <dl className="space-y-2.5 text-sm">
          {orderId && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">{t("os_order_id")}</dt>
              <dd className="font-mono text-xs font-medium uppercase text-ink">{orderId.slice(0, 8)}</dd>
            </div>
          )}
          {paymentId && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">{t("os_payment_id")}</dt>
              <dd className="break-all font-mono text-xs text-ink">{paymentId}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-soft">{t("os_status")}</dt>
            <dd>
              {phase === "confirmed" ? (
                <span className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">{t("os_paid")}</span>
              ) : (
                <span className="rounded-md bg-saffron-soft px-2.5 py-1 text-xs font-semibold text-saffron-dark">{t("os_status_checking")}</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {phase === "confirmed" ? (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4 md:p-5">
          <h2 className="mb-4 text-[15px] font-semibold text-ink">{t("os_next_title")}</h2>
          <ol className="relative space-y-4 border-l border-dashed border-saffron/40 pl-6">
            {steps.map((step, i) => (
              <li key={step} className="relative text-[15px] text-ink-muted">
                <span className="tabular absolute -left-[37px] top-0 grid h-6 w-6 place-items-center rounded-full bg-saffron text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4 md:p-5">
          <p className="text-[15px] text-ink-muted">{t("os_unconfirmed_help")}</p>
          {phase === "unconfirmed" && (
            <button onClick={checkAgain} disabled={retrying} className="btn-secondary mt-4 min-h-[44px] text-sm">
              <RefreshCw size={16} className={retrying ? "animate-spin" : ""} /> {t("os_check_again")}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface-muted p-4">
        <p className="text-sm font-medium text-ink">{t("os_help")}</p>
        <a
          href={whatsappLink(`${t("wa_msg_book")} ${orderId ? `(${orderId.slice(0, 8).toUpperCase()})` : ""}`.trim())}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] bg-[#25D366] px-3.5 py-2 text-sm font-semibold text-white"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link to="/my-orders" className="btn-primary">
          <ShoppingBag size={18} /> {t("mo_track_title")}
        </Link>
        <Link to="/puja" className="btn-secondary">
          {t("os_continue")}
        </Link>
      </div>
      <p className="mt-4 text-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <Home size={15} /> {t("os_go_home")}
        </Link>
      </p>
    </main>
  );
};

export default OrderSuccess;
