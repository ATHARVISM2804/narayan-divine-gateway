import { useState, useCallback, useMemo } from 'react';
import { Search, Edit3, Copy, Trash2, Star, ChevronDown } from 'lucide-react';
import type { PujaProduct } from '../types';
import { DEITIES, PURPOSES, LANGUAGES } from '../constants';
import { StatusBadge, ImagePreview, Pagination, ConfirmModal } from './SharedUI';

interface PujaListProps {
  pujas: PujaProduct[];
  onEdit: (p: PujaProduct) => void;
  onDuplicate: (p: PujaProduct) => void;
  onDelete: (id: number) => void;
  onBulkAction: (ids: number[], action: 'activate' | 'deactivate' | 'delete') => void;
}

export const PujaList = ({ pujas, onEdit, onDuplicate, onDelete, onBulkAction }: PujaListProps) => {
  const [search, setSearch] = useState('');
  const [filterDeity, setFilterDeity] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<PujaProduct | null>(null);
  const perPage = 10;

  const filtered = useMemo(() => {
    let list = [...pujas];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.deity.toLowerCase().includes(q) ||
        p.purpose.toLowerCase().includes(q)
      );
    }
    if (filterDeity) list = list.filter(p => p.deity === filterDeity);
    if (filterPurpose) list = list.filter(p => p.purpose === filterPurpose);
    if (filterStatus) list = list.filter(p => p.status === filterStatus);
    if (filterLanguage) list = list.filter(p => p.language === filterLanguage);
    return list;
  }, [pujas, search, filterDeity, filterPurpose, filterStatus, filterLanguage]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);

  const allOnPageSelected = paged.length > 0 && paged.every(p => selectedIds.includes(p.id));

  const toggleAll = useCallback(() => {
    if (allOnPageSelected) {
      setSelectedIds(prev => prev.filter(id => !paged.find(p => p.id === id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...paged.map(p => p.id)])]);
    }
  }, [allOnPageSelected, paged]);

  const toggleOne = useCallback((id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const FilterSelect = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) => (
    <div className="relative">
      <select value={value} onChange={e => { onChange(e.target.value); setPage(1); }}
        className="appearance-none rounded-lg border border-amber-200 bg-white py-2 pl-3 pr-8 text-sm text-stone-700 transition focus:outline-none focus:ring-2 focus:ring-orange-400">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
    </div>
  );

  return (
    <div className="space-y-4 p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, deity, purpose..."
            className="w-full rounded-lg border border-amber-200 bg-white py-2 pl-9 pr-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <FilterSelect value={filterDeity} onChange={setFilterDeity} options={DEITIES} placeholder="Deity ▼" />
        <FilterSelect value={filterPurpose} onChange={setFilterPurpose} options={PURPOSES} placeholder="Purpose ▼" />
        <FilterSelect value={filterStatus} onChange={setFilterStatus} options={['active', 'inactive', 'coming_soon']} placeholder="Status ▼" />
        <FilterSelect value={filterLanguage} onChange={setFilterLanguage} options={LANGUAGES} placeholder="Language ▼" />
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-orange-50 border border-orange-200 px-4 py-2.5">
          <span className="text-sm font-medium text-orange-800">{selectedIds.length} selected</span>
          <button onClick={() => { onBulkAction(selectedIds, 'activate'); setSelectedIds([]); }} className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700">Activate</button>
          <button onClick={() => { onBulkAction(selectedIds, 'deactivate'); setSelectedIds([]); }} className="rounded-md bg-gray-500 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-600">Deactivate</button>
          <button onClick={() => { onBulkAction(selectedIds, 'delete'); setSelectedIds([]); }} className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">Delete</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-amber-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} className="rounded border-amber-300 accent-orange-600" />
              </th>
              <th className="px-4 py-3 w-14">Image</th>
              <th className="px-4 py-3">Puja Name</th>
              <th className="px-4 py-3">Deity</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Lang</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Price ₹</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {paged.map(p => (
              <tr key={p.id} className="transition hover:bg-amber-50">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleOne(p.id)} className="rounded border-amber-300 accent-orange-600" />
                </td>
                <td className="px-4 py-3"><ImagePreview url={p.primaryImage} size="sm" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-stone-800">{p.name}</span>
                    {p.featured && <Star size={14} className="fill-amber-400 text-amber-400" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-stone-600">{p.deity}</td>
                <td className="px-4 py-3 text-sm text-stone-600">{p.purpose}</td>
                <td className="px-4 py-3 text-sm text-stone-600">{p.language}</td>
                <td className="px-4 py-3 text-sm text-stone-600">{p.duration} hrs</td>
                <td className="px-4 py-3 text-sm font-semibold text-orange-700">₹{p.price.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onEdit(p)} title="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-amber-100 hover:text-orange-600"><Edit3 size={15} /></button>
                    <button onClick={() => onDuplicate(p)} title="Duplicate" className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-amber-100 hover:text-blue-600"><Copy size={15} /></button>
                    <button onClick={() => setDeleteTarget(p)} title="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-stone-400">No pujas found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {deleteTarget && (
        <ConfirmModal
          title={`Delete "${deleteTarget.name}"?`}
          message="This will permanently remove this product. This action cannot be undone."
          onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
