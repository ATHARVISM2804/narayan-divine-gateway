import { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import type { PujaProduct } from '../types';
import { DEITIES, PURPOSES, LANGUAGES, DELIVERY_OPTIONS } from '../constants';
import { FormInput, FormSelect, FormTextarea, DynamicList, ImagePreview } from './SharedUI';

interface PujaFormProps {
  puja: PujaProduct | null; // null = new
  defaultIncludes: string[];
  defaultDelivery: string;
  onSave: (p: PujaProduct) => void;
  onClose: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const emptyPuja = (defaults: string[], delivery: string): PujaProduct => ({
  id: 0, name: '', deity: '', purpose: '', language: '', duration: 2, price: 0,
  status: 'inactive', featured: false, rating: 5.0, reviews: 0,
  shortDescription: '', benefits: [], included: [...defaults],
  primaryImage: '', additionalImages: ['', '', ''], altText: '',
  videoDelivery: delivery, prasadDelivery: false, prasadEstimate: '',
  digitalCertificate: true, nameGotra: true, lastModified: new Date().toISOString(),
});

export const PujaForm = ({ puja, defaultIncludes, defaultDelivery, onSave, onClose, showToast }: PujaFormProps) => {
  const isEdit = puja !== null;
  const [form, setForm] = useState<PujaProduct>(
    puja ? { ...puja, additionalImages: [...(puja.additionalImages || []), '', '', ''].slice(0, 3) } : emptyPuja(defaultIncludes, defaultDelivery)
  );
  const [tab, setTab] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  const update = useCallback(<K extends keyof PujaProduct>(key: K, val: PujaProduct[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setDirty(true);
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.deity) e.deity = 'Required';
    if (!form.purpose) e.purpose = 'Required';
    if (!form.language) e.language = 'Required';
    if (!form.duration || form.duration <= 0) e.duration = 'Required';
    if (!form.price || form.price <= 0) e.price = 'Required';
    if (!form.primaryImage.trim()) e.primaryImage = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleSave = useCallback((status: 'active' | 'inactive') => {
    if (!validate()) {
      showToast('Please fix the errors before saving.', 'error');
      setTab(0);
      return;
    }
    const saved: PujaProduct = {
      ...form,
      status,
      lastModified: new Date().toISOString(),
      additionalImages: form.additionalImages.filter(u => u.trim()),
    };
    onSave(saved);
    showToast(`${saved.name} saved successfully`, 'success');
  }, [form, validate, onSave, showToast]);

  const handleBackdropClick = useCallback(() => {
    if (dirty) {
      if (confirm('You have unsaved changes. Discard?')) onClose();
    } else onClose();
  }, [dirty, onClose]);

  const tabs = ['Basic Info', 'Description', 'Media', 'Delivery'];

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/40 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 px-6 py-4">
          <h3 className="text-lg font-bold text-stone-800">{isEdit ? 'Edit Puja' : 'Add New Puja'}</h3>
          <button onClick={handleBackdropClick} className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amber-100">
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-5 py-3 text-sm font-medium transition ${i === tab ? 'border-b-2 border-orange-600 text-orange-700' : 'text-stone-500 hover:text-stone-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 0 && (
            <div className="space-y-4">
              <FormInput label="Puja Name" value={form.name} onChange={v => update('name', v)} required error={errors.name} maxLength={100} placeholder="e.g., Ganesh Puja" />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="Deity" value={form.deity} onChange={v => update('deity', v)} options={DEITIES} required error={errors.deity} />
                <FormSelect label="Purpose / Category" value={form.purpose} onChange={v => update('purpose', v)} options={PURPOSES} required error={errors.purpose} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="Language" value={form.language} onChange={v => update('language', v)} options={LANGUAGES} required error={errors.language} />
                <FormInput label="Duration (hrs)" value={form.duration} onChange={v => update('duration', parseFloat(v) || 0)} required type="number" step={0.5} min={0.5} max={24} error={errors.duration} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Price (₹)" value={form.price} onChange={v => update('price', parseInt(v) || 0)} required type="number" min={1} error={errors.price} />
                <FormInput label="Discounted Price (₹)" value={form.discountedPrice || ''} onChange={v => update('discountedPrice', v ? parseInt(v) : undefined)} type="number" placeholder="Optional" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Status</label>
                <div className="mt-1.5 flex gap-4">
                  {(['active', 'inactive', 'coming_soon'] as const).map(s => (
                    <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                      <input type="radio" name="status" checked={form.status === s} onChange={() => update('status', s)} className="accent-orange-600" />
                      {s === 'coming_soon' ? 'Coming Soon' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={form.featured} onChange={e => update('featured', e.target.checked)} className="rounded accent-orange-600" />
                ⭐ Mark as Featured / Popular
              </label>
            </div>
          )}

          {tab === 1 && (
            <div className="space-y-5">
              <FormTextarea label="Short Description" value={form.shortDescription} onChange={v => update('shortDescription', v)} placeholder="Internal/SEO use" />
              <DynamicList label='Benefits — "Why book this puja?"' items={form.benefits} onChange={v => update('benefits', v)} />
              <DynamicList label="What's Included" items={form.included} onChange={v => update('included', v)} />
            </div>
          )}

          {tab === 2 && (
            <div className="space-y-5">
              <FormInput label="Primary Image URL" value={form.primaryImage} onChange={v => update('primaryImage', v)} required error={errors.primaryImage} placeholder="https://..." />
              <ImagePreview url={form.primaryImage} size="lg" />
              {form.additionalImages.map((url, idx) => (
                <div key={idx}>
                  <FormInput label={`Additional Image ${idx + 2} URL`} value={url} onChange={v => {
                    const imgs = [...form.additionalImages];
                    imgs[idx] = v;
                    update('additionalImages', imgs);
                  }} placeholder="https://..." />
                  {url && <div className="mt-2"><ImagePreview url={url} size="md" /></div>}
                </div>
              ))}
              <FormInput label="Alt Text for primary image" value={form.altText} onChange={v => update('altText', v)} placeholder="Describe the image" />
            </div>
          )}

          {tab === 3 && (
            <div className="space-y-4">
              <FormSelect label="Video Delivery Timeline" value={form.videoDelivery} onChange={v => update('videoDelivery', v)} options={DELIVERY_OPTIONS} />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={form.prasadDelivery} onChange={e => update('prasadDelivery', e.target.checked)} className="rounded accent-orange-600" />
                Prasad Delivery Included?
              </label>
              {form.prasadDelivery && (
                <FormInput label="Prasad Delivery Estimate" value={form.prasadEstimate} onChange={v => update('prasadEstimate', v)} placeholder="e.g., 5-7 business days" />
              )}
              <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={form.digitalCertificate} onChange={e => update('digitalCertificate', e.target.checked)} className="rounded accent-orange-600" />
                Digital Certificate Included?
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={form.nameGotra} onChange={e => update('nameGotra', e.target.checked)} className="rounded accent-orange-600" />
                Pandit performs in your Name & Gotra?
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-amber-100 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
          <button onClick={handleBackdropClick} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50 sm:px-4 sm:text-sm">Cancel</button>
          <button onClick={() => handleSave('inactive')} className="rounded-lg border border-orange-600 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50 sm:px-4 sm:text-sm">Save as Draft</button>
          <button onClick={() => handleSave('active')} className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow transition hover:bg-orange-700 sm:px-4 sm:text-sm">Save & Publish</button>
        </div>
      </div>
    </div>
  );
};
