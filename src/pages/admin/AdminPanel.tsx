import { useState, useCallback } from 'react';
import type { PujaProduct, ChadhavaProduct, SiteSettings, ToastData, NavSection } from './types';
import { INITIAL_PUJAS, INITIAL_CHADHAVAS, INITIAL_SETTINGS } from './constants';
import { Sidebar, Header, Dashboard } from './components/Layout';
import { PujaList } from './components/PujaList';
import { PujaForm } from './components/PujaForm';
import { ChadhavaList } from './components/ChadhavaList';
import { ChadhavaForm } from './components/ChadhavaForm';
import { MediaManager } from './components/MediaManager';
import { SettingsPanel } from './components/SettingsPanel';
import { ToastContainer } from './components/SharedUI';

// ─── Utility ────────────────────────────────────────────────────

let nextId = 100;
const genId = () => ++nextId;

// ─── Root Admin Panel ───────────────────────────────────────────

const AdminPanel = () => {
  // State
  const [section, setSection] = useState<NavSection>('dashboard');
  const [pujas, setPujas] = useState<PujaProduct[]>(INITIAL_PUJAS);
  const [chadhavas, setChadhavas] = useState<ChadhavaProduct[]>(INITIAL_CHADHAVAS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [editPuja, setEditPuja] = useState<PujaProduct | null | undefined>(undefined); // undefined=closed, null=new, PujaProduct=edit
  const [editChadhava, setEditChadhava] = useState<ChadhavaProduct | null | undefined>(undefined);

  // Toast helpers
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Puja CRUD ─────────────────────────────────────────────────

  const handleSavePuja = useCallback((p: PujaProduct) => {
    if (p.id === 0) {
      // New
      setPujas(prev => [{ ...p, id: genId() }, ...prev]);
    } else {
      // Update
      setPujas(prev => prev.map(x => x.id === p.id ? p : x));
    }
    setEditPuja(undefined);
  }, []);

  const handleDuplicatePuja = useCallback((p: PujaProduct) => {
    const dup: PujaProduct = {
      ...p,
      id: genId(),
      name: `Copy of ${p.name}`,
      status: 'inactive',
      featured: false,
      lastModified: new Date().toISOString(),
    };
    setPujas(prev => [dup, ...prev]);
    showToast(`Duplicated "${p.name}"`, 'success');
  }, [showToast]);

  const handleDeletePuja = useCallback((id: number) => {
    setPujas(prev => prev.filter(p => p.id !== id));
    showToast('Puja deleted', 'success');
  }, [showToast]);

  const handleBulkPuja = useCallback((ids: number[], action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'delete') {
      setPujas(prev => prev.filter(p => !ids.includes(p.id)));
      showToast(`${ids.length} puja(s) deleted`, 'success');
    } else {
      const status = action === 'activate' ? 'active' : 'inactive';
      setPujas(prev => prev.map(p => ids.includes(p.id) ? { ...p, status, lastModified: new Date().toISOString() } : p));
      showToast(`${ids.length} puja(s) ${action}d`, 'success');
    }
  }, [showToast]);

  // ── Chadhava CRUD ─────────────────────────────────────────────

  const handleSaveChadhava = useCallback((c: ChadhavaProduct) => {
    if (c.id === 0) {
      setChadhavas(prev => [{ ...c, id: genId() }, ...prev]);
    } else {
      setChadhavas(prev => prev.map(x => x.id === c.id ? c : x));
    }
    setEditChadhava(undefined);
  }, []);

  const handleDuplicateChadhava = useCallback((c: ChadhavaProduct) => {
    const dup: ChadhavaProduct = {
      ...c,
      id: genId(),
      temple: `Copy of ${c.temple}`,
      status: 'inactive',
      lastModified: new Date().toISOString(),
    };
    setChadhavas(prev => [dup, ...prev]);
    showToast(`Duplicated "${c.temple}"`, 'success');
  }, [showToast]);

  const handleDeleteChadhava = useCallback((id: number) => {
    setChadhavas(prev => prev.filter(c => c.id !== id));
    showToast('Chadhava deleted', 'success');
  }, [showToast]);

  const handleBulkChadhava = useCallback((ids: number[], action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'delete') {
      setChadhavas(prev => prev.filter(c => !ids.includes(c.id)));
      showToast(`${ids.length} chadhava(s) deleted`, 'success');
    } else {
      const status = action === 'activate' ? 'active' : 'inactive';
      setChadhavas(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: status as 'active' | 'inactive', lastModified: new Date().toISOString() } : c));
      showToast(`${ids.length} chadhava(s) ${action}d`, 'success');
    }
  }, [showToast]);

  // ── Media Manager helpers ─────────────────────────────────────

  const handleUpdatePujaImage = useCallback((id: number, field: 'primaryImage' | number, url: string) => {
    setPujas(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (field === 'primaryImage') return { ...p, primaryImage: url, lastModified: new Date().toISOString() };
      const imgs = [...p.additionalImages];
      imgs[field] = url;
      return { ...p, additionalImages: imgs, lastModified: new Date().toISOString() };
    }));
    showToast('Image updated', 'success');
  }, [showToast]);

  const handleUpdateChadhavaImage = useCallback((id: number, field: 'primaryImage' | number, url: string) => {
    setChadhavas(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (field === 'primaryImage') return { ...c, primaryImage: url, lastModified: new Date().toISOString() };
      const imgs = [...c.additionalImages];
      imgs[field] = url;
      return { ...c, additionalImages: imgs, lastModified: new Date().toISOString() };
    }));
    showToast('Image updated', 'success');
  }, [showToast]);

  // ── Dashboard quick actions ───────────────────────────────────

  const handleDashboardAddPuja = useCallback(() => {
    setSection('puja');
    setTimeout(() => setEditPuja(null), 100);
  }, []);

  const handleDashboardAddChadhava = useCallback(() => {
    setSection('chadhava');
    setTimeout(() => setEditChadhava(null), 100);
  }, []);

  // ── Add New (contextual header button) ────────────────────────

  const handleAddNew = useCallback(() => {
    if (section === 'puja') setEditPuja(null);
    else if (section === 'chadhava') setEditChadhava(null);
  }, [section]);

  return (
    <div className="flex min-h-screen bg-amber-50 font-body">
      <Sidebar active={section} onNavigate={setSection} mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col lg:ml-60">
        <Header section={section} onAddNew={handleAddNew} onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {section === 'dashboard' && (
            <Dashboard
              pujas={pujas}
              chadhavas={chadhavas}
              onNavigate={setSection}
              onAddPuja={handleDashboardAddPuja}
              onAddChadhava={handleDashboardAddChadhava}
            />
          )}

          {section === 'puja' && (
            <PujaList
              pujas={pujas}
              onEdit={p => setEditPuja(p)}
              onDuplicate={handleDuplicatePuja}
              onDelete={handleDeletePuja}
              onBulkAction={handleBulkPuja}
            />
          )}

          {section === 'chadhava' && (
            <ChadhavaList
              chadhavas={chadhavas}
              onEdit={c => setEditChadhava(c)}
              onDuplicate={handleDuplicateChadhava}
              onDelete={handleDeleteChadhava}
              onBulkAction={handleBulkChadhava}
            />
          )}

          {section === 'media' && (
            <MediaManager
              pujas={pujas}
              chadhavas={chadhavas}
              onUpdatePujaImage={handleUpdatePujaImage}
              onUpdateChadhavaImage={handleUpdateChadhavaImage}
            />
          )}

          {section === 'settings' && (
            <SettingsPanel settings={settings} onSave={setSettings} showToast={showToast} />
          )}
        </main>
      </div>

      {/* Puja Form Panel */}
      {editPuja !== undefined && (
        <PujaForm
          puja={editPuja}
          defaultIncludes={settings.defaultPujaIncludes}
          defaultDelivery={settings.defaultPujaDelivery}
          onSave={handleSavePuja}
          onClose={() => setEditPuja(undefined)}
          showToast={showToast}
        />
      )}

      {/* Chadhava Form Panel */}
      {editChadhava !== undefined && (
        <ChadhavaForm
          chadhava={editChadhava}
          defaultReceives={settings.defaultChadhavaReceives}
          defaultDelivery={settings.defaultChadhavaDelivery}
          onSave={handleSaveChadhava}
          onClose={() => setEditChadhava(undefined)}
          showToast={showToast}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default AdminPanel;
