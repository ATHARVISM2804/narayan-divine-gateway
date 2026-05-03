import { useState, useMemo } from 'react';
import { LayoutDashboard, Flame, Flower2, Image, Settings, ChevronRight, Menu, X } from 'lucide-react';
import type { NavSection, PujaProduct, ChadhavaProduct } from '../types';

// ─── Sidebar ────────────────────────────────────────────────────

const navItems: { id: NavSection; label: string; icon: typeof LayoutDashboard; emoji: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '📊' },
  { id: 'puja', label: 'Puja Products', icon: Flame, emoji: '🪔' },
  { id: 'chadhava', label: 'Chadhava Products', icon: Flower2, emoji: '🌸' },
  { id: 'media', label: 'Media Manager', icon: Image, emoji: '🖼️' },
  { id: 'settings', label: 'Settings', icon: Settings, emoji: '⚙️' },
];

export const Sidebar = ({
  active, onNavigate, mobileOpen, onMobileClose,
}: {
  active: NavSection; onNavigate: (s: NavSection) => void;
  mobileOpen: boolean; onMobileClose: () => void;
}) => {
  const handleNav = (s: NavSection) => {
    onNavigate(s);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 lg:hidden" onClick={onMobileClose} />
      )}

      <aside className={`fixed left-0 top-0 z-[70] flex h-full w-60 flex-col bg-stone-900 text-stone-100 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header + mobile close */}
        <div className="flex items-center justify-between border-b border-stone-800 px-3 py-3">
          <div className="flex items-center gap-1">
            <img
              src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712834/favicon-removebg-preview_kx4s41.png"
              alt="Narayan Kripa Logo Icon"
              className="h-14 w-auto object-contain"
            />
            <img
              src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712826/Screenshot_2026-05-02_143432-removebg-preview_vqcmpo.png"
              alt="Narayan Kripa Text"
              className="h-9 w-auto object-contain"
            />
          </div>
          <button onClick={onMobileClose} className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-800 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active === item.id
                  ? 'bg-orange-700 text-white shadow-lg shadow-orange-900/30'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              <span>{item.label}</span>
              {active === item.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="border-t border-stone-800 p-4">
          <p className="text-center text-[10px] text-stone-500">© 2026 Narayan Kripa</p>
        </div>
      </aside>
    </>
  );
};

// ─── Header ─────────────────────────────────────────────────────

const sectionTitles: Record<NavSection, string> = {
  dashboard: 'Dashboard',
  puja: 'Puja Products',
  chadhava: 'Chadhava Products',
  media: 'Media Manager',
  settings: 'Settings',
};

export const Header = ({
  section, onAddNew, onMenuToggle,
}: { section: NavSection; onAddNew?: () => void; onMenuToggle: () => void }) => (
  <header className="sticky top-0 z-40 flex items-center justify-between border-b border-amber-100 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
    <div className="flex items-center gap-3">
      <button onClick={onMenuToggle} className="grid h-9 w-9 place-items-center rounded-lg text-stone-600 transition hover:bg-amber-100 lg:hidden">
        <Menu size={20} />
      </button>
      <h2 className="text-lg font-bold text-stone-800 sm:text-xl">{sectionTitles[section]}</h2>
    </div>
    {(section === 'puja' || section === 'chadhava') && onAddNew && (
      <button onClick={onAddNew} className="flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow transition hover:bg-orange-700 hover:shadow-md sm:px-4 sm:text-sm">
        <span className="text-lg leading-none">+</span>
        <span className="hidden xs:inline">Add New</span> {section === 'puja' ? 'Puja' : 'Chadhava'}
      </button>
    )}
  </header>
);

// ─── Dashboard ──────────────────────────────────────────────────

export const Dashboard = ({
  pujas, chadhavas, onNavigate, onAddPuja, onAddChadhava,
}: {
  pujas: PujaProduct[]; chadhavas: ChadhavaProduct[];
  onNavigate: (s: NavSection) => void; onAddPuja: () => void; onAddChadhava: () => void;
}) => {
  const totalPujas = pujas.length;
  const totalChadhavas = chadhavas.length;
  const activePujas = pujas.filter(p => p.status === 'active').length;
  const activeChadhavas = chadhavas.filter(c => c.status === 'active').length;
  const activeTotal = activePujas + activeChadhavas;
  const featuredCount = pujas.filter(p => p.featured).length;

  const recentItems = useMemo(() => {
    const all = [
      ...pujas.map(p => ({ name: p.name, type: 'Puja' as const, price: p.price, status: p.status, lastModified: p.lastModified })),
      ...chadhavas.map(c => ({ name: c.temple, type: 'Chadhava' as const, price: c.price, status: c.status, lastModified: c.lastModified })),
    ];
    return all.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).slice(0, 5);
  }, [pujas, chadhavas]);

  const stats = [
    { emoji: '🪔', label: 'Total Pujas', value: totalPujas, sub: `${activePujas} active` },
    { emoji: '🌸', label: 'Total Chadhavas', value: totalChadhavas, sub: `${activeChadhavas} active` },
    { emoji: '✅', label: 'Active Products', value: activeTotal, sub: 'across both pages' },
    { emoji: '⭐', label: 'Featured Items', value: featuredCount, sub: 'puja featured' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl">{s.emoji}</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 sm:text-xs">{s.label}</p>
                <p className="text-xl font-bold text-stone-800 sm:text-2xl">{s.value}</p>
                <p className="text-[10px] text-stone-500 sm:text-xs">{s.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Modified */}
      <div className="rounded-xl border border-amber-100 bg-white shadow-sm">
        <div className="border-b border-amber-100 px-4 py-3 sm:px-5 sm:py-4">
          <h3 className="font-bold text-stone-800">Recently Modified</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-amber-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                <th className="px-4 py-3 sm:px-5">Product Name</th>
                <th className="px-4 py-3 sm:px-5">Type</th>
                <th className="px-4 py-3 sm:px-5">Price</th>
                <th className="px-4 py-3 sm:px-5">Status</th>
                <th className="px-4 py-3 sm:px-5">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {recentItems.map((item, idx) => (
                <tr key={idx} className="transition hover:bg-amber-50">
                  <td className="px-4 py-3 text-sm font-medium text-stone-800 sm:px-5">{item.name}</td>
                  <td className="px-4 py-3 sm:px-5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${item.type === 'Puja' ? 'bg-orange-100 text-orange-700' : 'bg-pink-100 text-pink-700'}`}>
                      {item.type === 'Puja' ? '🪔' : '🌸'} {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-orange-700 sm:px-5">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 sm:px-5">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      item.status === 'active' ? 'border-green-200 bg-green-100 text-green-800'
                      : item.status === 'coming_soon' ? 'border-amber-200 bg-amber-100 text-amber-800'
                      : 'border-gray-200 bg-gray-100 text-gray-600'
                    }`}>
                      {item.status === 'coming_soon' ? 'Coming Soon' : item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-500 sm:px-5">{new Date(item.lastModified).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 font-bold text-stone-800">Quick Actions</h3>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={onAddPuja} className="flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-700 sm:px-4 sm:text-sm">
            + Add New Puja
          </button>
          <button onClick={onAddChadhava} className="flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-700 sm:px-4 sm:text-sm">
            + Add New Chadhava
          </button>
          <button onClick={() => onNavigate('puja')} className="rounded-lg border border-orange-600 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50 sm:px-4 sm:text-sm">
            View Active Pujas
          </button>
          <button onClick={() => onNavigate('chadhava')} className="rounded-lg border border-orange-600 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50 sm:px-4 sm:text-sm">
            View Active Chadhavas
          </button>
        </div>
      </div>
    </div>
  );
};
