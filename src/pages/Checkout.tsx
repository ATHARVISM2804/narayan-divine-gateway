import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Shield, ArrowLeft, Loader2, User, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  usePageTitle("Checkout — Narayan Kripa");
  const nav = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "paying">("form");

  // Auto-fill from logged-in user
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.user_metadata?.full_name || f.name,
        email: user.email || f.email,
        phone: user.user_metadata?.phone || f.phone,
      }));
    }
  }, [user]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) { toast.error("Please enter your name"); return false; }
    if (!form.email.trim() || !form.email.includes("@")) { toast.error("Please enter a valid email"); return false; }
    if (!form.phone.trim() || form.phone.length < 10) { toast.error("Please enter a valid phone number"); return false; }
    return true;
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    if (items.length === 0) { toast.error("Your cart is empty"); return; }

    setLoading(true);
    setStep("paying");

    try {
      // ── Step 1: Create order on server (Edge Function) ──
      const { data: fnData, error: fnError } = await supabase.functions.invoke("create-order", {
        body: {
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, category: i.category })),
          customer: { name: form.name, email: form.email, phone: form.phone, address: form.address },
        },
      });

      if (fnError || !fnData?.order_id) {
        throw new Error(fnData?.error || "Failed to create order");
      }

      // ── Step 2: Open Razorpay Checkout ──
      const options = {
        key: fnData.key_id,
        amount: fnData.amount,
        currency: "INR",
        name: "Narayan Kripa",
        description: `Order: ${items.length} item${items.length > 1 ? "s" : ""}`,
        order_id: fnData.order_id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#D4891A", // saffron
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // ── Step 3: Verify payment on server ──
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                db_order_id: fnData.db_order_id,
              },
            });

            if (verifyError || !verifyData?.success) {
              throw new Error("Payment verification failed");
            }

            // Success!
            clearCart();
            nav(`/order-success?id=${fnData.db_order_id}&payment=${response.razorpay_payment_id}`);
          } catch {
            toast.error("Payment verification failed. Please contact support.");
            setLoading(false);
            setStep("form");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStep("form");
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(response.error?.description || "Payment failed");
        setLoading(false);
        setStep("form");
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setLoading(false);
      setStep("form");
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] bg-background flex items-center justify-center">
        <div className="text-center px-4 py-20">
          <div className="mx-auto mb-6 grid h-28 w-28 place-items-center rounded-full bg-gold/20">
            <ShoppingBag size={48} className="text-saffron" />
          </div>
          <h1 className="font-display text-3xl text-maroon">Your cart is empty</h1>
          <p className="mt-3 text-brown/60">Add items before checking out.</p>
          <Link to="/puja" className="mt-6 inline-block rounded-full bg-saffron px-7 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors">
            Browse Pujas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon via-maroon-deep to-maroon py-10">
        <div className="container">
          <Link to="/cart" className="inline-flex items-center gap-2 text-gold/80 hover:text-gold text-sm mb-3 transition-colors">
            <ArrowLeft size={14} /> Back to Cart
          </Link>
          <h1 className="font-display text-3xl text-gold md:text-4xl flex items-center gap-3">
            <Shield size={28} /> Secure Checkout
          </h1>
          <p className="mt-1 font-serif italic text-cream/70">Your payment is protected by Razorpay</p>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Customer Form */}
          <div className="rounded-2xl border border-gold/40 bg-ivory p-6 md:p-8 shadow-soft">
            <h2 className="font-display text-xl text-maroon mb-6">Your Details</h2>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                  <User size={13} /> Full Name *
                </label>
                <input
                  value={form.name} onChange={set("name")} type="text" required
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                    <Mail size={13} /> Email *
                  </label>
                  <input
                    value={form.email} onChange={set("email")} type="email" required
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                    <Phone size={13} /> Phone *
                  </label>
                  <input
                    value={form.phone} onChange={set("phone")} type="tel" required
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                  <MapPin size={13} /> Delivery Address (for Prasad)
                </label>
                <textarea
                  value={form.address} onChange={set("address")} rows={3}
                  placeholder="House/Flat, Street, City, State, PIN"
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 resize-none"
                />
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-6 flex flex-wrap gap-3">
              {["🔒 SSL Encrypted", "🛡️ Razorpay Secure", "📦 Prasad Delivery"].map((b) => (
                <span key={b} className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-[11px] font-medium text-green-700">{b}</span>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit sticky top-32 rounded-2xl border border-gold/60 bg-gradient-to-b from-ivory to-cream p-6 shadow-lg">
            <h2 className="font-display text-xl text-maroon mb-5 flex items-center gap-2">
              <ShoppingBag size={18} className="text-gold" /> Order Summary
            </h2>

            <div className="space-y-3 border-b border-gold/30 pb-5">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-[13px]">
                  <span className="text-brown/90 truncate pr-3 flex-1">
                    {item.name} <span className="text-brown/50 ml-1">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-maroon whitespace-nowrap shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-5 mb-6">
              <span className="font-display text-lg text-maroon">Total</span>
              <span className="font-sans text-2xl font-bold text-saffron">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-saffron to-maroon py-4 text-center text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {step === "paying" ? "Processing payment…" : "Creating order…"}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🔒 Pay ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </button>

            <p className="mt-4 text-center text-[11px] text-brown/60 font-serif italic">
              Powered by Razorpay • Secure payment
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
