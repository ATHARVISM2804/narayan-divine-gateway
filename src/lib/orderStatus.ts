// Asks the server to confirm an order's payment directly with Razorpay.
// Used wherever the browser might have missed the payment callback: the checkout
// fallback, the success page and My Orders.
import { supabase } from "@/lib/supabase";

export interface OrderPaymentStatus {
  id: string;
  status: string;
  amount: number; // paise
  razorpay_payment_id: string | null;
  paid_at: string | null;
}

/** Resolves to the order's current status, or null if the check itself failed. */
export async function checkOrderPayment(orderId: string): Promise<OrderPaymentStatus | null> {
  try {
    const { data, error } = await supabase.functions.invoke("reconcile-orders", { body: { order_id: orderId } });
    if (error || !data?.order) return null;
    return data.order as OrderPaymentStatus;
  } catch {
    return null;
  }
}
