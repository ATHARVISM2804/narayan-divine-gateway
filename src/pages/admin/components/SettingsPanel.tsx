import { useState, useCallback } from 'react';
import type { SiteSettings } from '../types';
import { DELIVERY_OPTIONS, SORT_OPTIONS } from '../constants';
import { FormInput, FormSelect, DynamicList } from './SharedUI';

interface SettingsPanelProps {
  settings: SiteSettings;
  onSave: (s: SiteSettings) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const SettingsPanel = ({ settings, onSave, showToast }: SettingsPanelProps) => {
  const [form, setForm] = useState<SiteSettings>({ ...settings });

  const update = useCallback(<K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(form);
    showToast('Settings saved successfully', 'success');
  }, [form, onSave, showToast]);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-amber-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-stone-800">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <Section title="🔱 Site Identity">
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Site Name" value={form.siteName} onChange={v => update('siteName', v)} />
          <FormInput label="Tagline" value={form.tagline} onChange={v => update('tagline', v)} />
        </div>
        <FormInput label="Logo URL" value={form.logoUrl} onChange={v => update('logoUrl', v)} placeholder="https://..." />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="WhatsApp No." value={form.whatsappNo} onChange={v => update('whatsappNo', v)} />
          <FormInput label="Contact Email" value={form.contactEmail} onChange={v => update('contactEmail', v)} type="email" />
        </div>
        <FormInput label="Business Hours" value={form.businessHours} onChange={v => update('businessHours', v)} />
      </Section>

      <Section title="🪔 Puja Page Defaults">
        <DynamicList label={`Default "What's Included" items for new Pujas`} items={form.defaultPujaIncludes} onChange={v => update('defaultPujaIncludes', v)} />
        <FormSelect label="Default Delivery Timeline" value={form.defaultPujaDelivery} onChange={v => update('defaultPujaDelivery', v)} options={DELIVERY_OPTIONS} />
      </Section>

      <Section title="🌸 Chadhava Page Defaults">
        <DynamicList label='Default "What Devotee Receives" for new Chadhavas' items={form.defaultChadhavaReceives} onChange={v => update('defaultChadhavaReceives', v)} />
        <FormSelect label="Default Delivery Timeline" value={form.defaultChadhavaDelivery} onChange={v => update('defaultChadhavaDelivery', v)} options={DELIVERY_OPTIONS} />
      </Section>

      <Section title="🎨 Display Preferences">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.showComingSoon} onChange={e => update('showComingSoon', e.target.checked)} className="rounded accent-orange-600" />
          Show "Coming Soon" products publicly?
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.showDiscountedPrice} onChange={e => update('showDiscountedPrice', e.target.checked)} className="rounded accent-orange-600" />
          Show discounted price with strikethrough?
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.showRatings} onChange={e => update('showRatings', e.target.checked)} className="rounded accent-orange-600" />
          Show ratings on puja cards?
        </label>
        <FormSelect label="Default Sort" value={form.defaultSort} onChange={v => update('defaultSort', v)} options={SORT_OPTIONS} />
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-700 hover:shadow-md">
          💾 Save Settings
        </button>
      </div>
    </div>
  );
};
