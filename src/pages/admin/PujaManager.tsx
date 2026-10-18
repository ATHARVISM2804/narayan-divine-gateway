import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, type Puja, type PujaOffering } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Loader2, Star, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import StorageImage from "@/components/StorageImage";
import { deleteRow, insertRow, saveErrorMessage, updateRow } from "@/lib/adminWrite";
import { isDirty, isWholeRupees, missingField, PRICE_RULE, priceInput, tierProblem } from "@/lib/adminValidate";
import { clearCatalogCache } from "@/lib/catalog";
import { fromIstInput, toIstInput } from "@/lib/istDatetime";
import { useFormSession } from "./useFormSession";

interface Props { pujas: Puja[]; onRefresh: () => Promise<void> | void }

const emptyPuja = (): Partial<Puja> => ({
  name: "", deity: "", location: "", date: "", countdown_datetime: "", image_url: null, benefit: "", occasion: "", occasion_hi: "",
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
/* `onAdd` runs when an upload finishes, seconds later: it must add to the gallery as it is
   then, not to the `images` this render saw. */
const GalleryEditor = ({ images, onChange, onAdd }: { images: string[]; onChange: (v: string[]) => void; onAdd: (url: string) => void }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      {images.map((url, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden border border-gold/40 h-24">
          <StorageImage src={url} width={128} alt="" className="h-full w-full object-cover" />
          <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}
            className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-maroon-deep/80 text-white hover:bg-red-600">
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
    {images.length < 6 && (
      <ImageUpload poster value={null} onChange={(url) => { if (url) onAdd(url); }} />
    )}
    <p className="text-[11px] text-brown/40">{images.length}/6 images</p>
  </div>
);

const emptyOffering = (pujaId: string): Partial<PujaOffering> => ({
  puja_id: pujaId, name: "", name_hi: "", price: 0, image_url: null,
  description: "", description_hi: "", status: "active", sort_order: 0,
});

/** A loaded row with every list field present, so the editors never see undefined. */
const withDefaults = (p: Puja): Partial<Puja> => ({
  ...p, gallery: p.gallery || [], benefits: p.benefits || [], benefits_hi: p.benefits_hi || [],
  process_steps: p.process_steps || [], process_steps_hi: p.process_steps_hi || [],
  faqs: p.faqs || [], faqs_hi: p.faqs_hi || [], includes: p.includes || [], includes_hi: p.includes_hi || [],
});

const PujaManager = ({ pujas, onRefresh }: Props) => {
  const [editing, setEditing] = useState<Partial<Puja> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  // Offerings state
  const [offerings, setOfferings] = useState<PujaOffering[]>([]);
  const [offeringsError, setOfferingsError] = useState(false);
  const [editingOff, setEditingOff] = useState<Partial<PujaOffering> | null>(null);
  const offOriginal = useRef<Partial<PujaOffering> | null>(null);
  const [savingOff, setSavingOff] = useState(false);
  const [offeringCounts, setOfferingCounts] = useState<Record<string, number>>({});
  const offeringsRun = useRef(0);

  // Field updates always start from the latest form, never from the copy a slow callback
  // (an image upload finishing seconds later) captured: that copy used to put back the old
  // price the admin had just changed, and "Update" then saved ₹951 again.
  const patch = (fields: Partial<Puja>) => setEditing((prev) => (prev ? { ...prev, ...fields } : prev));
  const patchOff = (fields: Partial<PujaOffering>) => setEditingOff((prev) => (prev ? { ...prev, ...fields } : prev));

  // Uploads finish seconds later: only apply them to the form they were started in.
  const form = useFormSession();
  const offForm = useFormSession();

  const openOffering = (o: Partial<PujaOffering> | null) => { offForm.bump(); setEditingOff(o); offOriginal.current = o; };
  const offeringUnsaved = () => editingOff != null && isDirty(editingOff, offOriginal.current);

  // Offering counts for the list view
  const loadCounts = useCallback(async () => {
    const { data, error } = await supabase.from("puja_offerings").select("puja_id");
    if (error || !data) return; // the badge is a hint; keep the last counts
    const counts: Record<string, number> = {};
    data.forEach((o: { puja_id: string }) => { counts[o.puja_id] = (counts[o.puja_id] || 0) + 1; });
    setOfferingCounts(counts);
  }, []);
  useEffect(() => { loadCounts(); }, [pujas, loadCounts]);

  const loadOfferings = async (pujaId: string) => {
    const run = ++offeringsRun.current;
    const { data, error } = await supabase.from("puja_offerings").select("*").eq("puja_id", pujaId).order("sort_order");
    if (run !== offeringsRun.current) return; // another pooja was opened meanwhile
    setOfferingsError(!!error);
    if (!error) setOfferings((data ?? []) as PujaOffering[]);
  };

  const resetOfferings = () => { offeringsRun.current++; setOfferings([]); setOfferingsError(false); openOffering(null); };

  const startNew = () => { form.bump(); resetOfferings(); setEditing(emptyPuja()); };

  // Edit the row as it is in the database now, not the list's copy, which can be older
  // than a save made on another device.
  const openEdit = async (p: Puja) => {
    setOpening(p.id);
    const { data, error } = await supabase.from("pujas").select("*").eq("id", p.id).maybeSingle();
    setOpening(null);
    if (error) { toast.error(`Could not open the latest version: ${saveErrorMessage(error)}`); return; }
    if (!data) { toast.error("This pooja no longer exists."); onRefresh(); return; }
    resetOfferings();
    form.bump();
    setEditing(withDefaults(data as Puja));
    loadOfferings(p.id);
  };

  const closeEditor = () => {
    if (offeringUnsaved() && !window.confirm("The offering you're editing isn't saved. Close and lose those changes?")) return;
    form.bump();
    setEditing(null);
    resetOfferings();
  };

  // Save offering
  const saveOffering = async () => {
    if (!editingOff) return;
    if (!editingOff.name?.trim()) { toast.error("The offering needs a name."); return; }
    if (!isWholeRupees(editingOff.price)) { toast.error(`The offering price ${PRICE_RULE}.`); return; }
    if (!Number.isInteger(editingOff.sort_order ?? 0)) { toast.error("Sort order must be a whole number."); return; }
    setSavingOff(true);
    const payload = {
      puja_id: editingOff.puja_id, name: editingOff.name.trim(),
      name_hi: editingOff.name_hi?.trim() || null, price: editingOff.price,
      image_url: editingOff.image_url || null,
      description: editingOff.description?.trim() || null,
      description_hi: editingOff.description_hi?.trim() || null,
      status: editingOff.status || "active", sort_order: editingOff.sort_order || 0,
    };
    try {
      if (editingOff.id) await updateRow("puja_offerings", editingOff.id, payload);
      else await insertRow("puja_offerings", payload);
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    } finally {
      setSavingOff(false);
    }
    clearCatalogCache();
    toast.success(editingOff.id ? "Offering updated" : "Offering created");
    openOffering(null);
    if (editingOff.puja_id) loadOfferings(editingOff.puja_id);
    loadCounts();
  };

  const removeOffering = async (o: PujaOffering) => {
    if (!window.confirm(`Delete the offering "${o.name}"?`)) return;
    try {
      await deleteRow("puja_offerings", o.id);
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    }
    clearCatalogCache();
    toast.success("Offering deleted");
    if (editingOff?.id === o.id) openOffering(null);
    loadOfferings(o.puja_id);
    loadCounts();
  };

  const save = async () => {
    if (!editing) return;
    const { name, location, date, prices } = editing;
    const missing = missingField([["Name", name], ["Date", date], ["Location", location]]);
    if (missing || !name || !location || !date) { toast.error(`Fill in the ${missing ?? "required"} field.`); return; }
    const tierError = tierProblem(prices);
    if (tierError || !prices) { toast.error(tierError); return; }
    if (offeringUnsaved()) {
      toast.error("Save or cancel the offering you're editing first (its own Update button), then update the pooja.");
      return;
    }
    // Same name on two pujas is allowed (same puja on different dates), but the date is then the
    // only thing that tells customers and the orders list apart — make that a conscious choice.
    const sameName = pujas.filter((p) => p.id !== editing.id && p.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (sameName.length > 0) {
      const others = sameName.map((p) => `• ${p.date} (${p.status})`).join("\n");
      const ok = window.confirm(
        `Another pooja already has this exact name:\n${others}\n\n` +
        `Customers and the Orders page will tell them apart only by the date (${date.trim()}). ` +
        `Make sure the date is clearly different, or add it to the name.\n\nSave anyway?`
      );
      if (!ok) return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(), deity: editing.deity?.trim() || name.trim(), location: location.trim(), date: date.trim(),
      countdown_datetime: fromIstInput(editing.countdown_datetime),
      image_url: editing.image_url || null, benefit: editing.benefit?.trim() || null,
      occasion: editing.occasion?.trim() || null, occasion_hi: editing.occasion_hi?.trim() || null,
      name_hi: editing.name_hi?.trim() || null, location_hi: editing.location_hi?.trim() || null, benefit_hi: editing.benefit_hi?.trim() || null,
      prices: prices.map((t) => ({ label: t.label.trim(), price: t.price })),
      status: editing.status || "draft", featured: editing.featured || false,
      gallery: editing.gallery || [], about: editing.about?.trim() || null, about_hi: editing.about_hi?.trim() || null,
      benefits: (editing.benefits || []).filter(b => b.trim()), benefits_hi: (editing.benefits_hi || []).filter(b => b.trim()),
      process_steps: (editing.process_steps || []).filter(s => s.title.trim()), process_steps_hi: (editing.process_steps_hi || []).filter(s => s.title.trim()),
      temple_name: editing.temple_name?.trim() || null, temple_name_hi: editing.temple_name_hi?.trim() || null,
      temple_description: editing.temple_description?.trim() || null, temple_description_hi: editing.temple_description_hi?.trim() || null,
      temple_image: editing.temple_image?.trim() || null,
      faqs: (editing.faqs || []).filter(f => f.question.trim()), faqs_hi: (editing.faqs_hi || []).filter(f => f.question.trim()),
      includes: (editing.includes || []).filter(i => i.trim()), includes_hi: (editing.includes_hi || []).filter(i => i.trim()),
      // Sent only when the column exists (loaded rows carry the key) or a link was typed, so
      // saving keeps working before docs/sql/reviews-and-proof.sql has been run.
      ...("past_video_url" in editing ? { past_video_url: editing.past_video_url?.trim() || null } : {}),
    };
    try {
      // `version`: refuse to overwrite a save made on another device after this form opened.
      if (editing.id) await updateRow("pujas", editing.id, payload, { version: editing.updated_at });
      else await insertRow("pujas", payload);
    } catch (e) {
      toast.error(saveErrorMessage(e), { duration: 10000 });
      return;
    } finally {
      setSaving(false);
    }
    clearCatalogCache();
    toast.success(editing.id ? "Pooja updated" : "Pooja created");
    await onRefresh();
    form.bump();
    setEditing(null);
    resetOfferings();
  };

  const remove = async (p: Puja) => {
    if (!window.confirm(`Delete the pooja "${p.name}" (${p.date})? This can't be undone.`)) return;
    setDeleting(p.id);
    try {
      await deleteRow("pujas", p.id);
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    } finally {
      setDeleting(null);
    }
    clearCatalogCache();
    toast.success("Pooja deleted"); onRefresh();
  };

  const toggleStatus = async (p: Puja) => {
    const next = p.status === "active" ? "draft" : "active";
    try {
      await updateRow("pujas", p.id, { status: next });
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    }
    clearCatalogCache();
    toast.success(`Pooja ${next === "active" ? "published" : "unpublished"}`); onRefresh();
  };

  type Tier = { label: string; price: number };
  const setTiers = (fn: (tiers: Tier[]) => Tier[]) =>
    setEditing((prev) => (prev ? { ...prev, prices: fn(prev.prices || []) } : prev));
  const updateTier = (idx: number, field: "label" | "price", val: string) =>
    setTiers((tiers) => tiers.map((t, i) => (i === idx ? { ...t, [field]: field === "price" ? priceInput(val) : val } : t)));
  const addTier = () => setTiers((tiers) => [...tiers, { label: "", price: 0 }]);
  const removeTier = (idx: number) => setTiers((tiers) => tiers.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/60">{pujas.length} puja{pujas.length !== 1 ? "s" : ""}</p>
        <button onClick={startNew} className="flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-maroon transition-all">
          <Plus size={16} />Add Pooja
        </button>
      </div>

      {pujas.length === 0 ? (
        <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
          <p className="text-3xl mb-3">🪔</p>
          <p className="font-display text-maroon">No poojas yet</p>
          <p className="text-sm text-brown/60 mt-1">Add your first pooja to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pujas.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft transition-all hover:border-gold/60">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-saffron/20 to-gold/20">
                {p.image_url ? <StorageImage src={p.image_url} width={96} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-2xl">🪔</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-maroon text-base truncate">{p.name}</h3>
                  {p.featured && <Star size={14} className="text-saffron fill-saffron shrink-0" />}
                </div>
                <p className="text-xs text-brown/60 mt-0.5">{p.location} • {p.date} • {offeringCounts[p.id] || 0} offerings</p>
                <p className="text-xs text-saffron font-semibold mt-0.5">{p.prices?.length ? `From ₹${Math.min(...p.prices.map((t) => t.price)).toLocaleString("en-IN")}` : "No prices set"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleStatus(p)} className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${p.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {p.status === "active" ? "Active" : "Draft"}
                </button>
                <button onClick={() => openEdit(p)} disabled={opening === p.id} aria-label="Edit"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors disabled:opacity-50">
                  {opening === p.id ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
                </button>
                <button onClick={() => remove(p)} disabled={deleting === p.id}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeEditor} />
          <div className="relative flex h-full w-full max-w-lg flex-col bg-ivory shadow-2xl animate-fadeIn">
            <div className="shrink-0 flex items-center justify-between border-b border-gold/30 bg-ivory/95 px-4 sm:px-6 py-4 backdrop-blur">
              <h3 className="font-display text-lg text-maroon">{editing.id ? "Edit Pooja" : "New Pooja"}</h3>
              <button onClick={closeEditor} aria-label="Close" className="text-brown/50 hover:text-maroon transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 p-4 sm:p-6">
              {/* Core fields */}
              <Section title="📷 Main Image" defaultOpen>
                <ImageUpload poster value={editing.image_url || null} onChange={form.guard((url: string | null) => patch({ image_url: url }))} />
              </Section>

              <Section title="📝 Basic Info" defaultOpen>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Name *</label>
                  <input value={editing.name || ""} onChange={(e) => patch({name: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Maha Rudrabhishek" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Deity</label>
                  <input value={editing.deity || ""} onChange={(e) => patch({deity: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Shiva, Vishnu, Ganga" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Date *</label>
                  <input value={editing.date || ""} onChange={(e) => patch({date: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. 13 May" />
                  <p className="text-[11px] text-brown/40 mt-1">Display text shown to users (e.g. "13 May", "12 July 2026")</p></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Countdown Date & Time</label>
                  <input type="datetime-local" value={toIstInput(editing.countdown_datetime)} onChange={(e) => patch({countdown_datetime: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" />
                  <p className="text-[11px] text-brown/40 mt-1">India time (IST). Timer counts down to this exact date & time. Leave empty to use end of day.</p></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Location *</label>
                  <input value={editing.location || ""} onChange={(e) => patch({location: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Badrinath Dham" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Benefit (1 liner)</label>
                  <input value={editing.benefit || ""} onChange={(e) => patch({benefit: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Peace, prosperity" maxLength={150} /></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Special Occasion Tag</label>
                  <input value={editing.occasion || ""} onChange={(e) => patch({occasion: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Ganga Dussehra Special" maxLength={80} />
                  <p className="text-[11px] text-brown/40 mt-1">Shown as a badge above the pooja name on the detail page</p></div>
              </Section>

              <Section title="🇮🇳 Hindi Translation">
                <input value={editing.name_hi || ""} onChange={(e) => patch({name_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="पूजा का नाम" />
                <input value={editing.location_hi || ""} onChange={(e) => patch({location_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="स्थान" />
                <input value={editing.benefit_hi || ""} onChange={(e) => patch({benefit_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="लाभ" maxLength={150} />
                <input value={editing.occasion_hi || ""} onChange={(e) => patch({occasion_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="विशेष अवसर" maxLength={80} />
              </Section>

              <Section title="🖼️ Photo Gallery (up to 6)">
                <GalleryEditor images={editing.gallery || []} onChange={(g) => patch({gallery: g })}
                  onAdd={form.guard((url: string) => setEditing((prev) => (prev ? { ...prev, gallery: [...(prev.gallery || []), url].slice(0, 6) } : prev)))} />
              </Section>

              <Section title="📖 About Pooja">
                <label className="mb-1 block text-xs font-semibold text-maroon">English</label>
                <textarea value={editing.about || ""} onChange={(e) => patch({about: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-y min-h-[100px]" placeholder="Detailed description..." />
                <label className="mb-1 block text-xs font-semibold text-maroon mt-3">हिंदी</label>
                <textarea value={editing.about_hi || ""} onChange={(e) => patch({about_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-y min-h-[100px]" placeholder="विस्तृत विवरण..." />
                <p className="mt-1 text-xs text-ink-soft">Tip: a short line on its own (like “Location:”) shows as a heading on the site, and “Label: text” shows the label in bold.</p>
              </Section>

              <Section title="✨ Benefits">
                <p className="text-xs text-brown/50 mb-2">English</p>
                <ListEditor items={editing.benefits || []} onChange={(v) => patch({benefits: v })} placeholder="e.g. Relief from Shani Dosha" />
                <p className="text-xs text-brown/50 mb-2 mt-3">हिंदी</p>
                <ListEditor items={editing.benefits_hi || []} onChange={(v) => patch({benefits_hi: v })} placeholder="जैसे: शनि दोष से मुक्ति" />
              </Section>

              <Section title="🔱 Pooja Process Steps">
                <p className="text-xs text-brown/50 mb-2">English</p>
                <StepEditor items={editing.process_steps || []} onChange={(v) => patch({process_steps: v })} />
                <p className="text-xs text-brown/50 mb-2 mt-3">हिंदी</p>
                <StepEditor items={editing.process_steps_hi || []} onChange={(v) => patch({process_steps_hi: v })} />
              </Section>

              <Section title="🛕 Temple Details">
                <input value={editing.temple_name || ""} onChange={(e) => patch({temple_name: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="Temple name (EN)" />
                <input value={editing.temple_name_hi || ""} onChange={(e) => patch({temple_name_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="मंदिर का नाम (HI)" />
                <textarea value={editing.temple_description || ""} onChange={(e) => patch({temple_description: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-y min-h-[80px]" placeholder="Temple description (EN)" />
                <textarea value={editing.temple_description_hi || ""} onChange={(e) => patch({temple_description_hi: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-y min-h-[80px]" placeholder="मंदिर विवरण (HI)" />
                <p className="mt-1 text-xs text-ink-soft">Tip: a short line on its own (like “Location:”) shows as a heading on the site, and “Label: text” shows the label in bold.</p>
                <label className="mb-1 block text-xs font-semibold text-maroon">Temple Image</label>
                <ImageUpload value={editing.temple_image || null} onChange={form.guard((url: string | null) => patch({ temple_image: url }))} />
                <label className="mb-1 mt-3 block text-xs font-semibold text-maroon">Past pooja video (YouTube link, optional)</label>
                <input value={editing.past_video_url || ""} onChange={(e) => patch({past_video_url: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="https://youtu.be/..." />
                <p className="text-[11px] text-brown/50">Shown as "Watch a past pooja video" on the pooja page. Use YouTube (unlisted is fine), not an upload.</p>
              </Section>

              <Section title="❓ FAQs">
                <p className="text-xs text-brown/50 mb-2">English</p>
                <FaqEditor items={editing.faqs || []} onChange={(v) => patch({faqs: v })} />
                <p className="text-xs text-brown/50 mb-2 mt-3">हिंदी</p>
                <FaqEditor items={editing.faqs_hi || []} onChange={(v) => patch({faqs_hi: v })} />
              </Section>

              {/* ── Offerings ── */}
              <Section title={`🌺 Offerings (${offerings.length})`}>
                {!editing.id ? (
                  <p className="text-sm text-brown/60 italic">Save the pooja first, then add offerings.</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-brown/60">{offerings.length} offerings</p>
                      <button onClick={() => openOffering(emptyOffering(editing.id!))}
                        className="flex items-center gap-1 rounded-lg bg-saffron px-3 py-2 text-xs font-semibold text-white hover:bg-maroon transition-all">
                        <Plus size={14} /> Add Offering
                      </button>
                    </div>

                    {offeringsError ? (
                      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        Couldn't load the offerings.{" "}
                        <button type="button" onClick={() => loadOfferings(editing.id!)} className="font-semibold underline">Try again</button>
                      </div>
                    ) : offerings.length === 0 ? (
                      <p className="text-sm text-brown/40 italic text-center py-4">No offerings yet — add your first one</p>
                    ) : (
                      <div className="space-y-2">
                        {offerings.map(o => (
                          <div key={o.id} className="flex items-center gap-3 rounded-xl border border-gold/20 bg-cream p-3">
                            <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gold/10">
                              {o.image_url ? <StorageImage src={o.image_url} width={64} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center text-lg">🌺</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-maroon truncate">{o.name}</p>
                              <p className="text-xs text-saffron font-bold">
                                ₹{o.price}
                                {o.status !== "active" && <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">Hidden</span>}
                              </p>
                            </div>
                            <button onClick={() => openOffering({ ...o })} aria-label="Edit offering" className="grid h-7 w-7 place-items-center rounded bg-gold/15 text-maroon hover:bg-gold/30"><Pencil size={12} /></button>
                            <button onClick={() => removeOffering(o)} aria-label="Delete offering" className="grid h-7 w-7 place-items-center rounded bg-red-50 text-red-400 hover:bg-red-100"><Trash2 size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Offering edit form */}
                    {editingOff && (
                      <div className="mt-4 rounded-xl border-2 border-saffron/30 bg-saffron/5 p-4 space-y-3">
                        <p className="text-sm font-bold text-maroon">{editingOff.id ? "Edit Offering" : "New Offering"}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-maroon">Name (EN) *</label>
                            <input value={editingOff.name || ""} onChange={e => patchOff({name: e.target.value })}
                              className="w-full rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" placeholder="e.g. Gau Seva" />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-maroon">Name (HI)</label>
                            <input value={editingOff.name_hi || ""} onChange={e => patchOff({name_hi: e.target.value })}
                              className="w-full rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" placeholder="गौ सेवा" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-maroon">Price (₹) *</label>
                            <input type="number" inputMode="numeric" min={1} step={1} value={editingOff.price || ""} onChange={e => patchOff({price: priceInput(e.target.value) })}
                              className="w-full rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-maroon">Sort Order</label>
                            <input type="number" value={editingOff.sort_order || 0} onChange={e => patchOff({sort_order: Number(e.target.value) || 0 })}
                              className="w-full rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-maroon">Description (EN)</label>
                          <input value={editingOff.description || ""} onChange={e => patchOff({description: e.target.value })}
                            className="w-full rounded-lg border border-gold/40 bg-cream px-3 py-2 text-sm outline-none focus:border-saffron" placeholder="Short description" />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-maroon">Image</label>
                          <ImageUpload value={editingOff.image_url || null} onChange={offForm.guard((url: string | null) => patchOff({ image_url: url }))} />
                        </div>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={(editingOff.status || "active") === "active"} onChange={(e) => patchOff({ status: e.target.checked ? "active" : "draft" })}
                            className="h-4 w-4 rounded border-gold accent-saffron" />
                          <span className="text-sm text-maroon font-medium">Show on the website</span>
                        </label>
                        <div className="flex gap-2">
                          <button onClick={saveOffering} disabled={savingOff}
                            className="flex-1 rounded-lg bg-saffron py-2 text-sm font-bold text-white hover:bg-maroon transition-all disabled:opacity-60">
                            {savingOff ? "Saving…" : editingOff.id ? "Update" : "Create"}</button>
                          <button onClick={() => openOffering(null)} className="rounded-lg border border-gold/50 px-4 py-2 text-sm text-maroon hover:bg-gold/10">Cancel</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Section>

              <Section title="📦 What's Included">
                <p className="text-xs text-brown/50 mb-2">English</p>
                <ListEditor items={editing.includes || []} onChange={(v) => patch({includes: v })} placeholder="e.g. Sankalp in your name" />
                <p className="text-xs text-brown/50 mb-2 mt-3">हिंदी</p>
                <ListEditor items={editing.includes_hi || []} onChange={(v) => patch({includes_hi: v })} placeholder="जैसे: आपके नाम में संकल्प" />
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
                        <input type="number" inputMode="numeric" min={1} step={1} value={tier.price || ""} onChange={(e) => updateTier(idx, "price", e.target.value)}
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
                  <input type="checkbox" checked={editing.status === "active"} onChange={(e) => patch({status: e.target.checked ? "active" : "draft" })}
                    className="h-4 w-4 rounded border-gold accent-saffron" />
                  <span className="text-sm text-maroon font-medium">Active (visible)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={editing.featured || false} onChange={(e) => patch({featured: e.target.checked })}
                    className="h-4 w-4 rounded border-gold accent-saffron" />
                  <span className="text-sm text-maroon font-medium">Featured on homepage</span>
                </label>
              </div>

            </div>

            {/* Sticky action bar — always reachable on mobile */}
            <div className="shrink-0 flex gap-3 border-t border-gold/20 bg-ivory px-4 sm:px-6 py-3"
                 style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}>
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-saffron py-3 text-sm font-bold text-white shadow-md hover:bg-maroon transition-all disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : editing.id ? "Update Pooja" : "Create Pooja"}
              </button>
              <button onClick={closeEditor} className="rounded-xl border border-gold/50 px-6 py-3 text-sm font-medium text-maroon hover:bg-gold/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PujaManager;
