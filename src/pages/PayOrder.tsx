import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, CheckCircle, Loader2, Lock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import { supabase, SUPABASE_URL } from "@/lib/supabase";
import { loadRazorpayScript } from "@/lib/razorpayScript";
import { checkOrderPayment } from "@/lib/orderStatus";
import { claimConfirmation } from "@/lib/pendingPayment";
import { isInAppBrowser } from "@/lib/browserEnv";
import { whatsappLink } from "@/lib/whatsapp";

/*
 * /pay/<order id>: the payment link the team sends for a booking taken on a call or on
 * WhatsApp (admin → New Booking), or for a website order whose payment did not go through.
 * It opens the same Razorpay checkout as the website, so the order turns PAID the same way.
 */

interface PayInfo {
  status: string;
  amount: number; // paise
  name: string;
  items: { name: string; quantity: number; when: string | null }[];
  razorpay_order_id?: string;
  key_id?: string;
}

type Phase = "loading" | "ready" | "paid" | "closed" | "invalid" | "error";

const PayOrder = () => {
  usePageTitle("Complete your payment | Narayan Kripa");
  const { t } = useLanguage();
  const nav = useNavigate();
  const { id = "" } = useParams();
  const [info, setInfo] = useState<PayInfo | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    setPhase("loading");
    const { data, error } = await supabase.functions.invoke("pay-order", { body: { order_id: id } });
    if (error) {
      const status = (error as { context?: Response }).context?.status;
      setPhase(status === 404 || status === 400 ? "invalid" : "error");
      return;
    }
    const d = data as PayInfo;
    setInfo(d);
    setPhase(d.status === "paid" ? "paid" : d.status === "cancelled" || d.status === "refunded" ? "closed" : "ready");
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  // A booking made by the team is not an ad conversion: claim it so neither this page,
  // /order-success nor the return-from-UPI check reports a Purchase to Meta for it.
  const confirmed = (paymentId: string) => {
    claimConfirmation(id);
    nav(`/order-success?id=${id}&payment=${paymentId}`);
  };

  const pay = async () => {
    if (!info?.razorpay_order_id || !info.key_id) return;
    setPaying(true);
    try {
      await loadRazorpayScript();
      claimConfirmation(id);
      const inApp = isInAppBrowser();
      const rzp = new window.Razorpay({
        key: info.key_id,
        amount: info.amount,
        currency: "INR",
        name: "Narayan Kripa",
        description: info.items.map((i) => i.name).join(", ").slice(0, 250),
        order_id: info.razorpay_order_id,
        prefill: { name: info.name },
        theme: { color: "#D4891A" },
        // In-app browsers (WhatsApp, Instagram) often reload this page during a UPI payment;
        // Razorpay then posts the result to our server, which brings the customer back.
        ...(inApp && SUPABASE_URL
          ? {
              redirect: true,
              callback_url:
                `${SUPABASE_URL}/functions/v1/razorpay-callback` +
                `?db=${encodeURIComponent(id)}&o=${encodeURIComponent(window.location.origin)}`,
            }
          : {}),
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const { data, error } = await supabase.functions.invoke("verify-payment", {
              body: { ...response, db_order_id: id },
            });
            if (error || !data?.success) throw new Error("verify failed");
            confirmed(response.razorpay_payment_id);
          } catch {
            // The money may be with Razorpay even though our call failed: ask the server.
            const status = await checkOrderPayment(id);
            if (status?.status === "paid") confirmed(status.razorpay_payment_id || response.razorpay_payment_id);
            else nav(`/order-success?id=${id}&status=checking`);
          }
        },
        modal: {
          ondismiss: async () => {
            // A UPI payment can complete in the UPI app before the popup is closed.
            const status = await checkOrderPayment(id);
            if (status?.status === "paid") { confirmed(status.razorpay_payment_id || ""); return; }
            setPaying(false);
            toast.info(t("co_payment_cancelled"));
          },
        },
      });
      rzp.on("payment.failed", (response: { error?: { description?: string } }) => {
        toast.error(response.error?.description || t("co_payment_failed"));
        setPaying(false);
      });
      rzp.open();
    } catch {
      toast.error(t("co_err_generic"));
      setPaying(false);
    }
  };

  const help = (
    <a
      href={whatsappLink(`Namaste, I need help with my payment. Booking ID: ${id.slice(0, 8).toUpperCase()}`)}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary w-full"
    >
      <MessageCircle size={18} /> {t("pay_whatsapp")}
    </a>
  );

  return (
    <main className="container max-w-lg py-8 md:py-12">
      {phase === "loading" && (
        <div className="grid place-items-center gap-3 py-16 text-ink-muted">
          <Loader2 className="animate-spin text-saffron" size={32} />
          <p>{t("pay_loading")}</p>
        </div>
      )}

      {(phase === "invalid" || phase === "error") && (
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-6 text-center">
          <h1 className="text-xl font-bold text-ink">{phase === "invalid" ? t("pay_invalid") : t("co_err_generic")}</h1>
          {phase === "error" && <button onClick={() => void load()} className="btn-primary w-full">{t("pay_retry")}</button>}
          {help}
        </div>
      )}

      {phase === "paid" && (
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-6 text-center">
          <CheckCircle size={44} className="mx-auto text-success" />
          <h1 className="text-xl font-bold text-ink">{t("pay_paid_title")}</h1>
          <p className="text-ink-muted">{t("pay_paid_sub")}</p>
        </div>
      )}

      {phase === "closed" && (
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-6 text-center">
          <h1 className="text-xl font-bold text-ink">{t("pay_closed_title")}</h1>
          <p className="text-ink-muted">{t("pay_closed_sub")}</p>
          {help}
        </div>
      )}

      {phase === "ready" && info && (
        <div className="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-card md:p-6">
          <div>
            <p className="text-sm font-semibold text-saffron-dark">{t("pay_namaste")} {info.name}</p>
            <h1 className="mt-1 text-2xl font-bold text-ink">{t("pay_title")}</h1>
            <p className="mt-1 text-[15px] text-ink-muted">{t("pay_sub")}</p>
          </div>

          <div className="space-y-3 border-y border-line py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t("pay_items")}</p>
            {info.items.map((item, i) => (
              <div key={i}>
                <p className="font-semibold text-ink">{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</p>
                {item.when && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-muted">
                    <CalendarDays size={14} className="text-saffron" /> {item.when}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-semibold text-ink-muted">{t("pay_total")}</span>
            <span className="text-2xl font-bold text-ink">₹{(info.amount / 100).toLocaleString("en-IN")}</span>
          </div>

          <button onClick={pay} disabled={paying} className="btn-primary w-full">
            {paying ? <Loader2 size={18} className="animate-spin" /> : null}
            {t("pay_button")} ₹{(info.amount / 100).toLocaleString("en-IN")}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-soft">
            <Lock size={12} /> {t("pay_secure")}
          </p>
          {help}
        </div>
      )}
    </main>
  );
};

export default PayOrder;
