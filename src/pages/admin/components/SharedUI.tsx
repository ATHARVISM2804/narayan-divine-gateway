import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Image as ImageIcon, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ToastData } from '../types';

// ─── Toast ──────────────────────────────────────────────────────

export const Toast = ({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) => {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div className={`flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium text-white shadow-lg transition-all animate-[slideUp_0.3s_ease-out] ${toast.type === 'success' ? 'bg-green-700' : 'bg-red-700'}`}>
      {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
      {toast.message}
    </div>
  );
};

export const ToastContainer = ({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: number) => void }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
    {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={onDismiss} />)}
  </div>
);

// ─── Confirm Delete Modal ───────────────────────────────────────

export const ConfirmModal = ({
  title, message, onConfirm, onCancel,
}: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-red-100">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">{title}</h3>
      </div>
      <p className="mb-6 text-sm text-stone-600">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50">Cancel</button>
        <button onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">Delete</button>
      </div>
    </div>
  </div>
);

// ─── Status Badge ───────────────────────────────────────────────

export const StatusBadge = ({ status }: { status: string }) => {
  const cls = status === 'active'
    ? 'bg-green-100 text-green-800 border-green-200'
    : status === 'coming_soon'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';
  const label = status === 'coming_soon' ? 'Coming Soon' : status === 'active' ? 'Active' : 'Inactive';
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
};

// ─── Image Preview ──────────────────────────────────────────────

export const ImagePreview = ({ url, size = 'md' }: { url: string; size?: 'sm' | 'md' | 'lg' }) => {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [url]);
  const sizeClass = size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-40 w-full' : 'h-20 w-20';

  if (!url || err) {
    return (
      <div className={`${sizeClass} flex items-center justify-center rounded-lg border-2 border-dashed border-amber-200 bg-amber-50`}>
        <ImageIcon size={size === 'sm' ? 16 : 24} className="text-amber-300" />
      </div>
    );
  }
  return <img src={url} alt="" onError={() => setErr(true)} className={`${sizeClass} rounded-lg border border-amber-200 object-cover`} />;
};

// ─── Form Inputs ────────────────────────────────────────────────

export const FormInput = ({
  label, value, onChange, required, type = 'text', placeholder, error, step, min, max, maxLength, disabled,
}: {
  label: string; value: string | number; onChange: (v: string) => void; required?: boolean;
  type?: string; placeholder?: string; error?: string; step?: number; min?: number; max?: number; maxLength?: number; disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-stone-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      step={step} min={min} max={max} maxLength={maxLength} disabled={disabled}
      className={`rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-orange-400 ${error ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-white'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

export const FormSelect = ({
  label, value, onChange, options, required, error,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean; error?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-stone-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value} onChange={e => onChange(e.target.value)}
      className={`rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-orange-400 ${error ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-white'}`}
    >
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

export const FormTextarea = ({
  label, value, onChange, required, placeholder, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string; rows?: number;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-stone-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>
);

// ─── Dynamic List ───────────────────────────────────────────────

export const DynamicList = ({
  label, items, onChange,
}: { label: string; items: string[]; onChange: (items: string[]) => void }) => {
  const handleChange = useCallback((idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  }, [items, onChange]);

  const handleRemove = useCallback((idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  }, [items, onChange]);

  const handleAdd = useCallback(() => {
    onChange([...items, '']);
  }, [items, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-stone-600">{label}</label>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            value={item} onChange={e => handleChange(idx, e.target.value)}
            className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button onClick={() => handleRemove(idx)} className="grid h-8 w-8 place-items-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      ))}
      <button onClick={handleAdd} className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-600 transition hover:bg-orange-50">
        <Plus size={14} /> Add Item
      </button>
    </div>
  );
};

// ─── Pagination ─────────────────────────────────────────────────

export const Pagination = ({
  currentPage, totalPages, onPageChange,
}: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-amber-100 disabled:opacity-30">
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-medium transition ${p === currentPage ? 'bg-orange-600 text-white' : 'text-stone-600 hover:bg-amber-100'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-amber-100 disabled:opacity-30">
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
