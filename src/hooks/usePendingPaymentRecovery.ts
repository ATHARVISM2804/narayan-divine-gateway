import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { checkOrderPayment } from "@/lib/orderStatus";
import { trackPurchase } from "@/lib/metaPixel";
import { claimConfirmation, loadPendingPayment } from "@/lib/pendingPayment";

/**
 * When a customer returns from their UPI app (or reopens the site) after starting a
 * payment, ask the server whether it went through. If it did, finish the booking:
 * report the Purchase, empty the cart and show the success page, instead of leaving
 * them on a checkout page that looks like nothing happened (and invites paying twice).
 */
export function usePendingPaymentRecovery() {
  const nav = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    let busy = false;
    let cancelled = false;

    const check = async () => {
      if (busy || document.visibilityState === "hidden") return;
      // The success page runs its own confirmation polling.
      if (window.location.pathname.startsWith("/order-success")) return;
      const pending = loadPendingPayment();
      if (!pending) return;

      busy = true;
      try {
        const status = await checkOrderPayment(pending.dbOrderId);
        if (cancelled || status?.status !== "paid") return;
        if (claimConfirmation(pending.dbOrderId)) {
          trackPurchase({
            items: pending.items,
            value: pending.value,
            orderId: pending.dbOrderId,
            // same id as every other path, so Meta counts the purchase once
            eventId: `purchase.${pending.dbOrderId}`,
          });
          clearCart();
        }
        nav(`/order-success?id=${pending.dbOrderId}&payment=${status.razorpay_payment_id || ""}`);
      } finally {
        busy = false;
      }
    };

    check();
    document.addEventListener("visibilitychange", check);
    window.addEventListener("pageshow", check);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("pageshow", check);
    };
  }, [nav, clearCart]);
}
