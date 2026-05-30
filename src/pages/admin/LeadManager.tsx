import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Download, Search, Phone, User, Calendar } from "lucide-react";

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

const LeadManager = () => {
  const [leads,   setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.puja_name || "").toLowerCase().includes(q)
    );
  }, [leads, search]);

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

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Leads",   value: leads.length,                                              icon: "📋" },
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

      {/* Leads list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gold/10 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-display text-maroon">No leads yet</p>
          <p className="text-xs text-brown/50 mt-1">
            Leads appear here when customers fill their details before booking a puja.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((l) => (
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
      )}
    </div>
  );
};

export default LeadManager;
