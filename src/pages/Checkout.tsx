import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase, type PujaOffering } from "@/lib/supabase";
import { ShoppingBag, Shield, ArrowLeft, Loader2, MapPin, Users, Info, Gift, ChevronRight, Check, Calendar } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/context/LanguageContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/** Load Razorpay checkout script on demand (cached after first load) */
const loadRazorpayScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const existing = document.querySelector('script[src*="razorpay"]');
    if (existing) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(s);
  });

/* ── Progress Steps ── */
const STEPS = [
  { key: "review", label: "Review Booking", labelHi: "बुकिंग देखें" },
  { key: "details", label: "Fill Details", labelHi: "विवरण भरें" },
  { key: "payment", label: "Make Payment", labelHi: "भुगतान करें" },
] as const;

const ProgressBar = ({ current, lang }: { current: "review" | "details"; lang: string }) => {
  const stepIndex = current === "review" ? 0 : 1;
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 px-4 py-4">
      {STEPS.map((s, i) => {
        const done = i < stepIndex;
        const active = i === stepIndex;
        return (
          <div key={s.key} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && <div className={`hidden xs:block w-6 sm:w-10 h-0.5 ${done || active ? "bg-saffron" : "bg-gold/30"}`} />}
            <div className="flex items-center gap-1.5">
              <div className={`shrink-0 grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full text-xs font-bold transition-all ${
                done ? "bg-green-500 text-white" : active ? "bg-saffron text-white shadow-md" : "bg-gold/20 text-brown/40"
              }`}>
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold whitespace-nowrap ${
                active ? "text-maroon" : done ? "text-green-600" : "text-brown/40"
              }`}>
                {lang === "hi" ? s.labelHi : s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Checkout = () => {
  usePageTitle("Checkout — Narayan Kripa");
  const nav = useNavigate();
  const { items, totalPrice: cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  /* ── Steps ── */
  const [searchParams, setSearchParams] = useSearchParams();
  const checkoutStep = searchParams.get("step") === "details" ? "details" : "review";
  const setCheckoutStep = (step: "review" | "details") => {
    setSearchParams({ step });
  };

  // Scroll to top after step change renders
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [checkoutStep]);

  /* ── Form (no email) ── */
  const [form, setForm] = useState(() => {
    try {
      const lead = JSON.parse(localStorage.getItem("nk_lead") || "{}");
      localStorage.removeItem("nk_lead");
      return { name: lead.name || "", phone: lead.phone || "", address: "" };
    } catch {
      return { name: "", phone: "", address: "" };
    }
  });
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [gotra, setGotra] = useState("");
  const [gotraUnknown, setGotraUnknown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wantBox, setWantBox] = useState(false);
  const [pujaOfferings, setPujaOfferings] = useState<PujaOffering[]>([]);
  const [selectedOfferings, setSelectedOfferings] = useState<Record<string, boolean>>({});

  const BLESSING_BOX_PRICE = 200;

  // Detect member count from puja items in cart
  const pujaItem = items.find(i => i.category === "puja");
  const getMemberCount = (): number => {
    if (!pujaItem) return 0;
    const match = pujaItem.id.match(/^puja-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i);
    const label = match ? match[1].toLowerCase() : pujaItem.name.toLowerCase();
    if (label.includes("6") || label.includes("joint")) return 6;
    if (label.includes("4") || label.includes("family")) return 4;
    if (label.includes("couple") || label.includes("2")) return 2;
    if (label.includes("single") || label.includes("individual") || label.includes("1")) return 1;
    return 1;
  };
  const memberCount = getMemberCount();

  // Extract puja UUID from cart item id (format: "puja-{uuid}-{label}")
  const pujaId = pujaItem ? (pujaItem.id.match(/^puja-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)?.[1] ?? null) : null;

  // Fetch puja offerings
  useEffect(() => {
    if (!pujaId) return;
    supabase.from("puja_offerings").select("*").eq("puja_id", pujaId).eq("status", "active").order("sort_order")
      .then(({ data }) => { if (data) setPujaOfferings(data as PujaOffering[]); });
  }, [pujaId]);

  const toggleOffering = (id: string) => {
    setSelectedOfferings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const offeringsTotal = pujaOfferings.filter(o => selectedOfferings[o.id]).reduce((sum, o) => sum + o.price, 0);
  const totalPrice = cartTotal + (wantBox && pujaItem ? BLESSING_BOX_PRICE : 0) + offeringsTotal;

  // Sync memberNames array length when memberCount changes
  const syncedMemberNames = Array.from({ length: memberCount }, (_, i) => memberNames[i] || "");

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.user_metadata?.full_name || f.name,
        phone: user.user_metadata?.phone || f.phone,
      }));
    }
  }, [user]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validateDetails = () => {
    if (!form.name.trim()) { toast.error(t("co_err_name")); return false; }
    if (!form.phone.trim() || form.phone.length < 10) { toast.error(t("co_err_phone")); return false; }
    if (memberCount > 0 && !syncedMemberNames[0].trim()) { toast.error("Please enter at least the first member's name"); return false; }
    if (wantBox && !form.address.trim()) { toast.error("Please enter delivery address for the Blessing Box"); return false; }
    return true;
  };

  const handleGotraUnknown = (checked: boolean) => {
    setGotraUnknown(checked);
    if (checked) setGotra("Kashyap");
    else setGotra("");
  };

  const handleCheckout = async () => {
    if (!validateDetails()) return;
    if (items.length === 0) { toast.error(t("co_err_empty")); return; }

    setLoading(true);

    try {
      await loadRazorpayScript();

      const orderItems = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, category: i.category }));
      if (wantBox && pujaItem) {
        orderItems.push({ id: "blessing-box", name: "Narayan Kripa Blessing Box", price: BLESSING_BOX_PRICE, quantity: 1, category: "addon" });
      }
      pujaOfferings.filter(o => selectedOfferings[o.id]).forEach(o => {
        orderItems.push({ id: `offering-${o.id}`, name: o.name, price: o.price, quantity: 1, category: "offering" });
      });

      const { data: fnData, error: fnError } = await supabase.functions.invoke("create-order", {
        body: {
          items: orderItems,
          customer: { name: form.name, phone: form.phone, address: wantBox ? form.address : null },
          puja_details: memberCount > 0 ? { member_names: syncedMemberNames.filter(n => n.trim()), gotra: gotraUnknown ? "Kashyap" : gotra } : undefined,
        },
      });

      if (fnError || !fnData?.order_id) {
        let errorMsg: string = fnData?.error || "Failed to create order";
        if (!fnData?.error && fnError && (fnError as any).context) {
          try {
            const errBody = await (fnError as any).context.json();
            errorMsg = errBody.error || errorMsg;
          } catch {}
        }
        console.error("create-order failed:", { fnError, fnData });
        throw new Error(errorMsg);
      }

      const options = {
        key: fnData.key_id,
        amount: fnData.amount,
        currency: "INR",
        name: "Narayan Kripa",
        description: `Order: ${items.length} item${items.length > 1 ? "s" : ""}`,
        order_id: fnData.order_id,
        prefill: { name: form.name, contact: form.phone },
        theme: { color: "#D4891A" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                db_order_id: fnData.db_order_id,
              },
            });
            if (verifyError || !verifyData?.success) throw new Error("Payment verification failed");
            clearCart();
            nav(`/order-success?id=${fnData.db_order_id}&payment=${response.razorpay_payment_id}`);
          } catch {
            toast.error("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => { setLoading(false); toast.info("Payment cancelled"); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(response.error?.description || "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] bg-background flex items-center justify-center">
        <div className="text-center px-4 py-20">
          <div className="mx-auto mb-6 grid h-28 w-28 place-items-center rounded-full bg-gold/20">
            <ShoppingBag size={48} className="text-saffron" />
          </div>
          <h1 className="font-display text-3xl text-maroon">{t("co_empty_title")}</h1>
          <p className="mt-3 text-brown/60">{t("co_empty_sub")}</p>
          <Link to="/puja" className="mt-6 inline-block rounded-full bg-saffron px-7 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors">
            {t("co_browse")}
          </Link>
        </div>
      </main>
    );
  }

  /* ── Order Summary Sidebar (shared between steps) ── */
  const OrderSummary = ({ showPayButton = false }: { showPayButton?: boolean }) => (
    <div className="h-fit lg:sticky lg:top-32 rounded-2xl border border-gold/60 bg-gradient-to-b from-ivory to-cream p-4 sm:p-6 shadow-lg">
      <h2 className="font-display text-xl text-maroon mb-5 flex items-center gap-2">
        <ShoppingBag size={18} className="text-gold" /> {t("co_summary")}
      </h2>
      <div className="space-y-3 border-b border-gold/30 pb-5">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between gap-3 text-[13px]">
            <span className="text-brown/90 min-w-0 break-words">
              {item.name} <span className="text-brown/50 ml-1">× {item.quantity}</span>
            </span>
            <span className="font-semibold text-maroon whitespace-nowrap shrink-0">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
        {/* Selected offerings line items */}
        {pujaOfferings.filter(o => selectedOfferings[o.id]).map(off => (
          <div key={off.id} className="flex justify-between gap-3 text-[13px]">
            <span className="text-brown/90 flex items-center gap-1.5">
              🌺 {off.name}
            </span>
            <span className="font-semibold text-saffron whitespace-nowrap shrink-0">
              ₹{off.price.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
        {/* Blessing Box line item */}
        {wantBox && pujaItem && (
          <div className="flex justify-between gap-3 text-[13px]">
            <span className="text-brown/90 flex items-center gap-1.5">
              <Gift size={12} className="text-saffron" /> Narayan Kripa Blessing Box
            </span>
            <span className="font-semibold text-saffron whitespace-nowrap shrink-0">
              ₹{BLESSING_BOX_PRICE.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center pt-5 mb-4">
        <span className="font-display text-lg text-maroon">{t("co_total")}</span>
        <span className="font-sans text-2xl font-bold text-saffron">₹{totalPrice.toLocaleString("en-IN")}</span>
      </div>
      {showPayButton && (
        <>
          <button onClick={handleCheckout} disabled={loading}
            className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-saffron to-maroon py-4 text-center text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                {t("co_processing")}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {t("co_pay")} ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </button>
          <p className="mt-4 text-center text-[11px] text-brown/60 font-serif italic">{t("co_powered")}</p>
        </>
      )}
    </div>
  );

  return (
    <main className="bg-background min-h-screen">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-maroon via-maroon-deep to-maroon py-6 sm:py-8">
        <div className="container">
          <button
            onClick={() => checkoutStep === "review" ? nav("/cart") : setCheckoutStep("review")}
            className="inline-flex items-center gap-2 text-gold/80 hover:text-gold text-sm mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> {checkoutStep === "review" ? t("co_back") : "Back to Review"}
          </button>
          <h1 className="font-display text-2xl sm:text-3xl text-gold md:text-4xl flex items-center gap-3">
            <Shield size={24} /> {t("co_title")}
          </h1>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="bg-ivory border-b border-gold/20">
        <div className="container">
          <ProgressBar current={checkoutStep} lang={lang} />
        </div>
      </div>

      <div className="container py-6 sm:py-10 pb-28 lg:pb-10">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_380px]">

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: Review Booking                                         */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {checkoutStep === "review" && (
            <div className="space-y-6">

              {/* ── Puja Booking Card ── */}
              {pujaItem && (
                <div className="rounded-2xl border border-gold/40 bg-ivory p-4 sm:p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    {pujaItem.image && (
                      <img src={pujaItem.image} alt="" className="h-20 w-20 rounded-xl object-cover border border-gold/30 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-body text-base sm:text-lg font-bold text-maroon leading-snug">{pujaItem.name}</h3>
                      {pujaItem.description && (
                        <p className="text-xs text-brown/60 mt-1 flex items-center gap-1.5">
                          <Calendar size={12} className="text-gold shrink-0" /> {pujaItem.description}
                        </p>
                      )}
                      <p className="text-xl font-bold text-saffron mt-2">₹{pujaItem.price.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Chadhava items (if any) ── */}
              {items.filter(i => i.category === "chadhava").map(item => (
                <div key={item.id} className="rounded-2xl border border-gold/40 bg-ivory p-4 sm:p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    {item.image && (
                      <img src={item.image} alt="" className="h-20 w-20 rounded-xl object-cover border border-gold/30 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-body text-base font-bold text-maroon">{item.name}</h3>
                      {item.description && <p className="text-xs text-brown/60 mt-1">{item.description}</p>}
                      <p className="text-xl font-bold text-saffron mt-2">₹{item.price.toLocaleString("en-IN")} <span className="text-xs text-brown/50 font-medium">× {item.quantity}</span></p>
                    </div>
                  </div>
                </div>
              ))}

              {/* ── Add More Offerings ── */}
              {pujaItem && pujaOfferings.length > 0 && (
                <div className="rounded-2xl border-2 border-gold/30 bg-gradient-to-b from-ivory to-cream p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="shrink-0 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-saffron to-maroon text-white shadow-md">
                      🌺
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-maroon leading-snug">Add More Offering Items</h3>
                      <p className="text-xs text-brown/50">Enhance your puja with sacred offerings</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pujaOfferings.map(off => {
                      const isSelected = !!selectedOfferings[off.id];
                      return (
                        <button
                          key={off.id}
                          onClick={() => toggleOffering(off.id)}
                          className={`flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                            isSelected
                              ? "border-saffron bg-saffron/5 shadow-md"
                              : "border-gold/30 bg-ivory hover:border-saffron/40"
                          }`}
                        >
                          <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gold/10">
                            {off.image_url
                              ? <img src={off.image_url} alt={off.name} className="h-full w-full object-cover" />
                              : <div className="h-full w-full grid place-items-center text-xl">🌺</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-maroon truncate">{off.name}</p>
                              <div className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? "border-saffron bg-saffron" : "border-gold/40 bg-white"
                              }`}>
                                {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                              </div>
                            </div>
                            {off.description && <p className="text-[11px] text-brown/50 mt-0.5 line-clamp-2">{off.description}</p>}
                            <p className="text-sm font-bold text-saffron mt-1">₹{off.price.toLocaleString("en-IN")}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {offeringsTotal > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-saffron/10 border border-saffron/20 px-4 py-2">
                      <span className="text-xs font-semibold text-brown/60">
                        {pujaOfferings.filter(o => selectedOfferings[o.id]).length} offering(s) selected
                      </span>
                      <span className="text-sm font-bold text-saffron">+₹{offeringsTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Bill Details ── */}
              <div className="rounded-2xl border border-gold/40 bg-ivory p-4 sm:p-6 shadow-soft">
                <h3 className="text-base font-bold text-maroon mb-4">Bill Details</h3>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-brown/70">{item.name}</span>
                      <span className="font-semibold text-maroon">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                  {pujaOfferings.filter(o => selectedOfferings[o.id]).map(off => (
                    <div key={off.id} className="flex justify-between text-sm">
                      <span className="text-brown/70">🌺 {off.name}</span>
                      <span className="font-semibold text-saffron">₹{off.price.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gold/30 flex justify-between items-center">
                  <span className="text-base font-bold text-maroon">Total Amount</span>
                  <span className="text-xl font-bold text-saffron">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* ── Continue Button (desktop only — mobile uses sticky bar) ── */}
              <button
                onClick={() => setCheckoutStep("details")}
                className="hidden lg:flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-saffron to-maroon py-4 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5"
              >
                Continue <ChevronRight size={18} />
              </button>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-2">
                {[t("co_ssl"), t("co_razorpay"), t("co_prasad")].map((b) => (
                  <span key={b} className="rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-green-700 whitespace-nowrap">{b}</span>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: Fill Details                                            */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {checkoutStep === "details" && (
            <div className="rounded-2xl border border-gold/40 bg-ivory p-4 sm:p-6 md:p-8 shadow-soft">
              <h2 className="font-display text-xl text-maroon mb-6">Enter Details for Your Puja</h2>
              <div className="space-y-6">

                {/* ── WhatsApp Number ── */}
                <div>
                  <h3 className="text-lg font-bold text-maroon mb-1">Your WhatsApp Number</h3>
                  <p className="text-sm text-brown/50 mb-3 leading-snug">
                    Your Puja booking updates like Photos, Videos and other details will be sent on WhatsApp on below number.
                  </p>
                  <div className="flex items-center gap-2 rounded-xl border-2 border-gold/40 bg-cream px-3 py-3 focus-within:border-saffron transition-all">
                    <svg viewBox="0 0 32 32" className="h-5 w-5 shrink-0 fill-green-500" aria-hidden="true">
                      <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.908 1.885 7.054L2 30l7.144-1.87A14.034 14.034 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.6a11.62 11.62 0 0 1-5.923-1.62l-.425-.252-4.24 1.11 1.132-4.134-.277-.446A11.563 11.563 0 0 1 4.4 16.003c0-6.4 5.203-11.6 11.603-11.6s11.598 5.2 11.598 11.6-5.198 11.597-11.598 11.597zm6.36-8.68c-.348-.174-2.063-1.018-2.383-1.133-.32-.116-.552-.174-.786.174-.233.348-.902 1.133-1.107 1.366-.203.232-.407.26-.755.086-.348-.174-1.47-.543-2.8-1.727-1.034-.922-1.73-2.06-1.934-2.407-.203-.348-.022-.535.152-.707.157-.155.348-.406.523-.61.174-.202.232-.347.348-.578.116-.232.058-.435-.03-.61-.086-.173-.785-1.892-1.075-2.59-.284-.682-.573-.59-.785-.6l-.67-.012c-.232 0-.61.087-.928.435-.32.347-1.22 1.192-1.22 2.91s1.25 3.378 1.422 3.61c.174.232 2.46 3.757 5.96 5.27.834.36 1.483.575 1.99.736.836.267 1.598.23 2.2.14.672-.1 2.063-.843 2.353-1.658.29-.812.29-1.51.203-1.658-.087-.145-.32-.23-.67-.406z"/>
                    </svg>
                    <span className="text-sm font-bold text-brown/50 shrink-0">+91</span>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter 10-digit number"
                      className="flex-1 bg-transparent text-sm font-semibold text-maroon outline-none placeholder:text-brown/30"
                    />
                    {form.phone.length === 10 && (
                      <Check size={16} className="text-green-500 shrink-0" />
                    )}
                  </div>
                </div>

                {/* Gold divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

                {/* ── Member Names ── */}
                {memberCount > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-maroon mb-1 flex items-center gap-2">
                      <Users size={18} className="text-saffron" /> Name of Members Participating in Puja
                    </h3>
                    <p className="text-sm text-brown/50 mb-3">
                      Panditji will take these names along with gotra during the puja.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {syncedMemberNames.map((val, idx) => (
                        <div key={idx}>
                          <label className="mb-1 block text-[11px] font-semibold text-maroon/70 uppercase tracking-wide">
                            {`${t("co_member_ph")} ${idx + 1}`}{idx === 0 && " *"}
                          </label>
                          <input
                            value={val}
                            onChange={(e) => {
                              const updated = [...syncedMemberNames];
                              updated[idx] = e.target.value;
                              setMemberNames(updated);
                            }}
                            placeholder={`${t("co_member_ph")} ${idx + 1}`}
                            className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gold divider */}
                {memberCount > 0 && <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />}

                {/* ── Gotra ── */}
                {memberCount > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-maroon mb-1 flex items-center gap-2">
                      <Info size={16} className="text-gold" /> Fill Participant's Gotra
                    </h3>
                    <p className="text-xs text-brown/50 mb-3">
                      {t("co_gotra_sub")}
                    </p>
                    <input
                      value={gotraUnknown ? "Kashyap" : gotra}
                      onChange={(e) => { if (!gotraUnknown) setGotra(e.target.value); }}
                      disabled={gotraUnknown}
                      placeholder={t("co_gotra_ph")}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                        gotraUnknown
                          ? "border-gold/30 bg-gold/10 text-brown/50 cursor-not-allowed"
                          : "border-gold/50 bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                      }`}
                    />
                    <label className="mt-2.5 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gotraUnknown}
                        onChange={(e) => handleGotraUnknown(e.target.checked)}
                        className="h-4 w-4 rounded border-gold/50 accent-saffron"
                      />
                      <span className="text-[13px] text-brown/70 font-medium">{t("co_gotra_unknown")}</span>
                    </label>
                  </div>
                )}

                {/* Gold divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

                {/* ── Narayan Kripa Blessing Box ── */}
                {pujaItem && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="shrink-0 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-saffron to-maroon text-white shadow-md">
                          <Gift size={20} />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-maroon leading-snug">
                            Would you like to receive the Narayan Kripa Blessing Box?
                          </h3>
                          <p className="text-xs text-brown/60 mt-1 leading-relaxed">
                            Receive sacred blessed items from the puja — delivered straight to your doorstep. Contents may include Prasad, holy water, sacred threads, and more.
                          </p>
                        </div>
                      </div>
                      {/* Yes / No toggle */}
                      <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                        <button
                          onClick={() => setWantBox(true)}
                          className={`px-5 py-2.5 sm:px-4 sm:py-2 rounded-lg text-sm font-bold transition-all min-h-[44px] sm:min-h-0 ${
                            wantBox
                              ? "bg-saffron text-white shadow-md"
                              : "bg-cream border border-gold/40 text-brown/50 hover:border-saffron/50"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setWantBox(false)}
                          className={`px-5 py-2.5 sm:px-4 sm:py-2 rounded-lg text-sm font-bold transition-all min-h-[44px] sm:min-h-0 ${
                            !wantBox
                              ? "bg-maroon text-white shadow-md"
                              : "bg-cream border border-gold/40 text-brown/50 hover:border-saffron/50"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Price badge (when Yes) */}
                    {wantBox && (
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-saffron/10 border border-saffron/30 px-3 py-1.5 text-xs font-bold text-saffron">
                        <Gift size={12} /> ₹{BLESSING_BOX_PRICE} — will be added to your total
                      </div>
                    )}

                    {/* ── Delivery Address (only when Blessing Box = Yes) ── */}
                    {wantBox && (
                      <div className="mt-5 rounded-xl border border-gold/30 bg-saffron/5 p-4">
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-maroon">
                          <MapPin size={14} className="text-saffron" /> Delivery Address *
                        </label>
                        <p className="text-xs text-brown/50 mb-3">
                          Your Blessing Box will be delivered to this address via courier.
                        </p>
                        <textarea
                          value={form.address}
                          onChange={set("address")}
                          rows={3}
                          placeholder="Enter your full delivery address with pincode"
                          className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 resize-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ── Proceed to Pay (desktop only — mobile uses sticky bar) ── */}
                <button onClick={handleCheckout} disabled={loading}
                  className="hidden lg:block w-full overflow-hidden rounded-full bg-gradient-to-r from-saffron to-maroon py-4 text-center text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      {t("co_processing")}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Proceed to Book — ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </button>

                {/* Trust badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  {[t("co_ssl"), t("co_razorpay"), t("co_prasad")].map((b) => (
                    <span key={b} className="rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-green-700 whitespace-nowrap">{b}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Order Summary Sidebar (both steps) ── */}
          <OrderSummary showPayButton={checkoutStep === "details"} />
        </div>
      </div>

      {/* ── Sticky bottom CTA bar (mobile only) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-ivory/95 backdrop-blur-md border-t border-gold/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-brown/50 font-medium">{t("co_total")}</span>
            <span className="text-lg font-bold text-saffron">₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
          {checkoutStep === "review" ? (
            <button
              onClick={() => setCheckoutStep("details")}
              className="flex-1 max-w-[240px] flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-saffron to-maroon py-3.5 text-[15px] font-bold text-white shadow-md transition-all active:scale-[0.97]"
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="flex-1 max-w-[240px] flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-saffron to-maroon py-3.5 text-[15px] font-bold text-white shadow-md transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t("co_processing")}
                </>
              ) : (
                <>Proceed to Book</>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Checkout;
