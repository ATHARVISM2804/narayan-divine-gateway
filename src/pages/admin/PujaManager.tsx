import { useState } from "react";
import { supabase, type Puja } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Loader2, Star, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

interface Props { pujas: Puja[]; onRefresh: () => void }

const emptyPuja = (): Partial<Puja> => ({
  name: "", location: "", date: "", image_url: null, benefit: "",
  name_hi: "", location_hi: "", benefit_hi: "",
  prices: [{ label: "Single", price: 951 }, { label: "Couple", price: 1551 }, { label: "4 Family", price: 2551 }, { label: "6 Members", price: 3551 }],
  status: "draft", featured: false,
  gallery: [], about: "", about_hi: "",
  benefits: [], benefits_hi: [],
  process_steps: [], process_steps_hi: [],
  temple_name: "", temple_name_hi: "", temple_description: "", temple_description_hi: "", temple_image: "",
  faqs: [], faqs_hi: [],
  includes: [], includes_hi: [],
});

/* Collapsible admin section */
const Section = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gold/30 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between bg-cream px-4 py-3 text-sm font-bold text-maroon">
        {title} {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="p-4 space-y-4 bg-ivory/50">{children}</div>}
    </div>
  );
};

/* Dynamic string list editor */
const ListEditor = ({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) => (
  <div className="space-y-2">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-2">
        <input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
          className="flex-1 rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" placeholder={placeholder} />
        <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X size={14} /></button>
      </div>
    ))}
    <button type="button" onClick={() => onChange([...items, ""])} className="flex items-center gap-1 text-xs font-semibold text-saffron hover:text-maroon">
      <Plus size={12} />Add
    </button>
  </div>
);

/* Dynamic {title,description} list */
const StepEditor = ({ items, onChange }: { items: { title: string; description: string }[]; onChange: (v: { title: string; description: string }[]) => void }) => (
  <div className="space-y-3">
    {items.map((item, i) => (
      <div key={i} className="flex gap-2 items-start">
        <div className="flex-1 space-y-1">
          <input value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }}
            className="w-full rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" placeholder="Title" />
          <input value={item.description} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; onChange(n); }}
            className="w-full rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" placeholder="Description" />
        </div>
        <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-2"><X size={14} /></button>
      </div>
    ))}
    <button type="button" onClick={() => onChange([...items, { title: "", description: "" }])} className="flex items-center gap-1 text-xs font-semibold text-saffron hover:text-maroon">
      <Plus size={12} />Add Step
    </button>
  </div>
);

/* Dynamic {question,answer} list */
const FaqEditor = ({ items, onChange }: { items: { question: string; answer: string }[]; onChange: (v: { question: string; answer: string }[]) => void }) => (
  <div className="space-y-3">
    {items.map((item, i) => (
      <div key={i} className="flex gap-2 items-start">
        <div className="flex-1 space-y-1">
          <input value={item.question} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], question: e.target.value }; onChange(n); }}
            className="w-full rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" placeholder="Question" />
          <textarea value={item.answer} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], answer: e.target.value }; onChange(n); }}
            className="w-full rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron resize-y min-h-[60px]" placeholder="Answer" />
        </div>
        <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-2"><X size={14} /></button>
      </div>
    ))}
    <button type="button" onClick={() => onChange([...items, { question: "", answer: "" }])} className="flex items-center gap-1 text-xs font-semibold text-saffron hover:text-maroon">
      <Plus size={12} />Add FAQ
    </button>
  </div>
);

/* Gallery editor */
const GalleryEditor = ({ images, onChange }: { images: string[]; onChange: (v: string[]) => void }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      {images.map((url, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden border border-gold/40 h-24">
          <img src={url} alt="" className="h-full w-full object-cover" />
          <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}
            className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-maroon-deep/80 text-white hover:bg-red-600">
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
    {images.length < 6 && (
      <ImageUpload value={null} onChange={(url) => { if (url) onChange([...images, url]); }} />
    )}
    <p className="text-[11px] text-brown/40">{images.length}/6 images</p>
  </div>
);

const PujaManager = ({ pujas, onRefresh }: Props) => {
  const [editing, setEditing] = useState<Partial<Puja> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const save = async () => {
    if (!editing) return;
    const { name, location, date, prices } = editing;
    if (!name?.trim() || !location?.trim() || !date?.trim()) { toast.error("Fill required fields"); return; }
    if (!prices?.length || prices.some((t) => !t.label.trim() || t.price <= 0)) { toast.error("Each tier needs label & price > 0"); return; }
    setSaving(true);
    const payload = {
      name: name.trim(), location: location.trim(), date: date.trim(),
      image_url: editing.image_url || null, benefit: editing.benefit?.trim() || null,
      name_hi: editing.name_hi?.trim() || null, location_hi: editing.location_hi?.trim() || null, benefit_hi: editing.benefit_hi?.trim() || null,
      prices, status: editing.status || "draft", featured: editing.featured || false,
      gallery: editing.gallery || [], about: editing.about?.trim() || null, about_hi: editing.about_hi?.trim() || null,
      benefits: (editing.benefits || []).filter(b => b.trim()), benefits_hi: (editing.benefits_hi || []).filter(b => b.trim()),
      process_steps: (editing.process_steps || []).filter(s => s.title.trim()), process_steps_hi: (editing.process_steps_hi || []).filter(s => s.title.trim()),
      temple_name: editing.temple_name?.trim() || null, temple_name_hi: editing.temple_name_hi?.trim() || null,
      temple_description: editing.temple_description?.trim() || null, temple_description_hi: editing.temple_description_hi?.trim() || null,
      temple_image: editing.temple_image?.trim() || null,
      faqs: (editing.faqs || []).filter(f => f.question.trim()), faqs_hi: (editing.faqs_hi || []).filter(f => f.question.trim()),
      includes: (editing.includes || []).filter(i => i.trim()), includes_hi: (editing.includes_hi || []).filter(i => i.trim()),
    };
    let err;
    if (editing.id) {
      ({ error: err } = await supabase.from("pujas").update(payload).eq("id", editing.id));
    } else {
      ({ error: err } = await supabase.from("pujas").insert(payload));
    }
    setSaving(false);
    if (err) { toast.error(err.message); return; }
    toast.success(editing.id ? "Puja updated" : "Puja created");
    setEditing(null); onRefresh();
  };

  const remove = async (id: string) => {
    setDeleting(id);
    const { error: err } = await supabase.from("pujas").delete().eq("id", id);
    setDeleting(null);
    if (err) { toast.error(err.message); return; }
    toast.success("Puja deleted"); onRefresh();
  };

  const toggleStatus = async (p: Puja) => {
    const next = p.status === "active" ? "draft" : "active";
    const { error: err } = await supabase.from("pujas").update({ status: next }).eq("id", p.id);
    if (err) toast.error(err.message);
    else { toast.success(`Puja ${next === "active" ? "published" : "unpublished"}`); onRefresh(); }
  };

  const updateTier = (idx: number, field: "label" | "price", val: string | number) => {
    if (!editing?.prices) return;
    const next = [...editing.prices];
    next[idx] = { ...next[idx], [field]: field === "price" ? Number(val) || 0 : val };
    setEditing({ ...editing, prices: next });
  };
  const addTier = () => setEditing({ ...editing, prices: [...(editing?.prices || []), { label: "", price: 0 }] });
  const removeTier = (idx: number) => setEditing({ ...editing, prices: editing!.prices!.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/60">{pujas.length} puja{pujas.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setEditing(emptyPuja())} className="flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-maroon transition-all">
          <Plus size={16} />Add Puja
        </button>
      </div>

      {pujas.length === 0 ? (
        <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
          <p className="text-3xl mb-3">🪔</p>
          <p className="font-display text-maroon">No pujas yet</p>
          <p className="text-sm text-brown/60 mt-1">Add your first puja to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pujas.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft transition-all hover:border-gold/60">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-saffron/20 to-gold/20">
                {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-2xl">🪔</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-maroon text-base truncate">{p.name}</h3>
                  {p.featured && <Star size={14} className="text-saffron fill-saffron shrink-0" />}
                </div>
                <p className="text-xs text-brown/60 mt-0.5">{p.location} • {p.date}</p>
                <p className="text-xs text-saffron font-semibold mt-0.5">From ₹{Math.min(...p.prices.map((t) => t.price)).toLocaleString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleStatus(p)} className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${p.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {p.status === "active" ? "Active" : "Draft"}
                </button>
                <button onClick={() => setEditing({ ...p, gallery: p.gallery || [], benefits: p.benefits || [], benefits_hi: p.benefits_hi || [], process_steps: p.process_steps || [], process_steps_hi: p.process_steps_hi || [], faqs: p.faqs || [], faqs_hi: p.faqs_hi || [], includes: p.includes || [], includes_hi: p.includes_hi || [] })}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(p.id)} disabled={deleting === p.id}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50">
                  {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Slide-over Form ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-lg overflow-y-auto bg-ivory shadow-2xl animate-fadeIn">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold/30 bg-ivory/95 px-6 py-4 backdrop-blur">
              <h3 className="font-display text-lg text-maroon">{editing.id ? "Edit Puja" : "New Puja"}</h3>
              <button onClick={() => setEditing(null)} className="text-brown/50 hover:text-maroon transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-5 p-6">
              {/* Core fields */}
              <Section title="📷 Main Image" defaultOpen>
                <ImageUpload value={editing.image_url || null} onChange={(url) => setEditing({ ...editing, image_url: url })} />
              </Section>

              <Section title="📝 Basic Info" defaultOpen>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Name *</label>
                  <input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Maha Rudrabhishek" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Date *</label>
                  <input value={editing.date || ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. 13 May" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Location *</label>
                  <input value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Badrinath Dham" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Benefit (1 liner)</label>
                  <input value={editing.benefit || ""} onChange={(e) => setEditing({ ...editing, benefit: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Peace, prosperity" maxLength={150} /></div>
              </Section>

              <Section title="🇮🇳 Hindi Translation">
                <input value={editing.name_hi || ""} onChange={(e) => setEditing({ ...editing, name_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="पूजा का नाम" />
                <input value={editing.location_hi || ""} onChange={(e) => setEditing({ ...editing, location_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="स्थान" />
                <input value={editing.benefit_hi || ""} onChange={(e) => setEditing({ ...editing, benefit_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="लाभ" maxLength={150} />
              </Section>

              <Section title="🖼️ Photo Gallery (up to 6)">
                <GalleryEditor images={editing.gallery || []} onChange={(g) => setEditing({ ...editing, gallery: g })} />
              </Section>

              <Section title="📖 About Puja">
                <label className="mb-1 block text-xs font-semibold text-maroon">English</label>
                <textarea value={editing.about || ""} onChange={(e) => setEditing({ ...editing, about: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-y min-h-[100px]" placeholder="Detailed description..." />
                <label className="mb-1 block text-xs font-semibold text-maroon mt-3">हिंदी</label>
                <textarea value={editing.about_hi || ""} onChange={(e) => setEditing({ ...editing, about_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-y min-h-[100px]" placeholder="विस्तृत विवरण..." />
              </Section>

              <Section title="✨ Benefits">
                <p className="text-xs text-brown/50 mb-2">English</p>
                <ListEditor items={editing.benefits || []} onChange={(v) => setEditing({ ...editing, benefits: v })} placeholder="e.g. Relief from Shani Dosha" />
                <p className="text-xs text-brown/50 mb-2 mt-3">हिंदी</p>
                <ListEditor items={editing.benefits_hi || []} onChange={(v) => setEditing({ ...editing, benefits_hi: v })} placeholder="जैसे: शनि दोष से मुक्ति" />
              </Section>

              <Section title="🔱 Puja Process Steps">
                <p className="text-xs text-brown/50 mb-2">English</p>
                <StepEditor items={editing.process_steps || []} onChange={(v) => setEditing({ ...editing, process_steps: v })} />
                <p className="text-xs text-brown/50 mb-2 mt-3">हिंदी</p>
                <StepEditor items={editing.process_steps_hi || []} onChange={(v) => setEditing({ ...editing, process_steps_hi: v })} />
              </Section>

              <Section title="🛕 Temple Details">
                <input value={editing.temple_name || ""} onChange={(e) => setEditing({ ...editing, temple_name: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="Temple name (EN)" />
                <input value={editing.temple_name_hi || ""} onChange={(e) => setEditing({ ...editing, temple_name_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="मंदिर का नाम (HI)" />
                <textarea value={editing.temple_description || ""} onChange={(e) => setEditing({ ...editing, temple_description: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-y min-h-[80px]" placeholder="Temple description (EN)" />
                <textarea value={editing.temple_description_hi || ""} onChange={(e) => setEditing({ ...editing, temple_description_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-y min-h-[80px]" placeholder="मंदिर विवरण (HI)" />
                <label className="mb-1 block text-xs font-semibold text-maroon">Temple Image</label>
                <ImageUpload value={editing.temple_image || null} onChange={(url) => setEditing({ ...editing, temple_image: url })} />
              </Section>

              <Section title="❓ FAQs">
                <p className="text-xs text-brown/50 mb-2">English</p>
                <FaqEditor items={editing.faqs || []} onChange={(v) => setEditing({ ...editing, faqs: v })} />
                <p className="text-xs text-brown/50 mb-2 mt-3">हिंदी</p>
                <FaqEditor items={editing.faqs_hi || []} onChange={(v) => setEditing({ ...editing, faqs_hi: v })} />
              </Section>

              <Section title="📦 What's Included">
                <p className="text-xs text-brown/50 mb-2">English</p>
                <ListEditor items={editing.includes || []} onChange={(v) => setEditing({ ...editing, includes: v })} placeholder="e.g. Sankalp in your name" />
                <p className="text-xs text-brown/50 mb-2 mt-3">हिंदी</p>
                <ListEditor items={editing.includes_hi || []} onChange={(v) => setEditing({ ...editing, includes_hi: v })} placeholder="जैसे: आपके नाम में संकल्प" />
              </Section>

              {/* Pricing */}
              <Section title="💰 Pricing Tiers" defaultOpen>
                <div className="space-y-2">
                  {(editing.prices || []).map((tier, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input value={tier.label} onChange={(e) => updateTier(idx, "label", e.target.value)}
                        className="flex-1 rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" placeholder="Label" />
                      <div className="flex items-center rounded-lg border border-gold/40 bg-cream px-3 py-2">
                        <span className="text-sm text-brown/50 mr-1">₹</span>
                        <input type="number" value={tier.price || ""} onChange={(e) => updateTier(idx, "price", e.target.value)}
                          className="w-20 bg-transparent text-sm outline-none" placeholder="0" />
                      </div>
                      {(editing.prices?.length || 0) > 1 && (
                        <button type="button" onClick={() => removeTier(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addTier} className="flex items-center gap-1 text-xs font-semibold text-saffron hover:text-maroon mt-2">
                  <Plus size={13} />Add Tier
                </button>
              </Section>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={editing.status === "active"} onChange={(e) => setEditing({ ...editing, status: e.target.checked ? "active" : "draft" })}
                    className="h-4 w-4 rounded border-gold accent-saffron" />
                  <span className="text-sm text-maroon font-medium">Active (visible)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={editing.featured || false} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-gold accent-saffron" />
                  <span className="text-sm text-maroon font-medium">Featured on homepage</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-gold/20">
                <button onClick={save} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-saffron py-3 text-sm font-bold text-white shadow-md hover:bg-maroon transition-all disabled:opacity-60">
                  {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : editing.id ? "Update Puja" : "Create Puja"}
                </button>
                <button onClick={() => setEditing(null)} className="rounded-xl border border-gold/50 px-6 py-3 text-sm font-medium text-maroon hover:bg-gold/10">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PujaManager;
