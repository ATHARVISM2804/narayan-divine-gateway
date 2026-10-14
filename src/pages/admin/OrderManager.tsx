import { memo, useState, useEffect, useMemo, useDeferredValue, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/fetchAll";
import { checkOrderPayment } from "@/lib/orderStatus";
import {
  formatOrderItemLine, orderItemPujaId, orderItemTier, orderItemWhen, type OrderItem,
} from "@/lib/orderItems";
import {
  ALL, EMPTY_SEVA_FILTER, buildSevaCatalog, buildSubFilters, orderMatchesSeva, type SevaFilterValue,
} from "@/lib/orderFilters";
import SevaFilter from "./SevaFilter";
import OrderPaymentPanel, { type PaymentPanelOrder } from "./OrderPaymentPanel";
import { findPaidDuplicates } from "@/lib/orderDuplicates";
import { formatDateTimeIST, slugify } from "@/lib/csv";
import { buildPanditList } from "@/lib/orderExport";
import { downloadPanditListPdf } from "@/lib/panditPdf";
import { orderMatchesSearch, searchText } from "@/lib/orderSearch";
import { Eye, X, RefreshCw, Download, Calendar, ChevronDown, ShieldCheck, CalendarClock, Search } from "lucide-react";
import { toast } from "sonner";
import { useShowMore } from "@/hooks/useShowMore";

/* Active pujas, used to move a booking to the same puja on another date. */
interface PujaOption { id: string; name: string; date: string; location: string; prices: { label: string; price: number }[]; status: string }

interface Order {
  id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  paid_at?: string | null;
  payment_method?: string | null;
  manual_payment?: Record<string, unknown> | null;
  /** Last Razorpay failure (webhook payment.failed / redirect callback). */
  payment_error?: { description?: string | null; reason?: string | null; method?: string | null; at?: string | null } | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: string | null;
  amount: number;
  status: string;
  items: any[];
  puja_details?: { gotra?: string; member_names?: string[] } | null;
  created_at: string;
  /** When the admin marked this customer's number as contacted (null = not contacted). */
  contacted_at?: string | null;
}

interface Props { onRefresh?: () => void }

/** "Payment was cancelled by user · upi · payment_cancelled" */
const paymentErrorText = (e: NonNullable<Order["payment_error"]>) =>
  [e.description || "Payment failed", e.method, e.reason].filter(Boolean).join(" · ");

const statusColors: Record<string, string> = {
  paid:     "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  failed:   "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
  cancelled: "bg-gray-100 text-gray-500 line-through",
};

/* Maps the raw item.category stored on each order line to a filter bucket + dropdown group label. */
type ItemType = "puja" | "chadhava" | "addon";
const CATEGORY_META: Record<string, { type: ItemType; label: string }> = {
  puja:     { type: "puja",     label: "🪔 Poojas" },
  chadhava: { type: "chadhava", label: "🌺 Chadhavas" },
  offering: { type: "addon",    label: "🎁 Add-ons" },
  addon:    { type: "addon",    label: "🎁 Add-ons" },
};
const itemTypeOf = (item: any): ItemType | "other" =>
  CATEGORY_META[item?.category as string]?.type ?? "other";

/* Reusable WhatsApp glyph. */
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className}><path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.908 1.885 7.054L2 30l7.144-1.87A14.034 14.034 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.6a11.62 11.62 0 0 1-5.923-1.62l-.425-.252-4.24 1.11 1.132-4.134-.277-.446A11.563 11.563 0 0 1 4.4 16.003c0-6.4 5.203-11.6 11.603-11.6s11.598 5.2 11.598 11.6-5.198 11.597-11.598 11.597zm6.36-8.68c-.348-.174-2.063-1.018-2.383-1.133-.32-.116-.552-.174-.786.174-.233.348-.902 1.133-1.107 1.366-.203.232-.407.26-.755.086-.348-.174-1.47-.543-2.8-1.727-1.034-.922-1.73-2.06-1.934-2.407-.203-.348-.022-.535.152-.707.157-.155.348-.406.523-.61.174-.202.232-.347.348-.578.116-.232.058-.435-.03-.61-.086-.173-.785-1.892-1.075-2.59-.284-.682-.573-.59-.785-.6l-.67-.012c-.232 0-.61.087-.928.435-.32.347-1.22 1.192-1.22 2.91s1.25 3.378 1.422 3.61c.174.232 2.46 3.757 5.96 5.27.834.36 1.483.575 1.99.736.836.267 1.598.23 2.2.14.672-.1 2.063-.843 2.353-1.658.29-.812.29-1.51.203-1.658-.087-.145-.32-.23-.67-.406z"/></svg>
);

/* Sanitize an Indian phone to wa.me digits (prefixes 91 for bare 10-digit numbers). */
const waNumber = (phone: string) => {
  const d = (phone || "").replace(/\D/g, "").replace(/^0+/, "");
  return d.length === 10 ? `91${d}` : d;
};

/* Pre-filled order-confirmation message sent to the customer on WhatsApp. */
const buildConfirmationMessage = (o: Order) => {
  // Each line carries the puja date & place so the customer can spot a wrong-date booking.
  const items  = (o.items || []).map((i: any) => `• ${formatOrderItemLine(i)}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join("\n");
  const amount = `₹${(o.amount / 100).toLocaleString("en-IN")}`;
  return (
    `🙏 Namaste ${o.customer_name}!\n\n` +
    `Your booking with *Narayan Kripa* is confirmed ✅\n\n` +
    (items ? `🪔 *Your Seva:*\n${items}\n\n` : "") +
    `💰 *Amount:* ${amount}\n` +
    `🧾 *Order Ref:* ${o.id.slice(0, 8).toUpperCase()}\n\n` +
    `Our team will perform your seva with full devotion and keep you updated. 🌺\n\n` +
    `Har Har Mahadev 🙏\n— Team Narayan Kripa`
  );
};

const waConfirmLink = (o: Order) =>
  `https://wa.me/${waNumber(o.customer_phone)}?text=${encodeURIComponent(buildConfirmationMessage(o))}`;

type DatePreset = "all" | "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "custom";

const getPresetRange = (preset: DatePreset): { from: Date | null; to: Date | null } => {
  const startOfDay = (d: Date) => { const c = new Date(d); c.setHours(0,0,0,0); return c; };
  const endOfDay   = (d: Date) => { const c = new Date(d); c.setHours(23,59,59,999); return c; };
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "last7": {
      const f = new Date(now); f.setDate(f.getDate() - 6);
      return { from: startOfDay(f), to: endOfDay(now) };
    }
    case "last30": {
      const f = new Date(now); f.setDate(f.getDate() - 29);
      return { from: startOfDay(f), to: endOfDay(now) };
    }
    case "thisMonth": {
      const f = new Date(now.getFullYear(), now.getMonth(), 1);
      const t = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: startOfDay(f), to: endOfDay(t) };
    }
    case "lastMonth": {
      const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const t = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: startOfDay(f), to: endOfDay(t) };
    }
    default:
      return { from: null, to: null };
  }
};

const presets: { key: DatePreset; label: string }[] = [
  { key: "all",       label: "All Time" },
  { key: "today",     label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7",     label: "Last 7 Days" },
  { key: "last30",    label: "Last 30 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "custom",    label: "Custom Range" },
];

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/* Only what the cards, the detail view, the PDF and the search read. select("*") also
   pulled meta_tracking (IP, browser, ad ids) and the payment signature of every order. */
const ORDER_COLUMNS = "id, razorpay_order_id, razorpay_payment_id, customer_name, customer_email, customer_phone, customer_address, amount, status, items, puja_details, created_at, paid_at, payment_method, manual_payment, payment_error";

// Built once: toLocaleString with options builds a new formatter on every call.
const createdFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const paidTimeFmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" });

/** One order in the list. Memoized: opening one order or checking one payment
    re-draws only that card, not all of them. */
const OrderCard = memo(function OrderCard({
  order: o, duplicateOf, checking, onCheck, onOpen,
}: {
  order: Order;
  duplicateOf: string | undefined;
  checking: boolean;
  onCheck: (o: Order) => void;
  onOpen: (o: Order) => void;
}) {
  const sevaLines = (o.items || []).filter((i: any) => itemTypeOf(i) !== "addon") as OrderItem[];
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft hover:border-saffron/40 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-maroon text-sm">{o.customer_name}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[o.status] || "bg-gray-100 text-gray-500"}`}>
            {o.status.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-brown/60 mt-0.5">{o.customer_email ? `${o.customer_email} • ` : ""}{o.customer_phone}</p>
        {sevaLines.map((i, idx) => {
          const when = orderItemWhen(i);
          return (
            <div key={idx} className="mt-1 max-w-sm">
              <p className="text-xs font-semibold text-saffron truncate">{i.category === "chadhava" ? "🌺" : "🪔"} {i.name}</p>
              {when
                ? <p className="text-[11px] text-maroon/80 truncate">📅 {when}</p>
                : (i.category === "puja" || i.category === "chadhava") && <p className="text-[11px] text-amber-600">📅 date not recorded</p>}
            </div>
          );
        })}
        {o.status !== "paid" && duplicateOf && (
          <p className="text-[11px] font-semibold text-amber-700 mt-0.5">⚠️ Duplicate — already paid in order {duplicateOf.slice(0, 8).toUpperCase()}</p>
        )}
        {o.status === "paid" && o.payment_method && o.payment_method !== "razorpay" && (
          <p className="text-[11px] font-semibold text-green-700 mt-0.5">💵 Paid offline ({o.payment_method === "bank_transfer" ? "bank transfer" : o.payment_method.toUpperCase() === "UPI" ? "UPI" : o.payment_method}) — marked by admin</p>
        )}
        {o.status !== "paid" && o.payment_error && (
          <p className="text-[11px] text-red-600 mt-0.5">
            ❌ {paymentErrorText(o.payment_error)}
          </p>
        )}
        {o.status === "paid" && o.puja_details && !o.puja_details.gotra?.trim() && (
          <p className="text-[11px] text-amber-600 mt-0.5">🕉️ Gotra not provided — open the order to add it</p>
        )}
        <p className="text-xs text-brown/40 mt-0.5">
          {createdFmt.format(new Date(o.created_at))}
          {o.status === "paid" && o.paid_at && (
            <span className="ml-2 text-green-600">• paid {paidTimeFmt.format(new Date(o.paid_at))}</span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold text-saffron text-lg">₹{(o.amount / 100).toLocaleString("en-IN")}</span>
        {o.status !== "paid" && o.razorpay_order_id && (
          <button
            onClick={() => onCheck(o)}
            disabled={checking}
            title="Check with Razorpay whether this order was paid"
            className="flex items-center gap-1.5 rounded-xl border border-gold/40 bg-cream px-3 py-2 text-xs font-bold text-maroon hover:bg-gold/20 transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={12} className={checking ? "animate-spin" : ""} /> Check
          </button>
        )}
        <a
          href={waConfirmLink(o)}
          target="_blank"
          rel="noopener noreferrer"
          title="Send order confirmation on WhatsApp"
          className="flex items-center gap-1.5 rounded-xl bg-green-500 hover:bg-green-600 px-3 py-2 text-xs font-bold text-white transition-colors shrink-0"
        >
          <WhatsAppIcon className="h-3.5 w-3.5 fill-white shrink-0" />
          Confirm
        </a>
        <button onClick={() => onOpen(o)} className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors">
          <Eye size={14} />
        </button>
      </div>
    </div>
  );
});

const OrderManager = (_props: Props) => {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [seva,         setSeva]         = useState<SevaFilterValue>(EMPTY_SEVA_FILTER);
  const [typeFilter,   setTypeFilter]   = useState<"all" | ItemType>("all");
  const [detail,       setDetail]       = useState<Order | null>(null);
  const [datePreset,   setDatePreset]   = useState<DatePreset>("all");
  const [customFrom,   setCustomFrom]   = useState("");
  const [customTo,     setCustomTo]     = useState("");
  const [search,       setSearch]       = useState("");
  // Filtering 800 orders is cheap, but deferring keeps typing smooth on slow phones.
  const query = useDeferredValue(search.trim());
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await fetchAllRows<Order>((from, to) =>
      supabase
        .from("orders")
        .select(ORDER_COLUMNS)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
    );
    if (!error) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  /* ── Razorpay is the source of truth: ask it about every unpaid order ── */
  const [syncing, setSyncing] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const syncWithRazorpay = async () => {
    setSyncing(true);
    try {
      // The admin session token is sent automatically; the function checks it against ADMIN_EMAIL.
      const { data, error } = await supabase.functions.invoke("reconcile-orders", { body: { all: true } });
      if (error || !data) throw new Error("sync failed");
      const n = (data.marked_paid || []).length;
      toast.success(`Checked ${data.checked} unpaid order(s) with Razorpay — ${n} marked as paid`);
      if (data.failures?.length) toast.warning(`${data.failures.length} order(s) could not be checked`);
      await fetchOrders();
    } catch {
      toast.error("Could not sync with Razorpay");
    }
    setSyncing(false);
  };

  const checkOne = useCallback(async (o: Order) => {
    setCheckingId(o.id);
    const status = await checkOrderPayment(o.id);
    setCheckingId(null);
    if (!status) { toast.error("Could not check this order"); return; }
    if (status.status === "paid") {
      toast.success(`Payment found — ${o.customer_name} is PAID`);
      const patch = { status: "paid", razorpay_payment_id: status.razorpay_payment_id, paid_at: status.paid_at };
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, ...patch } : x)));
      setDetail((d) => (d && d.id === o.id ? { ...d, ...patch } : d));
    } else {
      toast.info("Razorpay has no captured payment for this order");
    }
  }, []);

  /* ── Resolved date range ── */
  const dateRange = useMemo(() => {
    if (datePreset === "custom") {
      return {
        from: customFrom ? new Date(customFrom + "T00:00:00") : null,
        to:   customTo   ? new Date(customTo   + "T23:59:59") : null,
      };
    }
    return getPresetRange(datePreset);
  }, [datePreset, customFrom, customTo]);

  /* ── Active pujas (for "Change date") ── */
  const [pujaOptions, setPujaOptions] = useState<PujaOption[]>([]);
  useEffect(() => {
    supabase.from("pujas").select("id, name, date, location, prices, status").eq("status", "active")
      .then(({ data }) => { if (data) setPujaOptions(data as PujaOption[]); });
  }, []);

  /* ── Seva filter, level 1: one entry per puja name (built from all orders so the list is stable) ── */
  const sevaCatalog = useMemo(() => buildSevaCatalog(orders), [orders]);
  const allSevaEntries = useMemo(() => [...sevaCatalog.puja, ...sevaCatalog.chadhava, ...sevaCatalog.addon], [sevaCatalog]);
  const selectedSeva = allSevaEntries.find((e) => e.key === seva.sevaKey) ?? null;

  const typeCounts = useMemo(() => ({
    puja:     orders.filter((o) => (o.items || []).some((i: any) => itemTypeOf(i) === "puja")).length,
    chadhava: orders.filter((o) => (o.items || []).some((i: any) => itemTypeOf(i) === "chadhava")).length,
  }), [orders]);

  /* ── Status, type and order-date filters (everything except the seva drill-down) ── */
  const baseFiltered = useMemo(() => {
    return orders.filter((o) => {
      const statusMatch = statusFilter === "all" || o.status === statusFilter;
      const typeMatch   = typeFilter   === "all" || (o.items || []).some((item: any) => itemTypeOf(item) === typeFilter);
      const orderDate   = new Date(o.created_at);
      const dateMatch   =
        (!dateRange.from || orderDate >= dateRange.from) &&
        (!dateRange.to   || orderDate <= dateRange.to);
      return statusMatch && typeMatch && dateMatch;
    });
  }, [orders, statusFilter, typeFilter, dateRange]);

  /* ── Seva filter, level 2: Date and Package chips, counted within the other filters ── */
  const sevaSubFilters = useMemo(() => buildSubFilters(baseFiltered, seva), [baseFiltered, seva]);

  /* ── Search box: phone / name / member / order ref, on top of the filters ── */
  const searchIndex = useMemo(() => new Map(orders.map((o) => [o.id, searchText(o)])), [orders]);
  const matchesQuery = (o: Order) => orderMatchesSearch(o, query, searchIndex.get(o.id));

  /* ── Apply all filters ── */
  const filtered = useMemo(
    () => baseFiltered.filter((o) => orderMatchesSeva(o, seva) && matchesQuery(o)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseFiltered, seva, query, searchIndex],
  );

  /* Matches the other filters are hiding — so "type a number, see all its orders" holds
     even when e.g. "Today" was left selected. */
  const hiddenMatches = useMemo(
    () => (query ? orders.filter(matchesQuery).length - filtered.length : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, query, searchIndex, filtered],
  );

  /* "/" focuses the search box (unless already typing somewhere). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      // The Orders tab stays mounted while hidden; "/" belongs to it only when it is on screen.
      const onScreen = searchRef.current?.offsetParent != null;
      if (e.key === "/" && onScreen && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sevaSummary = (() => {
    if (!selectedSeva) return null;
    const parts = [selectedSeva.label];
    const date = sevaSubFilters.dates.find((d) => d.key === seva.dateKey);
    if (date) parts.push(date.label);
    if (seva.packageKey !== ALL) parts.push(seva.packageKey);
    return parts.join(" • ");
  })();

  /* ── Stats (from filtered) ── */
  const stats = useMemo(() => {
    const s = { total: filtered.length, paid: 0, pending: 0, revenue: 0 };
    for (const o of filtered) {
      if (o.status === "paid") { s.paid++; s.revenue += o.amount; }
      else if (o.status === "pending") s.pending++;
    }
    return s;
  }, [filtered]);

  /* ── Only the first rows are drawn; "Show more" adds the next ones ── */
  const { count: shown, remaining, showMore } = useShowMore(
    filtered.length,
    `${query}|${statusFilter}|${typeFilter}|${datePreset}|${customFrom}|${customTo}|${seva.sevaKey}|${seva.dateKey}|${seva.packageKey}`,
  );

  const openOrder = useCallback((o: Order) => { setDetail(o); setGotraDraft(null); }, []);

  /* ── PDF Export: name, members and gotra for Panditji, exactly the filtered orders ── */
  const [exporting, setExporting] = useState(false);
  const exportPDF = async () => {
    const presetLabel = datePreset === "custom"
      ? [customFrom, customTo].filter(Boolean).join(" to ")
      : presets.find((p) => p.key === datePreset)?.label ?? "";
    const scopeParts = [
      sevaSummary ?? "",
      statusFilter !== "all" ? statusFilter : "",
      datePreset !== "all" ? presetLabel : "",
    ].filter(Boolean);
    const now = formatDateTimeIST(new Date().toISOString());
    // File name says what was exported, e.g. "…-sankalp-list-pitra-shanti-…-26-sep-2026-couple-paid-2026-09-27.pdf"
    const scope = slugify(scopeParts.join(" "), 80);
    setExporting(true);
    try {
      await downloadPanditListPdf({
        title: "Narayan Kripa — Sankalp List",
        subtitle: [...scopeParts, `${filtered.length} booking${filtered.length === 1 ? "" : "s"}`, `Generated ${now} IST`].join(" • "),
        ...buildPanditList(filtered),
        filename: `narayan-kripa-sankalp-list${scope ? `-${scope}` : ""}-${now.slice(0, 10)}.pdf`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not create the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  /** Resets date, status, type and seva — the search box is kept. */
  const clearFilters = () => {
    setDatePreset("all"); setStatusFilter("all");
    setTypeFilter("all"); setSeva(EMPTY_SEVA_FILTER);
    setCustomFrom(""); setCustomTo("");
  };

  const clearAll = () => {
    clearFilters();
    setSearch("");
  };

  /* Switching type clears a seva selection that doesn't belong to it. */
  const changeType = (t: "all" | ItemType) => {
    setTypeFilter(t);
    if (t !== "all" && selectedSeva && selectedSeva.type !== t) setSeva(EMPTY_SEVA_FILTER);
  };

  /* ── Move a puja line to the same puja on another date (e.g. 26 Sept ↔ 10 Oct) ── */
  const [movingKey, setMovingKey] = useState<string | null>(null);

  /* ── Unpaid orders that repeat a booking the same customer already paid for ── */
  const paidDuplicates = useMemo(() => findPaidDuplicates(orders), [orders]);

  /* ── Apply a change made through the Payment panel ── */
  const applyOrderUpdate = (id: string, patch: Partial<PaymentPanelOrder>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } as Order : o)));
    setDetail((d) => (d && d.id === id ? { ...d, ...patch } as Order : d));
  };

  /* ── Record or correct the gotra after asking the customer ── */
  const [gotraDraft, setGotraDraft] = useState<string | null>(null); // null = not editing
  const [savingGotra, setSavingGotra] = useState(false);

  const saveGotra = async (order: Order) => {
    const gotra = (gotraDraft ?? "").replace(/\s+/g, " ").trim();
    if (!gotra) { toast.error("Enter the gotra"); return; }
    const puja_details = { ...(order.puja_details || {}), gotra };
    setSavingGotra(true);
    const { error } = await supabase.from("orders").update({ puja_details }).eq("id", order.id);
    setSavingGotra(false);
    if (error) { toast.error("Could not save the gotra"); return; }
    toast.success("Gotra saved");
    setGotraDraft(null);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, puja_details } : o)));
    setDetail((d) => (d && d.id === order.id ? { ...d, puja_details } : d));
  };

  const baseNameOf = (item: OrderItem) => {
    if (item.puja_name) return item.puja_name;
    const tier = orderItemTier(item);
    return tier && item.name.endsWith(` (${tier})`) ? item.name.slice(0, -(tier.length + 3)) : item.name;
  };

  const alternativesFor = (item: OrderItem): PujaOption[] => {
    const pujaId = orderItemPujaId(item);
    const base = baseNameOf(item).trim().toLowerCase();
    return pujaOptions.filter((p) => p.id !== pujaId && p.name.trim().toLowerCase() === base);
  };

  const movePujaLine = async (order: Order, index: number, target: PujaOption) => {
    const item = order.items[index] as OrderItem;
    const tier = orderItemTier(item) || "";
    if (!target.prices?.some((t) => t.label === tier)) {
      toast.error(`"${target.date}" has no "${tier}" package — cannot move this booking`);
      return;
    }
    const from = orderItemWhen(item) || "date not recorded";
    if (!window.confirm(`Move ${order.customer_name}'s booking\n\nfrom: ${from}\nto:   ${target.date} • ${target.location}\n\nThe amount paid stays the same.`)) return;

    const updatedItem: OrderItem = {
      ...item,
      id: `puja-${target.id}-${tier}`,
      name: `${target.name} (${tier})`,
      puja_id: target.id,
      puja_name: target.name,
      puja_date: target.date,
      puja_location: target.location,
      tier,
    };
    const items = order.items.map((it: any, i: number) => (i === index ? updatedItem : it));
    setMovingKey(`${order.id}:${index}`);
    const { error } = await supabase.from("orders").update({ items }).eq("id", order.id);
    setMovingKey(null);
    if (error) { toast.error("Could not update the order"); return; }
    toast.success(`Moved to ${target.date}`);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, items } : o)));
    setDetail((d) => (d && d.id === order.id ? { ...d, items } : d));
  };

  const activePresetLabel = presets.find((p) => p.key === datePreset)?.label ?? "All Time";
  const hasOtherFilter = datePreset !== "all" || statusFilter !== "all" || typeFilter !== "all" || seva.sevaKey !== ALL;
  const hasAnyFilter = hasOtherFilter || search.trim() !== "";

  return (
    <div className="space-y-5">

      {/* ── Stats (filtered) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Filtered Orders", value: stats.total,   icon: "📦" },
          { label: "Paid",            value: stats.paid,    icon: "✅" },
          { label: "Pending",         value: stats.pending, icon: "⏳" },
          { label: "Revenue",         value: `₹${(stats.revenue / 100).toLocaleString("en-IN")}`, icon: "💰" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gold/30 bg-ivory p-4">
            <span className="text-xl">{s.icon}</span>
            <p className="mt-1 text-lg font-bold text-maroon">{s.value}</p>
            <p className="text-[11px] text-brown/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Panel ── */}
      <div className="rounded-2xl border border-gold/30 bg-ivory p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-maroon uppercase tracking-wider">Filters</p>
          {hasAnyFilter && (
            <button onClick={clearAll} className="text-[11px] text-red-400 hover:text-red-600 font-semibold underline">
              ✕ Clear all
            </button>
          )}
        </div>

        {/* ── SEARCH: one customer's orders by phone / name ── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 rounded-xl border border-gold/40 bg-cream px-3 py-2.5 focus-within:border-saffron focus-within:ring-2 focus-within:ring-saffron/20 transition-all">
            <Search size={16} className="text-saffron shrink-0" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { setSearch(""); e.currentTarget.blur(); } }}
              placeholder="Search by phone number, name or order ID…"
              aria-label="Search orders by phone number, name or order ID"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-maroon outline-none placeholder:font-normal placeholder:text-brown/40 [&::-webkit-search-cancel-button]:hidden"
            />
            {search ? (
              <button onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                aria-label="Clear search"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-brown/50 hover:bg-gold/20 hover:text-maroon transition-colors">
                <X size={14} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block shrink-0 rounded border border-gold/40 bg-ivory px-1.5 text-[10px] font-semibold text-brown/40">/</kbd>
            )}
          </div>
          {query && hiddenMatches > 0 && (
            <p className="text-[11px] text-brown/60">
              <span className="font-bold text-maroon">{hiddenMatches} more order{hiddenMatches > 1 ? "s" : ""}</span> for this search {hiddenMatches > 1 ? "are" : "is"} hidden by your filters —{" "}
              <button onClick={clearFilters} className="font-semibold text-saffron underline hover:text-maroon">Show all</button>
            </p>
          )}
        </div>

        {/* ── DATE FILTER ── */}
        <div className="space-y-2.5">
          <span className="text-[11px] text-brown/50 font-semibold uppercase tracking-wide flex items-center gap-1.5">
            <Calendar size={11} className="text-saffron" /> Date Range
          </span>

          {/* Preset pills */}
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  setDatePreset(p.key);
                  if (p.key !== "custom") { setCustomFrom(""); setCustomTo(""); }
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
                  datePreset === p.key
                    ? "bg-maroon text-white border-maroon shadow-sm"
                    : "bg-cream border-gold/40 text-maroon hover:bg-gold/20"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom date range inputs */}
          {datePreset === "custom" && (
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-cream border border-gold/30">
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-brown/50 font-bold uppercase">From</label>
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || isoDate(new Date())}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-lg border border-gold/40 bg-ivory px-3 py-1.5 text-xs text-maroon outline-none focus:border-saffron"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-brown/50 font-bold uppercase">To</label>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={isoDate(new Date())}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-lg border border-gold/40 bg-ivory px-3 py-1.5 text-xs text-maroon outline-none focus:border-saffron"
                />
              </div>
              {(customFrom || customTo) && (
                <button onClick={() => { setCustomFrom(""); setCustomTo(""); }}
                  className="text-[11px] text-red-400 hover:text-red-600 font-semibold underline">
                  Clear dates
                </button>
              )}
            </div>
          )}

          {/* Active range summary pill */}
          {datePreset !== "all" && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-maroon/10 border border-maroon/20 px-3 py-1 text-[11px] font-semibold text-maroon">
              📅 {activePresetLabel}
              {datePreset === "custom" && customFrom && customTo && ` : ${customFrom} → ${customTo}`}
              <button onClick={() => { setDatePreset("all"); setCustomFrom(""); setCustomTo(""); }}
                className="ml-1 hover:text-red-500 transition-colors">✕</button>
            </div>
          )}
        </div>

        {/* ── Status filter ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-brown/50 font-semibold w-16 shrink-0">Status:</span>
          <div className="flex flex-wrap gap-1.5">
            {["all", "paid", "pending", "failed", "cancelled", "refunded"].map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all capitalize ${
                  statusFilter === f ? "bg-saffron text-white shadow-sm" : "bg-cream border border-gold/40 text-maroon hover:bg-gold/20"
                }`}>
                {f === "all" ? "All Status" : f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Type filter (Puja / Chadhava) ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-brown/50 font-semibold w-16 shrink-0">Type:</span>
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: "all",      label: "All Types",     count: null },
              { key: "puja",     label: "🪔 Poojas",      count: typeCounts.puja },
              { key: "chadhava", label: "🌺 Chadhavas",  count: typeCounts.chadhava },
            ] as const).map((t) => (
              <button key={t.key} onClick={() => changeType(t.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  typeFilter === t.key ? "bg-saffron text-white shadow-sm" : "bg-cream border border-gold/40 text-maroon hover:bg-gold/20"
                }`}>
                {t.label}{t.count !== null && <span className="ml-1 opacity-70">({t.count})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Seva: puja first, then its Date and Package ── */}
        <SevaFilter
          catalog={sevaCatalog}
          subFilters={sevaSubFilters}
          value={seva}
          typeFilter={typeFilter === "all" || typeFilter === "puja" || typeFilter === "chadhava" ? typeFilter : "all"}
          onChange={setSeva}
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-semibold text-brown/70">
          Showing <span className="text-maroon font-bold">{filtered.length}</span> of {orders.length} orders
          {datePreset !== "all" && <span className="ml-1 text-saffron">• {activePresetLabel}</span>}
          {typeFilter !== "all" && <span className="ml-1 text-saffron">• {typeFilter === "puja" ? "Poojas" : "Chadhavas"}</span>}
          {sevaSummary && <span className="ml-1 text-saffron">• {sevaSummary}</span>}
          {query && <span className="ml-1 text-saffron">• “{query}”</span>}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={syncWithRazorpay} disabled={syncing}
            title="Ask Razorpay about every unpaid order and mark the paid ones"
            className="flex items-center gap-1.5 rounded-xl border border-saffron/40 bg-saffron/10 px-4 py-2 text-xs font-bold text-maroon hover:bg-saffron/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <ShieldCheck size={13} className={syncing ? "animate-pulse" : ""} /> {syncing ? "Syncing…" : "Sync with Razorpay"}
          </button>
          <button onClick={exportPDF} disabled={filtered.length === 0 || exporting}
            title="Name, member names and gotra of the orders shown — for Panditji"
            className="flex items-center gap-1.5 rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Download size={13} className={exporting ? "animate-pulse" : ""} /> {exporting ? "Creating PDF…" : `Export PDF (${filtered.length})`}
          </button>
          <button onClick={fetchOrders}
            className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Orders list ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gold/10 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
          <p className="text-3xl mb-3">📦</p>
          <p className="font-display text-maroon">{query ? `No orders match “${query}”` : "No orders found"}</p>
          <p className="text-xs text-brown/50 mt-1">
            {!query
              ? "Try changing the filters above"
              : hiddenMatches > 0
              ? "It matches orders hidden by your filters — use “Show all” above"
              : "Check the number or spelling (Hindi names match only when typed in Hindi)"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, shown).map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              duplicateOf={paidDuplicates.get(o.id)?.id}
              checking={checkingId === o.id}
              onCheck={checkOne}
              onOpen={openOrder}
            />
          ))}
          {remaining > 0 && (
            <button
              onClick={showMore}
              className="w-full rounded-xl border border-gold/40 bg-ivory py-3 text-sm font-bold text-maroon hover:bg-gold/15 transition-colors"
            >
              Show more ({remaining} more)
            </button>
          )}
        </div>
      )}

      {/* ── Order detail modal ── */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setDetail(null); setGotraDraft(null); }} />
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-ivory shadow-2xl p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg text-maroon">Order Details</h3>
              <button onClick={() => { setDetail(null); setGotraDraft(null); }} className="text-brown/50 hover:text-maroon"><X size={20} /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[11px] text-brown/50 uppercase">Status</p><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColors[detail.status]}`}>{detail.status}</span></div>
                <div><p className="text-[11px] text-brown/50 uppercase">Amount</p><p className="font-bold text-saffron">₹{(detail.amount / 100).toLocaleString("en-IN")}</p></div>
              </div>
              <div className="border-t border-gold/20 pt-3">
                <p className="text-[11px] text-brown/50 uppercase mb-1">Customer</p>
                <p className="font-medium text-maroon">{detail.customer_name}</p>
                {detail.customer_email && <p className="text-brown/60">{detail.customer_email}</p>}
                <p className="text-brown/60">{detail.customer_phone}</p>
                {detail.customer_address && <p className="text-brown/60 mt-1">{detail.customer_address}</p>}
                <a
                  href={waConfirmLink(detail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-green-500 hover:bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition-colors"
                >
                  <WhatsAppIcon className="h-4 w-4 fill-white shrink-0" />
                  Send Confirmation on WhatsApp
                </a>
              </div>
              <div className="border-t border-gold/20 pt-3">
                <p className="text-[11px] text-brown/50 uppercase mb-2">Items Ordered</p>
                {(detail.items || []).map((item: OrderItem, i: number) => {
                  const when = orderItemWhen(item);
                  const alternatives = item.category === "puja" ? alternativesFor(item) : [];
                  const moving = movingKey === `${detail.id}:${i}`;
                  return (
                    <div key={i} className="py-1.5 border-b border-gold/10 last:border-0">
                      <div className="flex justify-between">
                        <span className="text-maroon">{item.name} <span className="text-brown/40">×{item.quantity}</span></span>
                        <span className="font-semibold text-saffron">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                      {when
                        ? <p className="text-xs text-maroon/80 mt-0.5">📅 {when}</p>
                        : (item.category === "puja" || item.category === "chadhava") && <p className="text-xs text-amber-600 mt-0.5">📅 date not recorded (pooja edited or deleted)</p>}
                      {alternatives.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <CalendarClock size={12} className="text-saffron shrink-0" />
                          <select
                            value=""
                            disabled={moving}
                            onChange={(e) => {
                              const target = alternatives.find((p) => p.id === e.target.value);
                              if (target) movePujaLine(detail, i, target);
                            }}
                            className="rounded-lg border border-gold/40 bg-cream px-2 py-1 text-[11px] font-semibold text-maroon outline-none focus:border-saffron disabled:opacity-50"
                          >
                            <option value="">{moving ? "Moving…" : "Change date to…"}</option>
                            {alternatives.map((p) => <option key={p.id} value={p.id}>{p.date} • {p.location}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {detail.puja_details && (
                <div className="border-t border-gold/20 pt-3">
                  <p className="text-[11px] text-brown/50 uppercase mb-2">🕉️ Sankalp Details</p>
                  {/* Gotra is always shown: an empty one must be visible so it can be asked for. */}
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-brown/50 uppercase w-20 shrink-0 mt-0.5">Gotra</span>
                    {gotraDraft !== null ? (
                      <div className="flex flex-1 flex-wrap items-center gap-1.5">
                        <input
                          autoFocus
                          value={gotraDraft}
                          onChange={(e) => setGotraDraft(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveGotra(detail); if (e.key === "Escape") setGotraDraft(null); }}
                          placeholder="e.g. Kashyap"
                          className="min-w-0 flex-1 rounded-lg border border-gold/40 bg-cream px-2 py-1 text-xs font-semibold text-maroon outline-none focus:border-saffron"
                        />
                        <button onClick={() => saveGotra(detail)} disabled={savingGotra}
                          className="rounded-lg bg-saffron px-2.5 py-1 text-xs font-bold text-white hover:bg-maroon disabled:opacity-50">
                          {savingGotra ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => setGotraDraft(null)} className="text-xs text-brown/50 hover:text-maroon">Cancel</button>
                      </div>
                    ) : detail.puja_details.gotra?.trim() ? (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-maroon">{detail.puja_details.gotra}</span>
                        <button onClick={() => setGotraDraft(detail.puja_details?.gotra || "")} className="text-[11px] text-brown/40 underline hover:text-maroon">edit</button>
                      </span>
                    ) : (
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">Not provided by customer</span>
                        <button onClick={() => setGotraDraft("")} className="text-[11px] font-semibold text-saffron underline hover:text-maroon">Add gotra</button>
                      </span>
                    )}
                  </div>
                  {detail.puja_details.member_names && detail.puja_details.member_names.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-bold text-brown/50 uppercase w-20 shrink-0 mt-0.5">Members</span>
                      <div className="flex flex-wrap gap-1.5">
                        {detail.puja_details.member_names.map((m, i) => (
                          <span key={i} className="rounded-full bg-saffron/10 border border-saffron/20 px-2.5 py-0.5 text-xs font-semibold text-saffron">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <OrderPaymentPanel
                key={detail.id + detail.status}
                order={detail}
                duplicateOf={detail.status !== "paid" ? paidDuplicates.get(detail.id) ?? null : null}
                onUpdated={(patch) => applyOrderUpdate(detail.id, patch)}
              />
              {(detail.razorpay_order_id || detail.razorpay_payment_id) && (
                <div className="border-t border-gold/20 pt-3">
                  <p className="text-[11px] text-brown/50 uppercase mb-1">Razorpay</p>
                  {detail.razorpay_order_id && <p className="font-mono text-xs text-brown/60">Order: {detail.razorpay_order_id}</p>}
                  {detail.razorpay_payment_id && <p className="font-mono text-xs text-brown/60">Payment: {detail.razorpay_payment_id}</p>}
                  {detail.paid_at && <p className="text-xs text-green-700 mt-1">Paid at: {new Date(detail.paid_at).toLocaleString("en-IN")}</p>}
                  {detail.payment_error && (
                    <p className="text-xs text-red-600 mt-1">
                      Last failed attempt{detail.payment_error.at ? ` (${new Date(detail.payment_error.at).toLocaleString("en-IN")})` : ""}: {paymentErrorText(detail.payment_error)}
                    </p>
                  )}
                  {detail.status !== "paid" && detail.razorpay_order_id && (
                    <button
                      onClick={() => checkOne(detail)}
                      disabled={checkingId === detail.id}
                      className="mt-2 flex items-center gap-1.5 rounded-lg border border-gold/40 bg-cream px-3 py-1.5 text-xs font-bold text-maroon hover:bg-gold/20 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={checkingId === detail.id ? "animate-spin" : ""} /> Check payment with Razorpay
                    </button>
                  )}
                </div>
              )}
              <div className="border-t border-gold/20 pt-3">
                <p className="text-[11px] text-brown/50 uppercase">Date</p>
                <p className="text-brown/60">{new Date(detail.created_at).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
