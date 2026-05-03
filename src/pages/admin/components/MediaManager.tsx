import { useState, useMemo, useCallback } from 'react';
import { Search, Copy, Edit3, Check } from 'lucide-react';
import type { PujaProduct, ChadhavaProduct } from '../types';
import { ImagePreview } from './SharedUI';

interface MediaManagerProps {
  pujas: PujaProduct[];
  chadhavas: ChadhavaProduct[];
  onUpdatePujaImage: (id: number, field: 'primaryImage' | number, url: string) => void;
  onUpdateChadhavaImage: (id: number, field: 'primaryImage' | number, url: string) => void;
}

interface MediaItem {
  productId: number;
  productName: string;
  type: 'Puja' | 'Chadhava';
  imageUrl: string;
  field: 'primaryImage' | number;
}

export const MediaManager = ({ pujas, chadhavas, onUpdatePujaImage, onUpdateChadhavaImage }: MediaManagerProps) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Puja' | 'Chadhava'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');

  const allMedia = useMemo(() => {
    const items: MediaItem[] = [];
    pujas.forEach(p => {
      if (p.primaryImage) items.push({ productId: p.id, productName: p.name, type: 'Puja', imageUrl: p.primaryImage, field: 'primaryImage' });
      p.additionalImages.forEach((url, idx) => {
        if (url) items.push({ productId: p.id, productName: p.name, type: 'Puja', imageUrl: url, field: idx });
      });
    });
    chadhavas.forEach(c => {
      if (c.primaryImage) items.push({ productId: c.id, productName: c.temple, type: 'Chadhava', imageUrl: c.primaryImage, field: 'primaryImage' });
      c.additionalImages.forEach((url, idx) => {
        if (url) items.push({ productId: c.id, productName: c.temple, type: 'Chadhava', imageUrl: url, field: idx });
      });
    });
    return items;
  }, [pujas, chadhavas]);

  const filtered = useMemo(() => {
    let list = allMedia;
    if (typeFilter !== 'All') list = list.filter(m => m.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.productName.toLowerCase().includes(q));
    }
    return list;
  }, [allMedia, typeFilter, search]);

  const getKey = (m: MediaItem) => `${m.type}-${m.productId}-${m.field}`;

  const handleCopy = useCallback(async (url: string, key: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleReplace = useCallback((m: MediaItem) => {
    if (m.type === 'Puja') onUpdatePujaImage(m.productId, m.field, editUrl);
    else onUpdateChadhavaImage(m.productId, m.field, editUrl);
    setEditingId(null);
    setEditUrl('');
  }, [editUrl, onUpdatePujaImage, onUpdateChadhavaImage]);

  const tabBtnCls = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition ${active ? 'bg-orange-600 text-white' : 'text-stone-600 hover:bg-amber-100'}`;

  return (
    <div className="space-y-4 p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name..."
            className="w-full rounded-lg border border-amber-200 bg-white py-2 pl-9 pr-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div className="flex gap-1 rounded-lg bg-amber-50 p-1">
          {(['All', 'Puja', 'Chadhava'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={tabBtnCls(typeFilter === t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(m => {
          const key = getKey(m);
          const isEditing = editingId === key;
          return (
            <div key={key} className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="mb-3">
                <ImagePreview url={m.imageUrl} size="lg" />
              </div>
              <p className="text-sm font-semibold text-stone-800 truncate">{m.productName}</p>
              <p className="flex items-center gap-1.5 text-xs text-stone-500">
                <span>{m.type === 'Puja' ? '🪔' : '🌸'}</span> {m.type}
                {typeof m.field === 'number' && <span className="text-stone-400">• Image {m.field + 2}</span>}
              </p>

              {isEditing ? (
                <div className="mt-3 space-y-2">
                  <input value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="New image URL"
                    className="w-full rounded-lg border border-amber-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <div className="flex gap-2">
                    <button onClick={() => handleReplace(m)} className="rounded-md bg-orange-600 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-700">Save</button>
                    <button onClick={() => { setEditingId(null); setEditUrl(''); }} className="rounded-md border border-stone-300 px-3 py-1 text-xs text-stone-600 hover:bg-stone-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleCopy(m.imageUrl, key)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${copiedId === key ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-stone-600 hover:bg-amber-100'}`}>
                    {copiedId === key ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy URL</>}
                  </button>
                  <button onClick={() => { setEditingId(key); setEditUrl(m.imageUrl); }}
                    className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-amber-100">
                    <Edit3 size={12} /> Replace
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-stone-400">No media items found.</div>
      )}
    </div>
  );
};
