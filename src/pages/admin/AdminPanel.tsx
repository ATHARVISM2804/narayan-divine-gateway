import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, type Puja, type Chadhava } from "@/lib/supabase";
import { LayoutDashboard, Flame, Flower2, ShoppingBag, LogOut, Menu, X, ChevronRight } from "lucide-react";
import PujaManager from "./PujaManager";
import ChadhavaManager from "./ChadhavaManager";
import OrderManager from "./OrderManager";

type Section = "dashboard" | "pujas" | "chadhavas" | "orders";

const NAV = [
  { id: "dashboard" as const, label: "Dashboard", Icon: LayoutDashboard },
  { id: "pujas" as const, label: "Pujas", Icon: Flame },
  { id: "chadhavas" as const, label: "Chadhavas", Icon: Flower2 },
  { id: "orders" as const, label: "Orders", Icon: ShoppingBag },
];

/* ───────── Main Admin Panel ───────── */

const AdminPanel = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [chadhavas, setChadhavas] = useState<Chadhava[]>([]);

  /* Auth check — only the admin email can access */
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        nav("/admin/login");
      } else if (ADMIN_EMAIL && data.user.email !== ADMIN_EMAIL) {
        // Not the admin — redirect away
        nav("/");
      } else {
        setLoading(false);
      }
    });
  }, [nav, ADMIN_EMAIL]);

  /* Fetch data */
  const fetchPujas = async () => {
    const { data } = await supabase.from("pujas").select("*").order("created_at", { ascending: false });
    if (data) setPujas(data as Puja[]);
  };
  const fetchChadhavas = async () => {
    const { data } = await supabase.from("chadhavas").select("*").order("created_at", { ascending: false });
    if (data) setChadhavas(data as Chadhava[]);
  };

  useEffect(() => {
    if (!loading) { fetchPujas(); fetchChadhavas(); }
  }, [loading]);

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/admin/login");
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-saffron" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream font-body">
      {/* ── Sidebar (desktop) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-gold/30 bg-maroon-deep lg:flex">
        <div className="flex items-center gap-2 px-5 py-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-saffron"><Flame size={18} className="text-white" /></div>
          <span className="font-display text-lg text-gold">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setSection(n.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                section === n.id ? "bg-saffron/20 text-gold" : "text-cream/70 hover:bg-cream/10 hover:text-cream"
              }`}
            ><n.Icon size={18} />{n.label}</button>
          ))}
        </nav>
        <button onClick={logout} className="m-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-cream/60 hover:bg-cream/10 hover:text-cream transition-all">
          <LogOut size={18} />Logout
        </button>
      </aside>

      {/* ── Mobile nav overlay ── */}
      {mobileNav && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNav(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-maroon-deep shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-5">
              <span className="font-display text-lg text-gold">Admin</span>
              <button onClick={() => setMobileNav(false)} className="text-cream/70"><X size={20} /></button>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {NAV.map((n) => (
                <button key={n.id} onClick={() => { setSection(n.id); setMobileNav(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    section === n.id ? "bg-saffron/20 text-gold" : "text-cream/70 hover:bg-cream/10"
                  }`}
                ><n.Icon size={18} />{n.label}</button>
              ))}
            </nav>
            <button onClick={logout} className="m-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-cream/60 hover:bg-cream/10 transition-all">
              <LogOut size={18} />Logout
            </button>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col lg:ml-60">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gold/30 bg-ivory/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="lg:hidden text-maroon"><Menu size={22} /></button>
            <h2 className="font-display text-lg text-maroon capitalize">{section}</h2>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          {section === "dashboard" && (
            <Dashboard pujas={pujas} chadhavas={chadhavas} onNavigate={setSection} />
          )}
          {section === "pujas" && (
            <PujaManager pujas={pujas} onRefresh={fetchPujas} />
          )}
          {section === "chadhavas" && (
            <ChadhavaManager chadhavas={chadhavas} onRefresh={fetchChadhavas} />
          )}
          {section === "orders" && (
            <OrderManager />
          )}
        </main>
      </div>
    </div>
  );
};

/* ───────── Dashboard ───────── */

const Dashboard = ({
  pujas, chadhavas, onNavigate,
}: {
  pujas: Puja[]; chadhavas: Chadhava[]; onNavigate: (s: Section) => void;
}) => {
  const stats = [
    { label: "Total Pujas", value: pujas.length, active: pujas.filter((p) => p.status === "active").length, color: "from-saffron to-maroon", icon: "🪔" },
    { label: "Total Chadhavas", value: chadhavas.length, active: chadhavas.filter((c) => c.status === "active").length, color: "from-gold to-saffron", icon: "🌺" },
    { label: "Active Products", value: pujas.filter((p) => p.status === "active").length + chadhavas.filter((c) => c.status === "active").length, active: null, color: "from-green-500 to-emerald-600", icon: "✅" },
    { label: "Drafts", value: pujas.filter((p) => p.status === "draft").length + chadhavas.filter((c) => c.status === "draft").length, active: null, color: "from-gray-400 to-gray-500", icon: "📝" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gold/40 bg-ivory p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className={`rounded-full bg-gradient-to-r ${s.color} px-3 py-1 text-xs font-bold text-white`}>{s.value}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-maroon">{s.label}</p>
            {s.active !== null && <p className="text-xs text-brown/60">{s.active} active</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {([
          { label: "Manage Pujas", desc: "Add, edit or remove puja listings", sec: "pujas" as const, icon: "🪔" },
          { label: "Manage Chadhavas", desc: "Add, edit or remove chadhava offerings", sec: "chadhavas" as const, icon: "🌺" },
        ]).map((c) => (
          <button key={c.sec} onClick={() => onNavigate(c.sec)}
            className="flex items-center gap-4 rounded-2xl border border-gold/40 bg-ivory p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-saffron/50"
          >
            <span className="text-3xl">{c.icon}</span>
            <div className="flex-1">
              <p className="font-display text-maroon">{c.label}</p>
              <p className="text-xs text-brown/60">{c.desc}</p>
            </div>
            <ChevronRight size={18} className="text-gold" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
