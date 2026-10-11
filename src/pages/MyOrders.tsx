import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase } from "@/lib/supabase";
import { checkOrderPayment } from "@/lib/orderStatus";
import { orderItemWhen } from "@/lib/orderItems";
import { CalendarDays, Check, ChevronRight, CircleCheck, CircleX, Clock, LogOut, MessageCircle, Phone, RefreshCw, Search, ShoppingBag } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import BottomSheet from "@/components/shared/BottomSheet";
import { useLanguage } from "@/context/LanguageContext";
import { LoadError } from "@/components/LoadError";

interface Order {
  id: string;
  razorpay_payment_id: string | null;
  customer_name: string;
  customer_email: string | null;
  amount: number;
  status: string;
  items: any[];
  created_at: string;
}

const statusColors: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-saffron-soft text-saffron-dark",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-surface-muted text-ink-soft",
  cancelled: "bg-surface-muted text-ink-soft",
};

const MyOrders = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const nav = useNavigate();
  const { t } = useLanguage();
  usePageTitle(`${t("mo_title")} | Narayan Kripa`);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [ordersFailed, setOrdersFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [checking, setChecking] = useState(false);
  const [checkedStillPending, setCheckedStillPending] = useState(false);

  /* Ask the server to confirm a pending order with Razorpay (covers payments the browser missed). */
  const handleCheckPayment = async (order: Order) => {
    setChecking(true);
    setCheckedStillPending(false);
    const status = await checkOrderPayment(order.id);
    setChecking(false);
    if (status?.status === "paid") {
      const updated = { ...order, status: "paid", razorpay_payment_id: status.razorpay_payment_id };
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      setDetail(updated);
    } else {
      setCheckedStillPending(true);
    }
  };

  // For logged-in users: auto-fetch orders
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const fetchOrders = async () => {
      // Try matching by email or phone
      const queries = [];
      if (user.email) {
        queries.push(
          supabase.from("orders").select("*").eq("customer_email", user.email).order("created_at", { ascending: false })
        );
      }
      if (user.user_metadata?.phone) {
        queries.push(
          supabase.from("orders").select("*").eq("customer_phone", user.user_metadata.phone).order("created_at", { ascending: false })
        );
      }
      // If user has phone from auth
      if (user.phone) {
        queries.push(
          supabase.from("orders").select("*").eq("customer_phone", user.phone).order("created_at", { ascending: false })
        );
      }

      const results = await Promise.all(queries);
      const allOrders = results.flatMap((r) => r.data || []);
      // A failed request must not read as "you have no orders".
      if (allOrders.length === 0 && results.some((r) => r.error)) {
        setOrdersFailed(true);
        setLoading(false);
        return;
      }
      setOrdersFailed(false);
      // Deduplicate by id
      const unique = Array.from(new Map(allOrders.map((o) => [o.id, o])).values()) as Order[];
      unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(unique);
      setLoading(false);
      setLookupDone(true);
    };

    fetchOrders();
  }, [user, reloadKey]);

  // Phone lookup for guests
  const handlePhoneLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    const phone = lookupPhone.trim();
    if (!phone || phone.length < 10) {
      setLookupError(t("co_err_phone"));
      return;
    }
    setLoading(true);
    setLookupDone(false);

    try {
      const { data, error } = await supabase.functions.invoke("lookup-orders", {
        body: { phone },
      });

      if (error || !data?.orders) {
        setLookupError(t("contact_err_generic"));
        setLoading(false);
        return;
      }
      setOrders(data.orders as Order[]);
    } catch {
      setLookupError(t("contact_err_generic"));
    }
    setLoading(false);
    setLookupDone(true);
  };

  const handleLogout = async () => {
    await signOut();
    nav("/");
  };

  if (authLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-saffron" role="status" aria-label="Loading" />
      </main>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const statusLabel = (s: string) => t(`mo_st_${s}`) || s;
  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${statusColors[status] || "bg-surface-muted text-ink-soft"}`}>
      {statusLabel(status)}
    </span>
  );

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-surface-muted/60">
        <div className="container py-6 md:py-10 lg:py-12">
          {user ? (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[22px] font-bold text-ink md:text-[28px] lg:text-4xl">{t("mo_title")}</h1>
                <p className="mt-1 truncate text-[15px] text-ink-muted">
                  {userName}
                  {(user.email || user.phone) && <span className="text-ink-soft"> · {user.email || user.phone}</span>}
                </p>
              </div>
              <button onClick={handleLogout} className="btn-secondary min-h-[40px] shrink-0 px-4 text-sm">
                <LogOut size={16} /> {t("mo_logout")}
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-[22px] font-bold text-ink md:text-[28px] lg:text-4xl">{t("mo_track_title")}</h1>
              <p className="mt-1 text-[15px] text-ink-muted">{t("mo_track_sub")}</p>
            </>
          )}
        </div>
      </header>

      {/* Laptops: bookings on the left (aligned with the header), help on the right. */}
      <div className="container max-w-3xl py-6 md:py-10 lg:grid lg:max-w-[1400px] lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12">
        <div className="min-w-0">
          {!user && (
            <div className="mb-6 rounded-xl border border-line bg-surface p-4 md:p-6">
              <h2 className="text-lg font-bold text-ink">{t("mo_lookup_title")}</h2>
              <p className="mt-0.5 text-sm text-ink-muted">{t("mo_lookup_sub")}</p>
              <form onSubmit={handlePhoneLookup} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <label className="flex flex-1 items-center gap-2 rounded-[10px] border border-input bg-surface px-3 focus-within:border-saffron">
                  <Phone size={16} className="shrink-0 text-ink-soft" />
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder={t("co_ph_phone")}
                    aria-label={t("co_phone")}
                    className="h-12 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-soft/70"
                  />
                </label>
                <button type="submit" disabled={loading} className="btn-primary">
                  <Search size={16} /> {t("mo_lookup_btn")}
                </button>
              </form>
              {lookupError && <p className="mt-3 text-sm font-medium text-destructive">{lookupError}</p>}
              <p className="mt-4 text-center text-sm text-ink-soft">
                {t("mo_or")}{" "}
                <Link to="/login" className="font-semibold text-saffron-dark hover:underline">
                  {t("mo_login_link")}
                </Link>
              </p>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-muted" />
              ))}
            </div>
          ) : user && ordersFailed ? (
            <LoadError onRetry={() => setReloadKey((k) => k + 1)} />
          ) : lookupDone && orders.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface p-10 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-muted text-maroon">
                <ShoppingBag size={22} strokeWidth={1.75} />
              </span>
              <h3 className="mt-3 text-lg font-bold text-ink">{t("mo_empty_title")}</h3>
              <p className="mt-1 text-sm text-ink-muted">{t("mo_empty_sub")}</p>
              <Link to="/puja" className="btn-primary mt-5">
                {t("mo_browse")}
              </Link>
            </div>
          ) : lookupDone ? (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => setDetail(o)}
                    className="flex w-full items-center gap-4 rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-saffron/40"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-muted text-maroon">
                      {o.status === "paid" ? <CircleCheck size={20} className="text-success" /> : o.status === "pending" ? <Clock size={20} /> : <CircleX size={20} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={o.status} />
                        <span className="text-xs text-ink-soft">
                          {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-[15px] font-medium text-ink">
                        {(o.items || []).map((item: any) => item.name).join(", ")}
                      </span>
                      {(o.items || [])
                        .map((item: any) => orderItemWhen(item))
                        .filter(Boolean)
                        .map((when, idx) => (
                          <span key={idx} className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-soft">
                            <CalendarDays size={12} /> {when}
                          </span>
                        ))}
                    </span>
                    <span className="tabular shrink-0 text-base font-bold text-ink">₹{(o.amount / 100).toLocaleString("en-IN")}</span>
                    <ChevronRight size={18} className="shrink-0 text-ink-soft" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <aside className="hidden rounded-xl border border-line bg-surface p-6 lg:block">
          <h2 className="text-lg font-bold text-ink">{t("mo_help_title")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t("mo_help_sub")}</p>
          <div className="mt-4 grid gap-2">
            <a href={whatsappLink(t("wa_msg_book"))} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a href="tel:+919286345941" className="btn-secondary">
              <Phone size={18} /> {t("ct_phone_text")}
            </a>
          </div>
          <h3 className="mt-6 border-t border-line pt-5 text-sm font-semibold text-ink">{t("mo_help_see")}</h3>
          <ul className="mt-3 space-y-2.5">
            {[t("mo_help_p1"), t("mo_help_p2"), t("mo_help_p3")].map((line) => (
              <li key={line} className="flex items-start gap-2 text-sm text-ink-muted">
                <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-success" /> {line}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <BottomSheet
        open={!!detail}
        onClose={() => {
          setDetail(null);
          setCheckedStillPending(false);
        }}
        title={t("mo_details")}
      >
        {detail && (
          <div className="space-y-4 p-5 text-sm">
            <h3 className="pr-8 text-lg font-bold text-ink">{t("mo_details")}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs text-ink-soft">{t("mo_status")}</p>
                <StatusBadge status={detail.status} />
              </div>
              <div>
                <p className="mb-1 text-xs text-ink-soft">{t("mo_amount")}</p>
                <p className="tabular font-bold text-ink">₹{(detail.amount / 100).toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="border-t border-line pt-3">
              <p className="mb-1 text-xs text-ink-soft">{t("mo_date")}</p>
              <p className="text-ink-muted">{new Date(detail.created_at).toLocaleString("en-IN")}</p>
            </div>
            {detail.razorpay_payment_id && (
              <div className="border-t border-line pt-3">
                <p className="mb-1 text-xs text-ink-soft">{t("mo_payment_id")}</p>
                <p className="break-all font-mono text-xs text-ink-muted">{detail.razorpay_payment_id}</p>
              </div>
            )}
            <div className="border-t border-line pt-3">
              <p className="mb-2 text-xs text-ink-soft">{t("mo_items")}</p>
              {(detail.items || []).map((item: any, i: number) => {
                const when = orderItemWhen(item);
                return (
                  <div key={i} className="border-b border-line py-2 last:border-0">
                    <div className="flex justify-between gap-3">
                      <span className="text-ink">
                        {item.name} <span className="text-ink-soft">x {item.quantity}</span>
                      </span>
                      <span className="tabular shrink-0 font-semibold text-ink">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                    {when && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
                        <CalendarDays size={12} /> {when}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {detail.status === "paid" && (
              <div className="rounded-[10px] bg-success/10 p-3">
                <p className="flex items-center gap-1.5 font-semibold text-success">
                  <CircleCheck size={16} /> {t("mo_paid_note_t")}
                </p>
                <p className="mt-1 text-xs text-ink-muted">{t("mo_paid_note")}</p>
              </div>
            )}
            {detail.status === "pending" && (
              <div className="rounded-[10px] bg-saffron-soft p-3">
                <p className="flex items-center gap-1.5 font-semibold text-saffron-dark">
                  <Clock size={16} /> {t("mo_pending_note_t")}
                </p>
                <p className="mt-1 text-xs text-ink-muted">{checkedStillPending ? t("mo_still_pending") : t("mo_pending_note")}</p>
                <button onClick={() => handleCheckPayment(detail)} disabled={checking} className="btn-secondary mt-3 min-h-[40px] px-4 text-sm">
                  <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
                  {checking ? t("mo_checking") : t("mo_check_payment")}
                </button>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </main>
  );
};

export default MyOrders;
