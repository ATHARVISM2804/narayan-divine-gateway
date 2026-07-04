import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, X, RefreshCw, Download, Calendar, ChevronDown } from "lucide-react";

interface Order {
  id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: string | null;
  amount: number;
  status: string;
  items: any[];
  puja_details?: { gotra?: string; member_names?: string[] } | null;
  created_at: string;
}

interface Props { onRefresh?: () => void }

const statusColors: Record<string, string> = {
  paid:     "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  failed:   "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

/* Maps the raw item.category stored on each order line to a filter bucket + dropdown group label. */
type ItemType = "puja" | "chadhava" | "addon";
const CATEGORY_META: Record<string, { type: ItemType; label: string }> = {
  puja:     { type: "puja",     label: "🪔 Pujas" },
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
  const items  = (o.items || []).map((i: any) => `• ${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join("\n");
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

const OrderManager = (_props: Props) => {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameFilter,   setNameFilter]   = useState("all");
  const [typeFilter,   setTypeFilter]   = useState<"all" | ItemType>("all");
  const [detail,       setDetail]       = useState<Order | null>(null);
  const [datePreset,   setDatePreset]   = useState<DatePreset>("all");
  const [customFrom,   setCustomFrom]   = useState("");
  const [customTo,     setCustomTo]     = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

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

  /* ── Unique item names bucketed by type ── */
  const itemGroups = useMemo(() => {
    const buckets: Record<"puja" | "chadhava" | "addon" | "other", Set<string>> = {
      puja: new Set(), chadhava: new Set(), addon: new Set(), other: new Set(),
    };
    orders.forEach((o) => (o.items || []).forEach((item: any) => {
      if (item?.name) buckets[itemTypeOf(item)].add(item.name);
    }));
    const sorted = (s: Set<string>) => Array.from(s).sort((a, b) => a.localeCompare(b));
    return { puja: sorted(buckets.puja), chadhava: sorted(buckets.chadhava), addon: sorted(buckets.addon), other: sorted(buckets.other) };
  }, [orders]);

  /* ── <optgroup>s shown in the item dropdown, narrowed to the active type ── */
  const dropdownGroups = useMemo(() => {
    const groups: { key: string; label: string; names: string[] }[] = [];
    if ((typeFilter === "all" || typeFilter === "puja")     && itemGroups.puja.length)
      groups.push({ key: "puja",     label: "🪔 Pujas",     names: itemGroups.puja });
    if ((typeFilter === "all" || typeFilter === "chadhava") && itemGroups.chadhava.length)
      groups.push({ key: "chadhava", label: "🌺 Chadhavas", names: itemGroups.chadhava });
    if (typeFilter === "all" && itemGroups.addon.length)
      groups.push({ key: "addon",    label: "🎁 Add-ons",   names: itemGroups.addon });
    if (typeFilter === "all" && itemGroups.other.length)
      groups.push({ key: "other",    label: "Other",        names: itemGroups.other });
    return groups;
  }, [itemGroups, typeFilter]);

  const typeCounts = useMemo(() => ({
    puja:     orders.filter((o) => (o.items || []).some((i: any) => itemTypeOf(i) === "puja")).length,
    chadhava: orders.filter((o) => (o.items || []).some((i: any) => itemTypeOf(i) === "chadhava")).length,
  }), [orders]);

  /* ── Apply all filters ── */
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const statusMatch = statusFilter === "all" || o.status === statusFilter;
      const typeMatch   = typeFilter   === "all" || (o.items || []).some((item: any) => itemTypeOf(item) === typeFilter);
      const nameMatch   = nameFilter   === "all" || (o.items || []).some((item: any) => item?.name === nameFilter);
      const orderDate   = new Date(o.created_at);
      const dateMatch   =
        (!dateRange.from || orderDate >= dateRange.from) &&
        (!dateRange.to   || orderDate <= dateRange.to);
      return statusMatch && typeMatch && nameMatch && dateMatch;
    });
  }, [orders, statusFilter, typeFilter, nameFilter, dateRange]);

  /* ── Stats (from filtered) ── */
  const stats = {
    total:   filtered.length,
    paid:    filtered.filter((o) => o.status === "paid").length,
    pending: filtered.filter((o) => o.status === "pending").length,
    revenue: filtered.filter((o) => o.status === "paid").reduce((s, o) => s + o.amount, 0),
  };

  /* ── CSV Export ── */
  const exportCSV = () => {
    const headers = ["Order ID","Date","Customer Name","Email","Phone","Address","Items","Amount (₹)","Status","Razorpay Order ID","Razorpay Payment ID"];
    const rows = filtered.map((o) => {
      const itemsStr = (o.items || []).map((i: any) => `${i.name} x${i.quantity} @₹${i.price}`).join(" | ");
      return [
        o.id, new Date(o.created_at).toLocaleString("en-IN"),
        o.customer_name, o.customer_email || "", o.customer_phone,
        o.customer_address || "", itemsStr, (o.amount / 100).toFixed(2),
        o.status, o.razorpay_order_id || "", o.razorpay_payment_id || "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `narayan-kripa-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setDatePreset("all"); setStatusFilter("all");
    setTypeFilter("all"); setNameFilter("all");
    setCustomFrom(""); setCustomTo("");
  };

  /* Switching type clears a now-irrelevant specific item selection. */
  const changeType = (t: "all" | ItemType) => {
    setTypeFilter(t);
    if (t !== "all" && nameFilter !== "all" && !(itemGroups[t] || []).includes(nameFilter)) setNameFilter("all");
  };

  const activePresetLabel = presets.find((p) => p.key === datePreset)?.label ?? "All Time";
  const hasAnyFilter = datePreset !== "all" || statusFilter !== "all" || typeFilter !== "all" || nameFilter !== "all";

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
            {["all", "paid", "pending", "failed", "refunded"].map((f) => (
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
              { key: "puja",     label: "🪔 Pujas",      count: typeCounts.puja },
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

        {/* ── Item dropdown (grouped by type) ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-brown/50 font-semibold w-16 shrink-0">Item:</span>
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <select
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gold/40 bg-cream pl-3 pr-9 py-2 text-xs font-semibold text-maroon outline-none focus:border-saffron cursor-pointer">
              <option value="all">
                All Items{typeFilter === "puja" ? " (Pujas)" : typeFilter === "chadhava" ? " (Chadhavas)" : ""}
              </option>
              {dropdownGroups.map((g) => (
                <optgroup key={g.key} label={g.label}>
                  {g.names.map((name) => <option key={name} value={name}>{name}</option>)}
                </optgroup>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brown/40" />
          </div>
          {nameFilter !== "all" && (
            <button onClick={() => setNameFilter("all")}
              className="text-[11px] text-red-400 hover:text-red-600 font-semibold underline">
              Clear item
            </button>
          )}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-semibold text-brown/70">
          Showing <span className="text-maroon font-bold">{filtered.length}</span> of {orders.length} orders
          {datePreset !== "all" && <span className="ml-1 text-saffron">• {activePresetLabel}</span>}
          {typeFilter !== "all" && <span className="ml-1 text-saffron">• {typeFilter === "puja" ? "Pujas" : "Chadhavas"}</span>}
          {nameFilter !== "all" && <span className="ml-1 text-saffron">• {nameFilter}</span>}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Download size={13} /> Export CSV ({filtered.length})
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
          <p className="font-display text-maroon">No orders found</p>
          <p className="text-xs text-brown/50 mt-1">Try changing the filters above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const pujaNames = (o.items || []).map((i: any) => i.name).join(", ");
            return (
              <div key={o.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft hover:border-saffron/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-maroon text-sm">{o.customer_name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[o.status] || "bg-gray-100 text-gray-500"}`}>
                      {o.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-brown/60 mt-0.5">{o.customer_email ? `${o.customer_email} • ` : ""}{o.customer_phone}</p>
                  {pujaNames && <p className="text-xs font-semibold text-saffron mt-1 truncate max-w-sm">🪔 {pujaNames}</p>}
                  <p className="text-xs text-brown/40 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-saffron text-lg">₹{(o.amount / 100).toLocaleString("en-IN")}</span>
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
                  <button onClick={() => setDetail(o)} className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors">
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Order detail modal ── */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-ivory shadow-2xl p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg text-maroon">Order Details</h3>
              <button onClick={() => setDetail(null)} className="text-brown/50 hover:text-maroon"><X size={20} /></button>
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
                {(detail.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-gold/10 last:border-0">
                    <span className="text-maroon">{item.name} <span className="text-brown/40">×{item.quantity}</span></span>
                    <span className="font-semibold text-saffron">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              {detail.puja_details && (
                <div className="border-t border-gold/20 pt-3">
                  <p className="text-[11px] text-brown/50 uppercase mb-2">🕉️ Sankalp Details</p>
                  {detail.puja_details.gotra && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-brown/50 uppercase w-20 shrink-0">Gotra</span>
                      <span className="font-semibold text-maroon">{detail.puja_details.gotra}</span>
                    </div>
                  )}
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
              {(detail.razorpay_order_id || detail.razorpay_payment_id) && (
                <div className="border-t border-gold/20 pt-3">
                  <p className="text-[11px] text-brown/50 uppercase mb-1">Razorpay</p>
                  {detail.razorpay_order_id && <p className="font-mono text-xs text-brown/60">Order: {detail.razorpay_order_id}</p>}
                  {detail.razorpay_payment_id && <p className="font-mono text-xs text-brown/60">Payment: {detail.razorpay_payment_id}</p>}
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
