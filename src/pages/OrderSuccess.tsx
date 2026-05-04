import { Link, useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";

const OrderSuccess = () => {
  usePageTitle("Order Confirmed — Narayan Kripa");
  const [params] = useSearchParams();
  const orderId = params.get("id");
  const paymentId = params.get("payment");

  return (
    <main className="min-h-[70vh] bg-background flex items-center justify-center py-16">
      <div className="max-w-lg text-center px-4">
        {/* Animated check icon */}
        <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-green-100 text-green-500 animate-scaleIn shadow-lg">
          <CheckCircle size={48} />
        </div>

        <h1 className="font-display text-3xl text-maroon md:text-4xl">
          🙏 Order Confirmed!
        </h1>
        <p className="mt-4 font-serif italic text-lg text-brown/70">
          May divine blessings be upon you and your family
        </p>

        {/* Order details */}
        <div className="mt-8 rounded-2xl border border-gold/50 bg-ivory p-6 text-left shadow-soft">
          <h3 className="font-display text-lg text-maroon mb-3">Order Details</h3>
          <div className="space-y-2 text-sm">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-brown/60">Order ID</span>
                <span className="font-mono text-xs text-maroon">{orderId.slice(0, 8)}…</span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between">
                <span className="text-brown/60">Payment ID</span>
                <span className="font-mono text-xs text-maroon">{paymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-brown/60">Status</span>
              <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700">Paid ✓</span>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="mt-6 rounded-2xl border border-gold/40 bg-cream p-5 text-left">
          <h4 className="font-display text-maroon mb-2">What happens next?</h4>
          <ul className="space-y-2 text-sm text-brown/70">
            <li className="flex items-start gap-2">
              <span className="text-gold mt-0.5">✦</span>
              Our verified pandits will perform your puja/offering
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold mt-0.5">✦</span>
              You'll receive confirmation via email and phone
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold mt-0.5">✦</span>
              Prasad will be couriered to your address
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors">
            <Home size={16} /> Go Home
          </Link>
          <Link to="/puja" className="flex items-center gap-2 rounded-full border-2 border-gold px-6 py-3 text-sm font-semibold text-maroon hover:bg-gold transition-colors">
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;
