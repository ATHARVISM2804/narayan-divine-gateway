import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase, type PujaOffering } from "@/lib/supabase";
import { getMetaTrackingContext, trackContact, trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";
import { checkOrderPayment } from "@/lib/orderStatus";
import { loadRazorpayScript } from "@/lib/razorpayScript";
import { isInAppBrowser, isIOS } from "@/lib/browserEnv";
import { claimConfirmation, clearPendingPayment, loadPendingPayment, savePendingPayment } from "@/lib/pendingPayment";
import { checkCartAgainstCatalog } from "@/lib/cartRefresh";
import { isValidIndianMobile, normaliseIndianMobile } from "@/lib/phone";
import { ShoppingBag, Shield, ArrowLeft, Loader2, MapPin, Users, Info, Gift, ChevronRight, Check, Calendar, User, Lock, Video, Flower2 } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/context/LanguageContext";
import StorageImage from "@/components/StorageImage";
import { whatsappLink } from "@/lib/whatsapp";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/** Phone as typed or pre-filled → the 10-digit form the input expects (or digits as-is). */
const toPhoneField = (raw: unknown) =>
  normaliseIndianMobile(raw) ?? (typeof raw === "string" ? raw.replace(/\D/g, "").slice(0, 10) : "");

/* Progress steps */
const STEPS = ["co_step_review", "co_step_details", "co_step_pay"] as const;

const ProgressBar = ({ current }: { current: "review" | "details" }) => {
  const { t } = useLanguage();
  const stepIndex = current === "review" ? 0 : 1;
  return (
    <ol className="mt-4 flex items-center gap-2">
      {STEPS.map((key, i) => {
        const done = i < stepIndex;
        const active = i === stepIndex;
        return (
          <li key={key} className="flex min-w-0 items-center gap-2">
            {i > 0 && <span className={`h-px w-4 shrink-0 sm:w-8 ${done || active ? "bg-saffron" : "bg-line"}`} />}
            <span
              className={`tabular grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                done ? "bg-success text-white" : active ? "bg-saffron text-white" : "bg-surface text-ink-soft ring-1 ring-line"
              }`}
            >
              {done ? <Check size={13} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`truncate text-[13px] font-medium ${active ? "text-ink" : "text-ink-soft"}`}>{t(key)}</span>
          </li>
        );
      })}
    </ol>
  );
};

const Checkout = () => {
  const nav = useNavigate();
  const { items, totalPrice: cartTotal, clearCart, removeItem, setItemPrice } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  usePageTitle(`${t("co_title")} | Narayan Kripa`);

  /* Steps */
  const [searchParams, setSearchParams] = useSearchParams();
  const checkoutStep = searchParams.get("step") === "details" ? "details" : "review";
  const setCheckoutStep = (step: "review" | "details") => {
    setSearchParams({ step });
  };

  // Scroll to top after step change renders
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [checkoutStep]);

  /* Form (no email) */
  const [form, setForm] = useState(() => {
    try {
      const lead = JSON.parse(localStorage.getItem("nk_lead") || "{}");
      localStorage.removeItem("nk_lead");
      return { name: lead.name || "", phone: toPhoneField(lead.phone) };
    } catch {
      return { name: "", phone: "" };
    }
  });
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [gotra, setGotra] = useState("");
  const [gotraUnknown, setGotraUnknown] = useState(false);
  const [loading, setLoading] = useState(false);
  /** Pre-filled WhatsApp message offered when online booking fails. */
  const [bookingFallback, setBookingFallback] = useState<string | null>(null);
  const [wantBox, setWantBox] = useState(false);
  const [pujaOfferings, setPujaOfferings] = useState<PujaOffering[]>([]);
  const [selectedOfferings, setSelectedOfferings] = useState<Record<string, boolean>>({});

  const BLESSING_BOX_PRICE = 200;

  /* Structured delivery address (only for the Blessing Box) */
  const [addr, setAddr] = useState({ pincode: "", flat: "", area: "", landmark: "", city: "", state: "" });
  const [pinLookup, setPinLookup] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const setAddrField = (field: keyof typeof addr) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddr((prev) => ({ ...prev, [field]: e.target.value }));
  const isValidPincode = /^[1-9][0-9]{5}$/.test(addr.pincode);
  const composeAddress = () =>
    [
      addr.flat.trim(),
      addr.area.trim(),
      addr.landmark.trim() ? `Near ${addr.landmark.trim()}` : "",
      addr.city.trim(),
      addr.state.trim(),
    ].filter(Boolean).join(", ") + (addr.pincode ? ` - ${addr.pincode}` : "");
  const fieldCls = "mt-1 h-12 w-full rounded-[10px] border border-input bg-surface px-3 text-[15px] text-ink outline-none focus:border-saffron";
  const fieldLabelCls = "text-[13px] font-semibold text-ink";

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

  // Puja bookings don't ask for the name again: the name from the lead form (or the account)
  // fills Member 1 once, and the booking is under that name (or Member 1 if there was none).
  const memberPrefilled = useRef(false);
  useEffect(() => {
    if (memberPrefilled.current || !form.name.trim()) return;
    memberPrefilled.current = true;
    setMemberNames((m) => (m[0]?.trim() ? m : [form.name.trim(), ...m.slice(1)]));
  }, [form.name]);
  const customerName = form.name.trim() || (memberCount > 0 ? syncedMemberNames[0].trim() : "");

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.user_metadata?.full_name || f.name,
        phone: user.user_metadata?.phone ? toPhoneField(user.user_metadata.phone) : f.phone,
      }));
    }
  }, [user]);

  // Start fetching checkout.js now, so tapping Pay doesn't wait on it (slow mobile networks).
  useEffect(() => {
    loadRazorpayScript().catch(() => { /* retried when the customer taps Pay */ });
  }, []);

  // The cart can be days old: drop lines that can no longer be booked and refresh prices,
  // so the total shown is the total charged.
  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    checkCartAgainstCatalog(items).then((changes) => {
      if (cancelled || !changes) return;
      changes.remove.forEach((id) => removeItem(id));
      changes.reprice.forEach(({ id, price }) => setItemPrice(id, price));
      if (changes.remove.length) toast.info(t("co_cart_updated"));
      else if (changes.reprice.length) toast.info(t("co_price_updated"));
    });
    return () => { cancelled = true; };
    // Once per visit: not on every cart change this check itself makes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back from redirect-mode checkout (in-app browsers) with a failed payment.
  useEffect(() => {
    if (searchParams.get("payment") !== "failed") return;
    toast.error(t("co_retry_payment"));
    setBookingFallback(bookingWhatsappText());
    const next = new URLSearchParams(searchParams);
    next.delete("payment");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  /* Auto-fill City & State from the pincode via the India Post API (best-effort; fields stay editable) */
  useEffect(() => {
    if (!isValidPincode) { setPinLookup("idle"); return; }
    let cancelled = false;
    setPinLookup("loading");
    fetch(`https://api.postalpincode.in/pincode/${addr.pincode}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const po = data?.[0];
        if (po?.Status === "Success" && po.PostOffice?.length) {
          const { District, State } = po.PostOffice[0];
          setAddr((prev) => ({ ...prev, city: District || prev.city, state: State || prev.state }));
          setPinLookup("ok");
        } else {
          setPinLookup("fail");
        }
      })
      .catch(() => { if (!cancelled) setPinLookup("fail"); });
    return () => { cancelled = true; };
  }, [addr.pincode, isValidPincode]);

  const validateDetails = () => {
    if (memberCount === 0 && !form.name.trim()) { toast.error(t("co_err_name")); return false; }
    if (!isValidIndianMobile(form.phone)) { toast.error(t("co_err_phone_in")); return false; }
    if (memberCount > 0 && !syncedMemberNames[0].trim()) { toast.error(t("co_err_member")); return false; }
    // Panditji recites the gotra in the sankalp: ask for it, or the "I don't know" tick (Kashyap).
    if (memberCount > 0 && !gotraUnknown && !gotra.trim()) { toast.error(t("co_err_gotra")); return false; }
    if (wantBox) {
      if (!isValidPincode) { toast.error(t("co_err_pincode")); return false; }
      if (!addr.flat.trim())  { toast.error(t("co_err_flat")); return false; }
      if (!addr.area.trim())  { toast.error(t("co_err_area")); return false; }
      if (!addr.city.trim())  { toast.error(t("co_err_city")); return false; }
      if (!addr.state.trim()) { toast.error(t("co_err_state")); return false; }
    }
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
    setBookingFallback(null);

    try {
      // An earlier attempt from this browser may have been paid in the UPI app while this
      // page was reloaded. Never open a second payment for an order that's already paid.
      const pending = loadPendingPayment();
      if (pending) {
        const status = await checkOrderPayment(pending.dbOrderId);
        if (status?.status === "paid") {
          if (claimConfirmation(pending.dbOrderId)) {
            trackPurchase({ items: pending.items, value: pending.value, orderId: pending.dbOrderId, eventId: `purchase.${pending.dbOrderId}` });
            clearCart();
          }
          nav(`/order-success?id=${pending.dbOrderId}&payment=${status.razorpay_payment_id || ""}`);
          return;
        }
      }

      await loadRazorpayScript();

      const orderItems = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, category: i.category as string }));
      if (wantBox && pujaItem) {
        orderItems.push({ id: "blessing-box", name: "Narayan Kripa Blessing Box", price: BLESSING_BOX_PRICE, quantity: 1, category: "addon" });
      }
      pujaOfferings.filter(o => selectedOfferings[o.id]).forEach(o => {
        orderItems.push({ id: `offering-${o.id}`, name: o.name, price: o.price, quantity: 1, category: "offering" });
      });

      const { data: fnData, error: fnError } = await supabase.functions.invoke("create-order", {
        body: {
          items: orderItems,
          customer: {
            name: customerName,
            phone: form.phone,
            email: user?.email || undefined,
            address: wantBox ? composeAddress() : null,
            city: wantBox ? addr.city.trim() : undefined,
            state: wantBox ? addr.state.trim() : undefined,
            pincode: wantBox ? addr.pincode : undefined,
          },
          puja_details: memberCount > 0 ? { member_names: syncedMemberNames.map(n => n.trim()).filter(Boolean), gotra: gotraUnknown ? "Kashyap" : gotra.trim() } : undefined,
          // Browser identifiers so the server-side Meta events match this visitor
          tracking: getMetaTrackingContext(),
        },
      });

      if (fnError || !fnData?.order_id) {
        let errBody: { error?: string; code?: string; item_id?: string } = fnData ?? {};
        if (!errBody.error && fnError && (fnError as any).context) {
          try { errBody = await (fnError as any).context.json(); } catch {}
        }
        console.error("create-order failed:", { fnError, fnData, errBody });
        // A line in the (possibly days-old) cart can no longer be booked: drop it so the
        // customer can carry on with the rest, instead of hitting the same error again.
        if (errBody.code === "ITEM_UNAVAILABLE" && errBody.item_id) {
          const id = errBody.item_id;
          if (id.startsWith("offering-")) {
            const offeringId = id.slice("offering-".length);
            setPujaOfferings((prev) => prev.filter((o) => o.id !== offeringId));
            setSelectedOfferings((prev) => ({ ...prev, [offeringId]: false }));
          } else {
            removeItem(id);
          }
          toast.error(errBody.error || t("co_cart_updated"));
          setLoading(false);
          return;
        }
        throw new Error(errBody.error || "Failed to create order");
      }

      // Fired once the order exists so the browser event can share its event id with
      // the server-side InitiateCheckout sent by create-order: Meta counts the pair once.
      trackInitiateCheckout({
        items: orderItems.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price })),
        value: totalPrice,
        eventId: `checkout.${fnData.db_order_id}`,
      });

      const dbOrderId: string = fnData.db_order_id;
      // The server's amount is what Razorpay charges; use it for analytics too.
      const paidValue = typeof fnData.amount === "number" ? fnData.amount / 100 : totalPrice;
      const purchaseItems = orderItems.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price }));

      const onConfirmed = (paymentId: string) => {
        // Server has confirmed this is a real, paid order. The Purchase is fired here
        // rather than on /order-success so a page refresh there can never double-count.
        if (claimConfirmation(dbOrderId)) {
          trackPurchase({
            items: purchaseItems,
            value: paidValue,
            orderId: dbOrderId,
            // the server-side Purchase uses this same id, so Meta counts the pair once
            eventId: `purchase.${dbOrderId}`,
          });
          clearCart();
        }
        nav(`/order-success?id=${dbOrderId}&payment=${paymentId}`);
      };

      const inApp = isInAppBrowser();
      const options = {
        key: fnData.key_id,
        amount: fnData.amount,
        currency: "INR",
        name: "Narayan Kripa",
        description: `Order: ${items.length} item${items.length > 1 ? "s" : ""}`,
        order_id: fnData.order_id,
        // Razorpay expects the country code; without it some numbers stall the contact step.
        prefill: { name: customerName, contact: `+91${form.phone}` },
        theme: { color: "#D4891A" },
        // In-app browsers (Facebook / Instagram / WhatsApp) often reload or kill this page
        // while the customer is in their UPI app, so the handler below never runs. There,
        // Razorpay posts the result to our server instead, which redirects back to the site.
        ...(inApp && import.meta.env.VITE_SUPABASE_URL
          ? {
              redirect: true,
              callback_url:
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-callback` +
                `?db=${encodeURIComponent(dbOrderId)}&o=${encodeURIComponent(window.location.origin)}`,
            }
          : {}),
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                db_order_id: dbOrderId,
              },
            });
            if (verifyError || !verifyData?.success) throw new Error("Payment verification failed");
            onConfirmed(response.razorpay_payment_id);
          } catch {
            // The money may already be with Razorpay even though our call failed (flaky
            // mobile network, killed tab). Ask the server to check with Razorpay directly;
            // never send the customer back to pay a second time.
            const status = await checkOrderPayment(dbOrderId);
            if (status?.status === "paid") {
              onConfirmed(status.razorpay_payment_id || response.razorpay_payment_id);
              return;
            }
            // Still unconfirmed: the success page keeps polling; the cart stays intact
            // until the payment is confirmed.
            nav(`/order-success?id=${dbOrderId}&status=checking`);
          }
        },
        modal: {
          ondismiss: async () => {
            // On mobile UPI the customer can complete the payment in their UPI app and
            // then close the popup: that is not a cancellation. Check before saying so.
            // (The pending-payment record stays: a UPI payment can still land a little later.)
            const status = await checkOrderPayment(dbOrderId);
            if (status?.status === "paid") {
              onConfirmed(status.razorpay_payment_id || "");
              return;
            }
            setLoading(false);
            toast.info(t("co_payment_cancelled"));
            if (inApp) setBookingFallback(bookingWhatsappText());
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        // Razorpay keeps the modal open so the customer can retry another method.
        console.warn("razorpay payment.failed", response?.error?.code, response?.error?.reason, response?.error?.description);
        toast.error(response.error?.description || t("co_payment_failed"));
        setLoading(false);
        if (inApp) setBookingFallback(bookingWhatsappText());
      });
      // Remember this order before handing over to Razorpay: if this page is reloaded while
      // the customer is in their UPI app, the app checks it on return (usePendingPaymentRecovery).
      savePendingPayment({ dbOrderId, value: paidValue, items: purchaseItems, createdAt: Date.now() });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || t("co_err_generic"));
      setLoading(false);
      // Online booking failed (server down, network, payment script blocked);
      // don't lose the customer: offer a pre-filled WhatsApp booking.
      setBookingFallback(bookingWhatsappText());
    }
  };

  const bookingWhatsappText = () => {
    const lines = [t("wa_msg_checkout")];
    items.forEach((i) => lines.push(`• ${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}${i.description ? `: ${i.description}` : ""}`));
    if (customerName) lines.push(`Name: ${customerName}`);
    if (form.phone.trim()) lines.push(`Phone: ${form.phone.trim()}`);
    lines.push(`Total: ₹${totalPrice.toLocaleString("en-IN")}`);
    return lines.join("\n");
  };

  const WhatsAppFallback = ({ className = "", showHint = false }: { className?: string; showHint?: boolean }) =>
    bookingFallback ? (
      <>
        <a
          href={whatsappLink(bookingFallback)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContact("whatsapp_checkout_failed")}
          className={`min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#25D366] text-center text-sm font-semibold text-white ${className}`}
        >
          {t("book_whatsapp")}
        </a>
        {/* In-app browsers block card / netbanking pages; a real browser usually works. */}
        {showHint && isInAppBrowser() && (
          <p className="mb-2 text-center text-xs leading-snug text-ink-soft">
            {t(isIOS() ? "co_inapp_hint_ios" : "co_inapp_hint_android")}
          </p>
        )}
      </>
    ) : null;

  /* Empty cart */
  if (items.length === 0) {
    return (
      <main className="container flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-muted text-maroon">
          <ShoppingBag size={26} strokeWidth={1.75} />
        </span>
        <h1 className="mt-4 text-[22px] font-bold text-ink">{t("co_empty_title")}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t("co_empty_sub")}</p>
        <Link to="/puja" className="btn-primary mt-6">
          {t("co_browse")}
        </Link>
      </main>
    );
  }

  const selectedOfferingList = pujaOfferings.filter((o) => selectedOfferings[o.id]);
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const card = "rounded-xl border border-line bg-surface p-4 sm:p-5";
  const sectionTitle = "text-base font-semibold text-ink";
  const TrustBadges = () => (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
      {[
        { Icon: Lock, label: t("co_ssl") },
        { Icon: Shield, label: t("co_razorpay") },
        { Icon: Video, label: t("trust_video") },
      ].map(({ Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-muted">
          <Icon size={15} strokeWidth={1.75} className="text-success" /> {label}
        </li>
      ))}
    </ul>
  );

  /* Order summary (both steps). On laptops the one Pay button sits under the form,
     next to any field errors, so the summary only carries the totals. */
  const OrderSummary = () => (
    <aside className="h-fit rounded-xl border border-line bg-surface p-4 sm:p-5 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-ink">{t("co_summary")}</h2>
      <ul className="mt-4 space-y-2.5 border-b border-line pb-4 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span className="min-w-0 break-words text-ink-muted">
              {item.name} {item.quantity > 1 && <span className="text-ink-soft">x {item.quantity}</span>}
            </span>
            <span className="tabular shrink-0 font-medium text-ink">{inr(item.price * item.quantity)}</span>
          </li>
        ))}
        {selectedOfferingList.map((off) => (
          <li key={off.id} className="flex justify-between gap-3">
            <span className="min-w-0 text-ink-muted">{off.name}</span>
            <span className="tabular shrink-0 font-medium text-ink">{inr(off.price)}</span>
          </li>
        ))}
        {wantBox && pujaItem && (
          <li className="flex justify-between gap-3">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <Gift size={14} className="text-saffron-dark" /> {t("co_box_name")}
            </span>
            <span className="tabular shrink-0 font-medium text-ink">{inr(BLESSING_BOX_PRICE)}</span>
          </li>
        )}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-base font-semibold text-ink">{t("co_total")}</span>
        <span className="tabular text-2xl font-bold text-saffron-dark">{inr(totalPrice)}</span>
      </div>
      <p className="mt-4 hidden border-t border-line pt-4 text-center text-xs text-ink-soft lg:block">{t("co_powered")}</p>
    </aside>
  );

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-surface-muted/60">
        <div className="container py-4 sm:py-6">
          <button
            onClick={() => (checkoutStep === "review" ? nav("/cart") : setCheckoutStep("review"))}
            className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} /> {checkoutStep === "review" ? t("co_back") : t("co_back_review")}
          </button>
          <h1 className="flex items-center gap-2 text-[22px] font-bold text-ink md:text-[28px]">
            {t("co_title")} <Lock size={18} className="text-success" />
          </h1>
          <ProgressBar current={checkoutStep} />
        </div>
      </header>

      <div className="container py-6 pb-32 sm:py-8 lg:pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          {/* Step 1: review */}
          {checkoutStep === "review" && (
            <div className="space-y-4">
              {pujaItem && (
                <div className={card}>
                  <div className="flex items-start gap-4">
                    {pujaItem.image && (
                      <StorageImage src={pujaItem.image} width={80} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold leading-snug text-ink sm:text-base">{pujaItem.name}</h3>
                      {pujaItem.description && (
                        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-soft">
                          <Calendar size={13} className="shrink-0" /> {pujaItem.description}
                        </p>
                      )}
                      <p className="tabular mt-2 text-lg font-bold text-saffron-dark">{inr(pujaItem.price)}</p>
                    </div>
                  </div>
                </div>
              )}

              {items
                .filter((i) => i.category === "chadhava")
                .map((item) => (
                  <div key={item.id} className={card}>
                    <div className="flex items-start gap-4">
                      {item.image && (
                        <StorageImage src={item.image} width={80} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold text-ink sm:text-base">{item.name}</h3>
                        {item.description && <p className="mt-1 text-[13px] text-ink-soft">{item.description}</p>}
                        <p className="tabular mt-2 text-lg font-bold text-saffron-dark">
                          {inr(item.price)} {item.quantity > 1 && <span className="text-sm font-medium text-ink-soft">x {item.quantity}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

              {pujaItem && pujaOfferings.length > 0 && (
                <div className={card}>
                  <h3 className={sectionTitle}>{t("co_add_more_t")}</h3>
                  <p className="mb-4 mt-0.5 text-sm text-ink-muted">{t("co_add_more_d")}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {pujaOfferings.map((off) => {
                      const isSelected = !!selectedOfferings[off.id];
                      return (
                        <button
                          key={off.id}
                          onClick={() => toggleOffering(off.id)}
                          aria-pressed={isSelected}
                          className={`flex items-start gap-3 rounded-[10px] border-2 p-3 text-left transition-colors ${
                            isSelected ? "border-saffron bg-saffron-soft" : "border-line bg-surface hover:border-saffron/40"
                          }`}
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                            {off.image_url ? (
                              <StorageImage src={off.image_url} width={48} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="grid h-full w-full place-items-center text-ink-soft">
                                <Flower2 size={20} />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-ink">{off.name}</p>
                              <span
                                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                                  isSelected ? "border-saffron bg-saffron text-white" : "border-input bg-surface"
                                }`}
                              >
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </span>
                            </div>
                            {off.description && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{off.description}</p>}
                            <p className="tabular mt-1 text-sm font-bold text-saffron-dark">{inr(off.price)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {offeringsTotal > 0 && (
                    <p className="mt-3 flex items-center justify-between rounded-[10px] bg-saffron-soft px-3.5 py-2 text-sm">
                      <span className="font-medium text-ink-muted">
                        {selectedOfferingList.length} {t("co_offerings_selected")}
                      </span>
                      <span className="tabular font-bold text-saffron-dark">+{inr(offeringsTotal)}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Laptops already show these lines in the order summary beside it. */}
              <div className={`${card} lg:hidden`}>
                <h3 className={`${sectionTitle} mb-3`}>{t("co_bill")}</h3>
                <ul className="space-y-2.5 text-sm">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span className="text-ink-muted">{item.name}</span>
                      <span className="tabular shrink-0 font-medium text-ink">{inr(item.price * item.quantity)}</span>
                    </li>
                  ))}
                  {selectedOfferingList.map((off) => (
                    <li key={off.id} className="flex justify-between gap-3">
                      <span className="text-ink-muted">{off.name}</span>
                      <span className="tabular shrink-0 font-medium text-ink">{inr(off.price)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-base font-semibold text-ink">{t("co_total_amount")}</span>
                  <span className="tabular text-xl font-bold text-saffron-dark">{inr(totalPrice)}</span>
                </div>
              </div>

              <button onClick={() => setCheckoutStep("details")} className="btn-primary hidden w-full lg:flex">
                {t("btn_continue")} <ChevronRight size={18} />
              </button>
              <TrustBadges />
            </div>
          )}

          {/* Step 2: details */}
          {checkoutStep === "details" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ink">{pujaItem ? t("co_details_puja") : t("co_details_generic")}</h2>

              {memberCount === 0 && (
                <div className={card}>
                  <label htmlFor="co-name" className={`${sectionTitle} flex items-center gap-2`}>
                    <User size={18} className="text-saffron-dark" /> {t("co_your_name")}
                  </label>
                  <p className="mb-3 mt-0.5 text-sm text-ink-muted">{t("co_your_name_sub")}</p>
                  <input
                    id="co-name"
                    value={form.name}
                    onChange={set("name")}
                    type="text"
                    autoComplete="name"
                    placeholder={t("co_your_name_ph")}
                    className={fieldCls}
                  />
                </div>
              )}

              <div className={card}>
                <label htmlFor="co-phone" className={sectionTitle}>
                  {t("co_wa_title")}
                </label>
                <p className="mb-3 mt-0.5 text-sm text-ink-muted">{t("co_wa_sub")}</p>
                <div className="flex items-center gap-2 rounded-[10px] border border-input bg-surface px-3 focus-within:border-saffron">
                  <span className="text-[15px] font-semibold text-ink-soft">+91</span>
                  <input
                    id="co-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder={t("co_wa_ph")}
                    className="h-12 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-soft/70"
                  />
                  {form.phone.length === 10 && <Check size={18} className="shrink-0 text-success" />}
                </div>
              </div>

              {memberCount > 0 && (
                <div className={card}>
                  <h3 className={`${sectionTitle} flex items-center gap-2`}>
                    <Users size={18} className="text-saffron-dark" /> {t("co_member_names")}
                  </h3>
                  <p className="mb-3 mt-0.5 text-sm text-ink-muted">{t("co_member_sub")}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {syncedMemberNames.map((val, idx) => (
                      <div key={idx}>
                        <label htmlFor={`co-member-${idx}`} className={fieldLabelCls}>
                          {`${t("co_member_ph")} ${idx + 1}`}
                          {idx === 0 && " *"}
                        </label>
                        <input
                          id={`co-member-${idx}`}
                          value={val}
                          onChange={(e) => {
                            const updated = [...syncedMemberNames];
                            updated[idx] = e.target.value;
                            setMemberNames(updated);
                          }}
                          placeholder={`${t("co_member_ph")} ${idx + 1}`}
                          className={fieldCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {memberCount > 0 && (
                <div className={card}>
                  <label htmlFor="co-gotra" className={`${sectionTitle} flex items-center gap-2`}>
                    <Info size={18} className="text-saffron-dark" /> {t("co_gotra")}
                  </label>
                  <p className="mb-3 mt-0.5 text-sm text-ink-muted">{t("co_gotra_sub")}</p>
                  <input
                    id="co-gotra"
                    value={gotraUnknown ? "Kashyap" : gotra}
                    onChange={(e) => {
                      if (!gotraUnknown) setGotra(e.target.value);
                    }}
                    disabled={gotraUnknown}
                    placeholder={t("co_gotra_ph")}
                    className={`${fieldCls} ${gotraUnknown ? "cursor-not-allowed bg-surface-muted text-ink-soft" : ""}`}
                  />
                  <label className="mt-3 flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={gotraUnknown}
                      onChange={(e) => handleGotraUnknown(e.target.checked)}
                      className="h-5 w-5 rounded accent-saffron"
                    />
                    <span className="text-sm font-medium text-ink">{t("co_gotra_unknown")}</span>
                  </label>
                </div>
              )}

              {pujaItem && (
                <div className={card}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron-soft text-saffron-dark">
                        <Gift size={20} strokeWidth={1.75} />
                      </span>
                      <div>
                        <h3 className={sectionTitle}>{t("co_box_q")}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t("co_box_d")}</p>
                      </div>
                    </div>
                    <div className="grid shrink-0 grid-cols-2 overflow-hidden rounded-[10px] border border-line" role="radiogroup" aria-label={t("co_box_q")}>
                      <button
                        role="radio"
                        aria-checked={wantBox}
                        onClick={() => setWantBox(true)}
                        className={`min-h-[44px] px-5 text-sm font-semibold transition-colors ${wantBox ? "bg-saffron text-white" : "bg-surface text-ink-muted hover:bg-surface-muted"}`}
                      >
                        {t("co_yes")}
                      </button>
                      <button
                        role="radio"
                        aria-checked={!wantBox}
                        onClick={() => setWantBox(false)}
                        className={`min-h-[44px] border-l border-line px-5 text-sm font-semibold transition-colors ${!wantBox ? "bg-ink text-white" : "bg-surface text-ink-muted hover:bg-surface-muted"}`}
                      >
                        {t("co_no")}
                      </button>
                    </div>
                  </div>

                  {wantBox && (
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-saffron-soft px-2.5 py-1 text-sm font-semibold text-saffron-dark">
                      <Gift size={14} /> {inr(BLESSING_BOX_PRICE)} {t("co_box_added")}
                    </p>
                  )}

                  {wantBox && (
                    <div className="mt-4 border-t border-line pt-4">
                      <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                        <MapPin size={16} className="text-saffron-dark" /> {t("co_addr_title")} *
                      </p>
                      <p className="mb-3 mt-0.5 text-sm text-ink-muted">{t("co_addr_sub")}</p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <label htmlFor="co-pin" className={fieldLabelCls}>{t("co_pin")} *</label>
                          <input
                            id="co-pin"
                            value={addr.pincode}
                            onChange={(e) => setAddr((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={6}
                            placeholder={t("co_pin_ph")}
                            className={fieldCls}
                          />
                          {pinLookup === "loading" && <p className="mt-1 text-xs text-ink-soft">{t("co_pin_loading")}</p>}
                          {pinLookup === "ok" && <p className="mt-1 text-xs font-medium text-success">{t("co_pin_ok")}</p>}
                          {pinLookup === "fail" && addr.pincode.length === 6 && <p className="mt-1 text-xs font-medium text-destructive">{t("co_pin_fail")}</p>}
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label htmlFor="co-flat" className={fieldLabelCls}>{t("co_flat")} *</label>
                          <input id="co-flat" value={addr.flat} onChange={setAddrField("flat")} placeholder={t("co_flat_ph")} className={fieldCls} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="co-area" className={fieldLabelCls}>{t("co_area")} *</label>
                          <input id="co-area" value={addr.area} onChange={setAddrField("area")} placeholder={t("co_area_ph")} className={fieldCls} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="co-landmark" className={fieldLabelCls}>
                            {t("co_landmark")} <span className="font-normal text-ink-soft">({t("co_optional")})</span>
                          </label>
                          <input id="co-landmark" value={addr.landmark} onChange={setAddrField("landmark")} placeholder={t("co_landmark_ph")} className={fieldCls} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label htmlFor="co-city" className={fieldLabelCls}>{t("co_city")} *</label>
                          <input id="co-city" value={addr.city} onChange={setAddrField("city")} autoComplete="address-level2" className={fieldCls} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label htmlFor="co-state" className={fieldLabelCls}>{t("co_state")} *</label>
                          <input id="co-state" value={addr.state} onChange={setAddrField("state")} autoComplete="address-level1" className={fieldCls} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleCheckout} disabled={loading} className="btn-primary hidden w-full lg:flex">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> {t("co_processing")}
                  </>
                ) : (
                  <>
                    <Lock size={16} /> {t("co_pay")} {inr(totalPrice)} {t("co_pay_securely")}
                  </>
                )}
              </button>
              <WhatsAppFallback className="hidden w-full lg:flex" />
              <TrustBadges />
            </div>
          )}

          <OrderSummary />
        </div>
      </div>

      {/* Sticky bottom bar (phones) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 py-2.5 shadow-raised lg:hidden" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
        {checkoutStep === "details" && <WhatsAppFallback className="mb-2 flex w-full" showHint />}
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="block text-xs text-ink-soft">{t("co_total")}</span>
            <span className="tabular block text-lg font-bold text-ink">{inr(totalPrice)}</span>
          </div>
          {checkoutStep === "review" ? (
            <button onClick={() => setCheckoutStep("details")} className="btn-primary flex-1 sm:max-w-[260px]">
              {t("btn_continue")} <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleCheckout} disabled={loading} className="btn-primary flex-1 sm:max-w-[260px]">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> {t("co_processing")}
                </>
              ) : (
                <>
                  <Lock size={16} /> {t("co_proceed_book")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Checkout;
