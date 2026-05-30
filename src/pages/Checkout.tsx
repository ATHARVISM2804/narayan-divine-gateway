import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase, type PujaOffering } from "@/lib/supabase";
import { ShoppingBag, Shield, ArrowLeft, Loader2, User, Mail, Phone, MapPin, Users, Info, Gift } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
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

const Checkout = () => {
  usePageTitle("Checkout — Narayan Kripa");
  const nav = useNavigate();
  const { items, totalPrice: cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState(() => {
    // Pre-fill from lead capture modal if available
    try {
      const lead = JSON.parse(localStorage.getItem("nk_lead") || "{}");
      localStorage.removeItem("nk_lead"); // consume it
      return { name: lead.name || "", email: "", phone: lead.phone || "", address: "" };
    } catch {
      return { name: "", email: "", phone: "", address: "" };
    }
  });
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [gotra, setGotra] = useState("");
  const [gotraUnknown, setGotraUnknown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "paying">("form");
  const [wantBox, setWantBox] = useState(false);
  const [pujaOfferings, setPujaOfferings] = useState<PujaOffering[]>([]);
  const [selectedOfferings, setSelectedOfferings] = useState<Record<string, boolean>>({});

  const BLESSING_BOX_PRICE = 200;

  // Detect member count from puja items in cart
  const pujaItem = items.find(i => i.category === "puja");
  const getMemberCount = (): number => {
    if (!pujaItem) return 0;
    const n = pujaItem.name.toLowerCase();
    if (n.includes("6") || n.includes("joint")) return 6;
    if (n.includes("4") || n.includes("family")) return 4;
    if (n.includes("couple") || n.includes("2")) return 2;
    if (n.includes("single") || n.includes("individual") || n.includes("1")) return 1;
    return 1;
  };
  const memberCount = getMemberCount();

  // Extract puja UUID from cart item id (format: "puja-{uuid}-{label}")
  const pujaId = pujaItem ? pujaItem.id.replace(/^puja-/, "").replace(/-[^-]+$/, "") : null;

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

  // Total includes blessing box + selected offerings
  const totalPrice = cartTotal + (wantBox && pujaItem ? BLESSING_BOX_PRICE : 0) + offeringsTotal;

  // Sync memberNames array length when memberCount changes
  const syncedMemberNames = Array.from({ length: memberCount }, (_, i) => memberNames[i] || "");

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
    if (!form.name.trim()) { toast.error(t("co_err_name")); return false; }
    if (form.email.trim() && !form.email.includes("@")) { toast.error(t("co_err_email")); return false; }
    if (!form.phone.trim() || form.phone.length < 10) { toast.error(t("co_err_phone")); return false; }
    if (memberCount > 0 && !syncedMemberNames[0].trim()) { toast.error("Please enter at least the first member's name"); return false; }
    return true;
  };

  const handleGotraUnknown = (checked: boolean) => {
    setGotraUnknown(checked);
    if (checked) setGotra("Kashyap");
    else setGotra("");
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    if (items.length === 0) { toast.error(t("co_err_empty")); return; }

    setLoading(true);
    setStep("paying");

    try {
      // Load Razorpay script on demand (only on first checkout)
      await loadRazorpayScript();

      const orderItems = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, category: i.category }));
      if (wantBox && pujaItem) {
        orderItems.push({ id: "blessing-box", name: "Narayan Kripa Blessing Box", price: BLESSING_BOX_PRICE, quantity: 1, category: "addon" });
      }
      // Add selected puja offerings
      pujaOfferings.filter(o => selectedOfferings[o.id]).forEach(o => {
        orderItems.push({ id: `offering-${o.id}`, name: o.name, price: o.price, quantity: 1, category: "offering" });
      });

      const { data: fnData, error: fnError } = await supabase.functions.invoke("create-order", {
        body: {
          items: orderItems,
          customer: { name: form.name, email: form.email.trim() || null, phone: form.phone, address: form.address },
          puja_details: memberCount > 0 ? { member_names: syncedMemberNames.filter(n => n.trim()), gotra: gotraUnknown ? "Kashyap" : gotra } : undefined,
        },
      });

      if (fnError || !fnData?.order_id) {
        throw new Error(fnData?.error || "Failed to create order");
      }

      const options = {
        key: fnData.key_id,
        amount: fnData.amount,
        currency: "INR",
        name: "Narayan Kripa",
        description: `Order: ${items.length} item${items.length > 1 ? "s" : ""}`,
        order_id: fnData.order_id,
        prefill: { name: form.name, ...(form.email.trim() && { email: form.email }), contact: form.phone },
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
            setStep("form");
          }
        },
        modal: {
          ondismiss: () => { setLoading(false); setStep("form"); toast.info("Payment cancelled"); },
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
          <h1 className="font-display text-3xl text-maroon">{t("co_empty_title")}</h1>
          <p className="mt-3 text-brown/60">{t("co_empty_sub")}</p>
          <Link to="/puja" className="mt-6 inline-block rounded-full bg-saffron px-7 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors">
            {t("co_browse")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="bg-gradient-to-r from-maroon via-maroon-deep to-maroon py-10">
        <div className="container">
          <Link to="/cart" className="inline-flex items-center gap-2 text-gold/80 hover:text-gold text-sm mb-3 transition-colors">
            <ArrowLeft size={14} /> {t("co_back")}
          </Link>
          <h1 className="font-display text-3xl text-gold md:text-4xl flex items-center gap-3">
            <Shield size={28} /> {t("co_title")}
          </h1>
          <p className="mt-1 font-serif italic text-cream/70">{t("co_subtitle")}</p>
        </div>
      </div>

      <div className="container py-6 sm:py-10 pb-10">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border border-gold/40 bg-ivory p-4 sm:p-6 md:p-8 shadow-soft">
            <h2 className="font-display text-xl text-maroon mb-6">{t("co_details")}</h2>
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                  <User size={13} /> {t("co_name")} *
                </label>
                <input value={form.name} onChange={set("name")} type="text" required placeholder={t("co_ph_name")}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20" />
              </div>

              {/* Email + Phone */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                    <Mail size={13} /> {t("co_email")} <span className="text-brown/40 normal-case font-medium">({t("co_optional")})</span>
                  </label>
                  <input value={form.email} onChange={set("email")} type="email" placeholder={t("co_ph_email")}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                    <Phone size={13} /> {t("co_phone")} *
                  </label>
                  <input value={form.phone} onChange={set("phone")} type="tel" required placeholder={t("co_ph_phone")}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                  <MapPin size={13} /> {t("co_address")}
                </label>
                <textarea value={form.address} onChange={set("address")} rows={3} placeholder={t("co_ph_address")}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 resize-none" />
              </div>

              {/* Member Names — only for puja items */}
              {memberCount > 0 && (
                <div className="rounded-xl border border-gold/30 bg-saffron/5 p-4">
                  <div className="flex items-start gap-2 mb-1">
                    <Users size={15} className="text-saffron mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-maroon">{t("co_member_names")}</p>
                      <p className="text-xs text-brown/60 mt-0.5">{t("co_member_sub")}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
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

              {/* Gotra — only for puja items */}
              {memberCount > 0 && (
                <div className="rounded-xl border border-gold/30 bg-amber-50/50 p-4">
                  <div className="flex items-start gap-2 mb-1">
                    <Info size={15} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-maroon">{t("co_gotra")}</p>
                      <p className="text-xs text-brown/60 mt-0.5">{t("co_gotra_sub")}</p>
                    </div>
                  </div>
                  <input
                    value={gotraUnknown ? "Kashyap" : gotra}
                    onChange={(e) => { if (!gotraUnknown) setGotra(e.target.value); }}
                    disabled={gotraUnknown}
                    placeholder={t("co_gotra_ph")}
                    className={`mt-3 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
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

              {/* ── Add More Offerings ── */}
              {pujaItem && pujaOfferings.length > 0 && (
                <div className="rounded-xl border-2 border-gold/30 bg-gradient-to-b from-ivory to-cream p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="shrink-0 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-saffron to-maroon text-white shadow-md">
                      🌺
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-maroon leading-snug">Add More Offerings</h3>
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

              {/* ── Narayan Kripa Blessing Box ── */}
              {pujaItem && (
                <div className="rounded-xl border-2 border-saffron/30 bg-gradient-to-r from-saffron/5 via-gold/5 to-saffron/5 p-4 sm:p-5 overflow-hidden">
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
                          The Blessing Box contains divine elements — Ganga Jal, Prasad, Sacred Thread (Mauli), and Kumkum — sourced from sacred Tirth locations.
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

                  {/* Box contents preview (when Yes) */}
                  {wantBox && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        { icon: "💧", name: "Ganga Jal" },
                        { icon: "🙏", name: "Prasad" },
                        { icon: "📿", name: "Sacred Thread" },
                        { icon: "🔴", name: "Kumkum" },
                      ].map((item) => (
                        <span key={item.name} className="flex items-center gap-1.5 rounded-full bg-white border border-gold/30 px-3 py-1.5 text-xs font-semibold text-maroon shadow-sm">
                          {item.icon} {item.name}
                        </span>
                      ))}
                      <span className="flex items-center gap-1.5 rounded-full bg-saffron/10 border border-saffron/30 px-3 py-1.5 text-xs font-bold text-saffron">
                        ₹{BLESSING_BOX_PRICE}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {[t("co_ssl"), t("co_razorpay"), t("co_prasad")].map((b) => (
                <span key={b} className="rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-green-700 whitespace-nowrap">{b}</span>
              ))}
            </div>
          </div>

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
            </div>
            <div className="flex justify-between items-center pt-5 mb-6">
              <span className="font-display text-lg text-maroon">{t("co_total")}</span>
              <span className="font-sans text-2xl font-bold text-saffron">₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <button onClick={handleCheckout} disabled={loading}
              className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-saffron to-maroon py-4 text-center text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {step === "paying" ? t("co_processing") : t("co_creating")}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t("co_pay")} ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </button>
            <p className="mt-4 text-center text-[11px] text-brown/60 font-serif italic">{t("co_powered")}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
