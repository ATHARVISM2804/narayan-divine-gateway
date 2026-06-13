import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Download, Search, Calendar, X } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  puja_name: string | null;
  package_label: string | null;
  price: number | null;
  source: string | null;
  created_at: string;
}

/* ── Date Presets ── */
type DatePreset = "all" | "today" | "yesterday" | "7days" | "30days" | "this_month" | "custom";

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "all",        label: "All Time" },
  { key: "today",      label: "Today" },
  { key: "yesterday",  label: "Yesterday" },
  { key: "7days",      label: "Last 7 Days" },
  { key: "30days",     label: "Last 30 Days" },
  { key: "this_month", label: "This Month" },
  { key: "custom",     label: "Custom Range" },
];

const getPresetRange = (preset: DatePreset): { from: Date | null; to: Date | null } => {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "7days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { from: startOfDay(d), to: endOfDay(now) };
    }
    case "30days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return { from: startOfDay(d), to: endOfDay(now) };
    }
    case "this_month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    default:
      return { from: null, to: null };
  }
};

const formatDateShort = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const LeadManager = () => {
  const [leads,   setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  /* ── Date filter state ── */
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLeads(data as Lead[]);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  /* ── Compute active date range ── */
  const dateRange = useMemo(() => {
    if (datePreset === "custom") {
      return {
        from: customFrom ? new Date(customFrom + "T00:00:00") : null,
        to: customTo ? new Date(customTo + "T23:59:59.999") : null,
      };
    }
    return getPresetRange(datePreset);
  }, [datePreset, customFrom, customTo]);

  /* ── Filter leads by search + date ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      // Search filter
      const matchesSearch =
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.puja_name || "").toLowerCase().includes(q);

      // Date filter
      const created = new Date(l.created_at);
      const matchesDate =
        (!dateRange.from || created >= dateRange.from) &&
        (!dateRange.to || created <= dateRange.to);

      return matchesSearch && matchesDate;
    });
  }, [leads, search, dateRange]);

  /* ── Group leads by date for display ── */
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Lead[]> = {};
    filtered.forEach((l) => {
      const key = new Date(l.created_at).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(l);
    });
    return groups;
  }, [filtered]);

  const exportCSV = () => {
    const headers = ["Name", "WhatsApp", "Puja", "Package", "Price (₹)", "Source", "Date"];
    const rows = filtered.map((l) => [
      l.name,
      l.phone,
      l.puja_name || "",
      l.package_label || "",
      l.price ? (l.price / 100).toFixed(0) : "",
      l.source || "",
      new Date(l.created_at).toLocaleString("en-IN"),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `narayan-kripa-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreset = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== "custom") {
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
      // Default custom range to last 7 days
      if (!customFrom) {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        setCustomFrom(d.toISOString().slice(0, 10));
        setCustomTo(new Date().toISOString().slice(0, 10));
      }
    }
  };

  const activeDateLabel = datePreset === "all"
    ? "All Time"
    : datePreset === "custom" && customFrom && customTo
      ? `${formatDateShort(new Date(customFrom))} – ${formatDateShort(new Date(customTo))}`
      : PRESETS.find(p => p.key === datePreset)?.label || "";

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Leads",   value: leads.length,    icon: "📋" },
          { label: "Showing",       value: filtered.length, icon: "🔍" },
          { label: "Today",         value: leads.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length, icon: "📅" },
          { label: "This Month",    value: leads.filter((l) => {
              const d = new Date(l.created_at);
              const n = new Date();
              return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
            }).length, icon: "📆" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gold/30 bg-ivory p-4">
            <span className="text-xl">{s.icon}</span>
            <p className="mt-1 text-2xl font-bold text-maroon">{s.value}</p>
            <p className="text-[11px] text-brown/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Date Filter Bar ── */}
      <div className="rounded-xl border border-gold/30 bg-ivory p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-saffron" />
          <span className="text-xs font-bold text-maroon uppercase tracking-wider">Filter by Date</span>
          {datePreset !== "all" && (
            <button
              onClick={() => { setDatePreset("all"); setShowDatePicker(false); }}
              className="ml-auto flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              <X size={10} /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePreset(p.key)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                datePreset === p.key
                  ? "bg-saffron text-white shadow-md"
                  : "bg-cream border border-gold/30 text-brown/60 hover:border-saffron/50 hover:text-maroon"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range inputs */}
        {showDatePicker && datePreset === "custom" && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-cream border border-gold/30 p-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-maroon">From:</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                max={customTo || undefined}
                className="rounded-lg border border-gold/40 bg-ivory px-3 py-1.5 text-sm outline-none focus:border-saffron"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-maroon">To:</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                min={customFrom || undefined}
                max={new Date().toISOString().slice(0, 10)}
                className="rounded-lg border border-gold/40 bg-ivory px-3 py-1.5 text-sm outline-none focus:border-saffron"
              />
            </div>
          </div>
        )}

        {/* Active filter indicator */}
        {datePreset !== "all" && (
          <div className="mt-2 text-xs font-semibold text-saffron">
            📅 Showing leads from: {activeDateLabel}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-gold/40 bg-ivory px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-brown/40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or puja…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-brown/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={13} /> Export CSV ({filtered.length})
          </button>
          <button
            onClick={fetchLeads}
            className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold text-brown/60">
        Showing <span className="text-maroon font-bold">{filtered.length}</span> of {leads.length} leads
      </p>

      {/* Leads list — grouped by date */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gold/10 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-display text-maroon">No leads found</p>
          <p className="text-xs text-brown/50 mt-1">
            {datePreset !== "all"
              ? "Try changing the date range or clearing filters."
              : "Leads appear here when customers fill their details before booking a puja."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([dateLabel, dateleads]) => (
            <div key={dateLabel}>
              {/* Date group header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 rounded-lg bg-maroon/5 border border-maroon/10 px-3 py-1.5">
                  <Calendar size={12} className="text-saffron" />
                  <span className="text-xs font-bold text-maroon">{dateLabel}</span>
                </div>
                <span className="text-[11px] font-semibold text-brown/40">{dateleads.length} lead{dateleads.length !== 1 ? "s" : ""}</span>
                <div className="flex-1 h-px bg-gold/20" />
              </div>

              {/* Lead cards for this date */}
              <div className="space-y-2.5">
                {dateleads.map((l) => (
                  <div
                    key={l.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft hover:border-saffron/40 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-saffron to-maroon grid place-items-center text-white font-bold text-sm shadow-sm">
                      {l.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-maroon text-sm">{l.name}</h3>
                        {l.source && (
                          <span className="rounded-full bg-saffron/10 border border-saffron/20 px-2 py-0.5 text-[10px] font-bold text-saffron uppercase">
                            {l.source.replace("_", " ")}
                          </span>
                        )}
                      </div>

                      {/* Phone — WhatsApp link */}
                      <a
                        href={`https://wa.me/91${l.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-green-600 font-semibold mt-0.5 hover:underline w-fit"
                      >
                        <svg viewBox="0 0 32 32" className="h-3 w-3 fill-green-500 shrink-0"><path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.908 1.885 7.054L2 30l7.144-1.87A14.034 14.034 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.6a11.62 11.62 0 0 1-5.923-1.62l-.425-.252-4.24 1.11 1.132-4.134-.277-.446A11.563 11.563 0 0 1 4.4 16.003c0-6.4 5.203-11.6 11.603-11.6s11.598 5.2 11.598 11.6-5.198 11.597-11.598 11.597zm6.36-8.68c-.348-.174-2.063-1.018-2.383-1.133-.32-.116-.552-.174-.786.174-.233.348-.902 1.133-1.107 1.366-.203.232-.407.26-.755.086-.348-.174-1.47-.543-2.8-1.727-1.034-.922-1.73-2.06-1.934-2.407-.203-.348-.022-.535.152-.707.157-.155.348-.406.523-.61.174-.202.232-.347.348-.578.116-.232.058-.435-.03-.61-.086-.173-.785-1.892-1.075-2.59-.284-.682-.573-.59-.785-.6l-.67-.012c-.232 0-.61.087-.928.435-.32.347-1.22 1.192-1.22 2.91s1.25 3.378 1.422 3.61c.174.232 2.46 3.757 5.96 5.27.834.36 1.483.575 1.99.736.836.267 1.598.23 2.2.14.672-.1 2.063-.843 2.353-1.658.29-.812.29-1.51.203-1.658-.087-.145-.32-.23-.67-.406z"/></svg>
                        +91 {l.phone}
                      </a>

                      {l.puja_name && (
                        <p className="text-xs font-semibold text-saffron mt-1 truncate max-w-sm">
                          🪔 {l.puja_name}{l.package_label ? ` · ${l.package_label}` : ""}
                        </p>
                      )}

                      <p className="text-xs text-brown/40 mt-0.5 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(l.created_at).toLocaleString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Price + WhatsApp CTA */}
                    <div className="flex items-center gap-3 shrink-0">
                      {l.price && (
                        <span className="font-bold text-saffron text-lg">
                          ₹{l.price.toLocaleString("en-IN")}
                        </span>
                      )}
                      <a
                        href={`https://wa.me/91${l.phone}?text=${encodeURIComponent(`🙏 Namaste ${l.name}! Thank you for showing interest in ${l.puja_name || "our puja"}. We will get in touch with you shortly. — Narayan Kripa`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl bg-green-500 hover:bg-green-600 px-3 py-2 text-xs font-bold text-white transition-colors"
                      >
                        <svg viewBox="0 0 32 32" className="h-3.5 w-3.5 fill-white shrink-0"><path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.908 1.885 7.054L2 30l7.144-1.87A14.034 14.034 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.6a11.62 11.62 0 0 1-5.923-1.62l-.425-.252-4.24 1.11 1.132-4.134-.277-.446A11.563 11.563 0 0 1 4.4 16.003c0-6.4 5.203-11.6 11.603-11.6s11.598 5.2 11.598 11.6-5.198 11.597-11.598 11.597zm6.36-8.68c-.348-.174-2.063-1.018-2.383-1.133-.32-.116-.552-.174-.786.174-.233.348-.902 1.133-1.107 1.366-.203.232-.407.26-.755.086-.348-.174-1.47-.543-2.8-1.727-1.034-.922-1.73-2.06-1.934-2.407-.203-.348-.022-.535.152-.707.157-.155.348-.406.523-.61.174-.202.232-.347.348-.578.116-.232.058-.435-.03-.61-.086-.173-.785-1.892-1.075-2.59-.284-.682-.573-.59-.785-.6l-.67-.012c-.232 0-.61.087-.928.435-.32.347-1.22 1.192-1.22 2.91s1.25 3.378 1.422 3.61c.174.232 2.46 3.757 5.96 5.27.834.36 1.483.575 1.99.736.836.267 1.598.23 2.2.14.672-.1 2.063-.843 2.353-1.658.29-.812.29-1.51.203-1.658-.087-.145-.32-.23-.67-.406z"/></svg>
                        Chat
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadManager;
