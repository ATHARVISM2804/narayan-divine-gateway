import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { supabase, type Puja, type Chadhava, type Temple } from "@/lib/supabase";
import { adminPath, sectionFromParam, type AdminSection } from "@/lib/adminSections";
import ErrorBoundary from "@/components/ErrorBoundary";
import { LayoutDashboard, Flame, Flower2, ShoppingBag, LogOut, Menu, X, ChevronRight, Users, Landmark, MessageSquareQuote, CircleCheck, FilePen } from "lucide-react";
import PujaManager from "./PujaManager";
import ChadhavaManager from "./ChadhavaManager";
import OrderManager from "./OrderManager";
import LeadManager from "./LeadManager";
import TempleManager from "./TempleManager";
import ReviewManager from "./ReviewManager";

type Section = AdminSection;

const NAV: { id: Section; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: "dashboard" as const, label: "Dashboard", Icon: LayoutDashboard },
  { id: "pujas"     as const, label: "Poojas",     Icon: Flame },
  { id: "chadhavas" as const, label: "Chadhavas", Icon: Flower2 },
  { id: "temples"   as const, label: "Temples",   Icon: Landmark },
  { id: "reviews"   as const, label: "Reviews",   Icon: MessageSquareQuote },
  { id: "orders"    as const, label: "Orders",    Icon: ShoppingBag },
  { id: "leads"     as const, label: "Leads",     Icon: Users },
];

/* ───────── Main Admin Panel ───────── */

const AdminPanel = () => {
  const nav = useNavigate();
  // The open tab comes from the URL (/admin/orders…), not memory, so a reload keeps it.
  const section = sectionFromParam(useParams().section);
  const setSection = (s: Section) => { if (s !== section) nav(adminPath(s)); };
  const [mobileNav, setMobileNav] = useState(false);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [chadhavas, setChadhavas] = useState<Chadhava[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);

  /* Who may open this is checked by ProtectedAdminRoute (App.tsx) from the saved login,
     and the database rules check the admin email on every request. A second
     supabase.auth.getUser() here only added a network round trip, with a spinner,
     before any data started loading. */

  /* Orders and Leads stay mounted once opened (hidden when another tab is open), so
     going back to them shows the list at once instead of downloading it all again. */
  const [opened, setOpened] = useState<Section[]>(() => (section ? [section] : []));
  if (section && !opened.includes(section)) setOpened([...opened, section]);
  const keepAlive = (s: "orders" | "leads") => opened.includes(s);

  /* Fetch data */
  const fetchPujas = async () => {
    const { data } = await supabase.from("pujas").select("*").order("created_at", { ascending: false });
    if (data) setPujas(data as Puja[]);
  };
  const fetchChadhavas = async () => {
    const { data } = await supabase.from("chadhavas").select("*").order("created_at", { ascending: false });
    if (data) setChadhavas(data as Chadhava[]);
  };
  const fetchTemples = async () => {
    const { data } = await supabase.from("temples").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    if (data) setTemples(data as Temple[]);
  };

  useEffect(() => { fetchPujas(); fetchChadhavas(); fetchTemples(); }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/admin/login");
  };

  // Unknown tab in the URL (/admin/typo): go to the dashboard.
  if (!section) return <Navigate to="/admin" replace />;

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
      {/* min-w-0: let this column shrink to the screen; without it one long single-line
          puja name in an order card widened the whole admin page on phones. */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-60">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gold/30 bg-ivory px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="lg:hidden text-maroon"><Menu size={22} /></button>
            <h2 className="font-display text-lg text-maroon capitalize">{section}</h2>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Per tab: now that a reload reopens the same tab, a crash in one tab must
              not hide the sidebar, or the admin could never leave it. */}
          <ErrorBoundary resetKey={section}>
          {section === "dashboard" && (
            <Dashboard pujas={pujas} chadhavas={chadhavas} onNavigate={setSection} />
          )}
          {section === "pujas" && (
            <PujaManager pujas={pujas} onRefresh={fetchPujas} />
          )}
          {section === "chadhavas" && (
            <ChadhavaManager chadhavas={chadhavas} onRefresh={fetchChadhavas} />
          )}
          {section === "temples" && (
            <TempleManager temples={temples} onRefresh={fetchTemples} />
          )}
          {section === "reviews" && (
            <ReviewManager pujas={pujas} chadhavas={chadhavas} />
          )}
          </ErrorBoundary>
          {keepAlive("orders") && (
            <div hidden={section !== "orders"}>
              <ErrorBoundary><OrderManager /></ErrorBoundary>
            </div>
          )}
          {keepAlive("leads") && (
            <div hidden={section !== "leads"}>
              <ErrorBoundary><LeadManager /></ErrorBoundary>
            </div>
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
    { label: "Total Poojas", value: pujas.length, active: pujas.filter((p) => p.status === "active").length, color: "from-saffron to-maroon", Icon: Flame },
    { label: "Total Chadhavas", value: chadhavas.length, active: chadhavas.filter((c) => c.status === "active").length, color: "from-gold to-saffron", Icon: Flower2 },
    { label: "Active Products", value: pujas.filter((p) => p.status === "active").length + chadhavas.filter((c) => c.status === "active").length, active: null, color: "from-green-500 to-emerald-600", Icon: CircleCheck },
    { label: "Drafts", value: pujas.filter((p) => p.status === "draft").length + chadhavas.filter((c) => c.status === "draft").length, active: null, color: "from-gray-400 to-gray-500", Icon: FilePen },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gold/40 bg-ivory p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <s.Icon size={22} className="text-maroon" />
              <span className={`rounded-full bg-gradient-to-r ${s.color} px-3 py-1 text-xs font-bold text-white`}>{s.value}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-maroon">{s.label}</p>
            {s.active !== null && <p className="text-xs text-brown/60">{s.active} active</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {([
          { label: "Manage Poojas", desc: "Add, edit or remove pooja listings", sec: "pujas" as const, Icon: Flame },
          { label: "Manage Chadhavas", desc: "Add, edit or remove chadhava offerings", sec: "chadhavas" as const, Icon: Flower2 },
        ]).map((c) => (
          <button key={c.sec} onClick={() => onNavigate(c.sec)}
            className="flex items-center gap-4 rounded-2xl border border-gold/40 bg-ivory p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-saffron/50"
          >
            <c.Icon size={26} className="text-saffron" />
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
