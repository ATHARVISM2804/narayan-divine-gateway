import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, type Chadhava, type ChadhavaOffering } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Loader2, ChevronDown, ChevronUp, Image as ImageIcon, Star } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import StorageImage from "@/components/StorageImage";
import { deleteRow, insertRow, saveErrorMessage, updateRow } from "@/lib/adminWrite";
import { isDirty, isWholeRupees, PRICE_RULE, priceInput } from "@/lib/adminValidate";
import { clearCatalogCache } from "@/lib/catalog";
import { fromIstInput, toIstInput } from "@/lib/istDatetime";
import { useFormSession } from "./useFormSession";

interface Props { chadhavas: Chadhava[]; onRefresh: () => Promise<void> | void }

const emptyChadhava = (): Partial<Chadhava> => ({
  temple: "", item: "", date: "", countdown_datetime: "", price: 0, image_url: null, description: "",
  item_hi: "", temple_hi: "", description_hi: "",
  occasion: "", occasion_hi: "",
  gallery: [], about: "", about_hi: "",
  faqs: [], faqs_hi: [],
  featured: false,
  status: "draft",
});

const emptyOffering = (chadhavaId: string): Partial<ChadhavaOffering> => ({
  chadhava_id: chadhavaId,
  name: "", name_hi: "", price: 0, image_url: null,
  description: "", description_hi: "", status: "active", sort_order: 0,
});

/** Cheapest active offering, the "From" price the site shows for a chadhava. */
const cheapestActive = (offerings: ChadhavaOffering[]): number =>
  offerings.filter((o) => o.status === "active").reduce((min, o) => (min === 0 || o.price < min ? o.price : min), 0);

const ChadhavaManager = ({ chadhavas, onRefresh }: Props) => {
  const [editing, setEditing] = useState<Partial<Chadhava> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [section, setSection] = useState<string>("basic");

  // Offerings state
  const [offerings, setOfferings] = useState<ChadhavaOffering[]>([]);
  const [offeringsError, setOfferingsError] = useState(false);
  const [editingOff, setEditingOff] = useState<Partial<ChadhavaOffering> | null>(null);
  const offOriginal = useRef<Partial<ChadhavaOffering> | null>(null);
  const [savingOff, setSavingOff] = useState(false);
  const [offeringCounts, setOfferingCounts] = useState<Record<string, number>>({});
  const offeringsRun = useRef(0);

  // Field updates always start from the latest form, never from a copy a slow callback
  // (an image upload) captured earlier: that copy used to undo edits made meanwhile.
  const patch = (fields: Partial<Chadhava>) => setEditing((prev) => (prev ? { ...prev, ...fields } : prev));
  const patchOff = (fields: Partial<ChadhavaOffering>) => setEditingOff((prev) => (prev ? { ...prev, ...fields } : prev));
  // Uploads finish seconds later: only apply them to the form they were started in.
  const form = useFormSession();
  const offForm = useFormSession();

  const openOffering = (o: Partial<ChadhavaOffering> | null) => { offForm.bump(); setEditingOff(o); offOriginal.current = o; };
  const offeringUnsaved = () => editingOff != null && isDirty(editingOff, offOriginal.current);

  // Offering counts for the list view
  const loadCounts = useCallback(async () => {
    const { data, error } = await supabase.from("chadhava_offerings").select("chadhava_id");
    if (error || !data) return; // the badge is a hint; keep the last counts
    const counts: Record<string, number> = {};
    data.forEach((o: { chadhava_id: string }) => { counts[o.chadhava_id] = (counts[o.chadhava_id] || 0) + 1; });
    setOfferingCounts(counts);
  }, []);
  useEffect(() => { loadCounts(); }, [chadhavas, loadCounts]);

  // Load offerings when editing a chadhava. Returns the list (null on failure or when
  // another chadhava was opened meanwhile).
  const loadOfferings = async (chadhavaId: string): Promise<ChadhavaOffering[] | null> => {
    const run = ++offeringsRun.current;
    const { data, error } = await supabase.from("chadhava_offerings").select("*").eq("chadhava_id", chadhavaId).order("sort_order");
    if (run !== offeringsRun.current) return null;
    setOfferingsError(!!error);
    if (error) return null;
    const list = (data ?? []) as ChadhavaOffering[];
    setOfferings(list);
    return list;
  };

  const resetOfferings = () => { offeringsRun.current++; setOfferings([]); setOfferingsError(false); openOffering(null); };

  const startNew = () => { form.bump(); resetOfferings(); setSection("basic"); setEditing(emptyChadhava()); };

  // Edit the row as it is in the database now, not the list's copy.
  const openEdit = async (c: Chadhava) => {
    setOpening(c.id);
    const { data, error } = await supabase.from("chadhavas").select("*").eq("id", c.id).maybeSingle();
    setOpening(null);
    if (error) { toast.error(`Could not open the latest version: ${saveErrorMessage(error)}`); return; }
    if (!data) { toast.error("This chadhava no longer exists."); onRefresh(); return; }
    form.bump();
    resetOfferings();
    setSection("basic");
    setEditing(data as Chadhava);
    loadOfferings(c.id);
  };

  const closeEditor = () => {
    if (offeringUnsaved() && !window.confirm("The offering you're editing isn't saved. Close and lose those changes?")) return;
    form.bump();
    setEditing(null);
    resetOfferings();
  };

  /**
   * Keeps chadhavas.price equal to the cheapest active offering. The site shows that
   * column as the "From" price when offerings can't be loaded, and it used to stay at
   * whatever it was first saved with (0 for new chadhavas).
   */
  const syncFromPrice = async (chadhavaId: string, list: ChadhavaOffering[] | null) => {
    if (!list) return;
    const price = cheapestActive(list);
    try {
      const saved = await updateRow<Chadhava>("chadhavas", chadhavaId, { price });
      // The row's version moved on; keep the open form's copy current so its own save
      // isn't refused as "changed elsewhere".
      setEditing((prev) => (prev && prev.id === chadhavaId ? { ...prev, price: saved.price, updated_at: saved.updated_at } : prev));
    } catch {
      /* the next offering save retries; checkout uses offering prices, not this */
    }
  };

  /* ── Save Chadhava ── */
  const save = async () => {
    if (!editing) return;
    if (!editing.item?.trim()) {
      toast.error("Please fill in the chadhava name");
      return;
    }
    if (offeringUnsaved()) {
      toast.error("Save or cancel the offering you're editing first (its own Update button), then update the chadhava.");
      setSection("offerings");
      return;
    }
    setSaving(true);
    const payload = {
      temple: editing.temple?.trim() || "",
      item: editing.item.trim(),
      date: editing.date?.trim() || null,
      countdown_datetime: fromIstInput(editing.countdown_datetime),
      price: editing.price || 0,
      image_url: editing.image_url || null,
      description: editing.description?.trim() || null,
      item_hi: editing.item_hi?.trim() || null,
      temple_hi: editing.temple_hi?.trim() || null,
      description_hi: editing.description_hi?.trim() || null,
      occasion: editing.occasion?.trim() || null,
      occasion_hi: editing.occasion_hi?.trim() || null,
      gallery: editing.gallery || [],
      about: editing.about?.trim() || null,
      about_hi: editing.about_hi?.trim() || null,
      faqs: (editing.faqs || []).filter((f) => f.question.trim()),
      faqs_hi: editing.faqs_hi || [],
      featured: editing.featured || false,
      status: editing.status || "draft",
    };

    try {
      // `version`: refuse to overwrite a save made on another device after this form opened.
      if (editing.id) await updateRow("chadhavas", editing.id, payload, { version: editing.updated_at });
      else await insertRow("chadhavas", payload);
    } catch (e) {
      toast.error(saveErrorMessage(e), { duration: 10000 });
      return;
    } finally {
      setSaving(false);
    }
    clearCatalogCache();
    toast.success(editing.id ? "Chadhava updated" : "Chadhava created");
    await onRefresh();
    form.bump();
    setEditing(null);
    resetOfferings();
  };

  /* ── Delete Chadhava ── */
  const remove = async (c: Chadhava) => {
    if (!confirm(`Delete the chadhava "${c.item}" and all its offerings?`)) return;
    setDeleting(c.id);
    try {
      await deleteRow("chadhavas", c.id);
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    } finally {
      setDeleting(null);
    }
    clearCatalogCache();
    toast.success("Chadhava deleted");
    onRefresh();
  };

  /* ── Toggle status ── */
  const toggleStatus = async (c: Chadhava) => {
    const next = c.status === "active" ? "draft" : "active";
    try {
      await updateRow("chadhavas", c.id, { status: next });
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    }
    clearCatalogCache();
    toast.success(`Chadhava ${next === "active" ? "published" : "unpublished"}`); onRefresh();
  };

  /* ── Save Offering ── */
  const saveOffering = async () => {
    if (!editingOff) return;
    if (!editingOff.name?.trim()) { toast.error("The offering needs a name."); return; }
    if (!isWholeRupees(editingOff.price)) { toast.error(`The offering price ${PRICE_RULE}.`); return; }
    if (!Number.isInteger(editingOff.sort_order ?? 0)) { toast.error("Sort order must be a whole number."); return; }
    setSavingOff(true);
    const payload = {
      chadhava_id: editingOff.chadhava_id,
      name: editingOff.name.trim(),
      name_hi: editingOff.name_hi?.trim() || null,
      price: editingOff.price,
      image_url: editingOff.image_url || null,
      description: editingOff.description?.trim() || null,
      description_hi: editingOff.description_hi?.trim() || null,
      status: editingOff.status || "active",
      sort_order: editingOff.sort_order || 0,
    };
    try {
      if (editingOff.id) await updateRow("chadhava_offerings", editingOff.id, payload);
      else await insertRow("chadhava_offerings", payload);
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    } finally {
      setSavingOff(false);
    }
    clearCatalogCache();
    toast.success(editingOff.id ? "Offering updated" : "Offering created");
    openOffering(null);
    if (editingOff.chadhava_id) syncFromPrice(editingOff.chadhava_id, await loadOfferings(editingOff.chadhava_id));
    loadCounts();
  };

  const removeOffering = async (o: ChadhavaOffering) => {
    if (!window.confirm(`Delete the offering "${o.name}"?`)) return;
    try {
      await deleteRow("chadhava_offerings", o.id);
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    }
    clearCatalogCache();
    toast.success("Offering deleted");
    if (editingOff?.id === o.id) openOffering(null);
    syncFromPrice(o.chadhava_id, await loadOfferings(o.chadhava_id));
    loadCounts();
  };

  /* ── Gallery helpers (functional: an upload finishes after other edits) ── */
  const addGalleryImage = (url: string) =>
    setEditing((prev) => {
      if (!prev) return prev;
      if ((prev.gallery || []).length >= 6) { toast.error("Max 6 images"); return prev; }
      return { ...prev, gallery: [...(prev.gallery || []), url] };
    });
  const removeGalleryImage = (idx: number) =>
    setEditing((prev) => (prev ? { ...prev, gallery: (prev.gallery || []).filter((_, i) => i !== idx) } : prev));

  /* ── FAQ helpers ── */
  type Faq = { question: string; answer: string };
  const setFaqs = (fn: (faqs: Faq[]) => Faq[]) =>
    setEditing((prev) => (prev ? { ...prev, faqs: fn(prev.faqs || []) } : prev));
  const addFaq = () => setFaqs((f) => [...f, { question: "", answer: "" }]);
  const updateFaq = (idx: number, field: "question" | "answer", val: string) =>
    setFaqs((f) => f.map((q, i) => (i === idx ? { ...q, [field]: val } : q)));
  const removeFaq = (idx: number) => setFaqs((f) => f.filter((_, i) => i !== idx));

  const inputCls = "w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/60">{chadhavas.length} chadhava{chadhavas.length !== 1 ? "s" : ""}</p>
        <button onClick={startNew} className="flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-maroon transition-all">
          <Plus size={16} />Add Chadhava
        </button>
      </div>

      {/* List */}
      {chadhavas.length === 0 ? (
        <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
          <p className="text-3xl mb-3">🌺</p>
          <p className="font-display text-maroon">No chadhavas yet</p>
          <p className="text-sm text-brown/60 mt-1">Add your first chadhava</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chadhavas.map((c) => (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft transition-all hover:border-gold/60">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-saffron/20 to-gold/20">
                {c.image_url ? <StorageImage src={c.image_url} width={96} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-2xl">🛕</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-maroon text-base truncate">{c.item}</h3>
                  {c.featured && <Star size={14} className="text-saffron fill-saffron shrink-0" />}
                </div>
                <p className="text-xs text-brown/60 mt-0.5">🛕 {c.temple} • {offeringCounts[c.id] || 0} offerings</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleStatus(c)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    c.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>{c.status === "active" ? "Active" : "Draft"}</button>
                <button onClick={() => openEdit(c)} disabled={opening === c.id} aria-label="Edit"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors disabled:opacity-50">
                  {opening === c.id ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
                </button>
                <button onClick={() => remove(c)} disabled={deleting === c.id}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                >{deleting === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Slide-over Form ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeEditor} />
          <div className="relative flex h-full w-full max-w-2xl flex-col bg-ivory shadow-2xl animate-fadeIn">
            <div className="shrink-0 flex items-center justify-between border-b border-gold/30 bg-ivory/95 px-4 sm:px-6 py-4 backdrop-blur">
              <h3 className="font-display text-lg text-maroon">{editing.id ? "Edit Chadhava" : "New Chadhava"}</h3>
              <button onClick={closeEditor} aria-label="Close" className="text-brown/50 hover:text-maroon transition-colors"><X size={20} /></button>
            </div>

            {/* Section tabs */}
            <div className="shrink-0 flex border-b border-gold/30 bg-ivory/95 backdrop-blur px-4 sm:px-6 gap-1 overflow-x-auto">
              {[
                { id: "basic", label: "Basic Info" },
                { id: "gallery", label: "Gallery" },
                { id: "offerings", label: `Offerings (${offerings.length})` },
                { id: "about", label: "About" },
                { id: "faqs", label: "FAQs" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setSection(tab.id)}
                  className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    section === tab.id ? "border-saffron text-saffron" : "border-transparent text-brown/50 hover:text-maroon"
                  }`}>{tab.label}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* ── Basic Info ── */}
              {section === "basic" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Main Image</label>
                    <ImageUpload value={editing.image_url || null} onChange={form.guard((url: string | null) => patch({ image_url: url }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Chadhava Name *</label>
                    <input value={editing.item || ""} onChange={(e) => patch({item: e.target.value })}
                      className={inputCls} placeholder="e.g. Gau Seva Chadhava" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Temple Name</label>
                    <input value={editing.temple || ""} onChange={(e) => patch({temple: e.target.value })}
                      className={inputCls} placeholder="e.g. Vrindavan Teerth Kshetra, Mathura" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Date</label>
                    <input value={editing.date || ""} onChange={(e) => patch({date: e.target.value })}
                      className={inputCls} placeholder="e.g. 25 May" />
                    <p className="text-[11px] text-brown/40 mt-1">Display text shown to users (e.g. "25 May", "Every Monday")</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Countdown Date & Time</label>
                    <input type="datetime-local" value={toIstInput(editing.countdown_datetime)} onChange={(e) => patch({countdown_datetime: e.target.value })}
                      className={inputCls} />
                    <p className="text-[11px] text-brown/40 mt-1">India time (IST). Timer counts down to this exact date & time. Leave empty to use end of day.</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Benefit / Short Description</label>
                    <textarea value={editing.description || ""} onChange={(e) => patch({description: e.target.value })}
                      rows={2} className={inputCls + " resize-none"} placeholder="e.g. For end of suffering and prosperity in life" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Special Occasion Tag</label>
                    <input value={editing.occasion || ""} onChange={(e) => patch({occasion: e.target.value })}
                      className={inputCls} placeholder="e.g. Akshaya Tritiya Special" />
                    <p className="text-[11px] text-brown/40 mt-1">Shown as a highlighted badge above the title (leave empty to hide)</p>
                  </div>

                  {/* Hindi */}
                  <div className="rounded-xl border border-saffron/40 bg-saffron/5 p-4 space-y-4">
                    <p className="text-xs font-bold text-saffron uppercase tracking-wider">🇮🇳 हिंदी अनुवाद</p>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-maroon">चढ़ावा का नाम</label>
                      <input value={editing.item_hi || ""} onChange={(e) => patch({item_hi: e.target.value })}
                        className={inputCls} placeholder="जैसे: गौ सेवा चढ़ावा" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-maroon">मंदिर का नाम</label>
                      <input value={editing.temple_hi || ""} onChange={(e) => patch({temple_hi: e.target.value })}
                        className={inputCls} placeholder="जैसे: वृंदावन तीर्थ क्षेत्र, मथुरा" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-maroon">विवरण / लाभ</label>
                      <textarea value={editing.description_hi || ""} onChange={(e) => patch({description_hi: e.target.value })}
                        rows={2} className={inputCls + " resize-none"} placeholder="जैसे: कष्ट निवारण और समृद्धि के लिए" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-maroon">विशेष अवसर टैग</label>
                      <input value={editing.occasion_hi || ""} onChange={(e) => patch({occasion_hi: e.target.value })}
                        className={inputCls} placeholder="जैसे: अक्षय तृतीया विशेष" />
                    </div>
                  </div>

                  {/* Status & Featured */}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={editing.status === "active"} onChange={(e) => patch({status: e.target.checked ? "active" : "draft" })}
                        className="h-4 w-4 rounded border-gold accent-saffron" />
                      <span className="text-sm text-maroon font-medium">Active (visible on website)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={editing.featured || false} onChange={(e) => patch({featured: e.target.checked })}
                        className="h-4 w-4 rounded border-gold accent-saffron" />
                      <span className="text-sm text-maroon font-medium">Featured on homepage</span>
                    </label>
                  </div>
                </>
              )}

              {/* ── Gallery ── */}
              {section === "gallery" && (
                <>
                  <p className="text-xs text-brown/60 font-semibold">Upload up to 6 images for the temple gallery</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(editing.gallery || []).map((url, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden border border-gold/30 aspect-square bg-cream">
                        <StorageImage src={url} width={128} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white grid place-items-center text-xs hover:bg-red-600">×</button>
                      </div>
                    ))}
                    {(editing.gallery || []).length < 6 && (
                      <div className="rounded-xl border-2 border-dashed border-gold/40 aspect-square flex items-center justify-center">
                        <ImageUpload value={null} onChange={form.guard((url: string | null) => { if (url) addGalleryImage(url); })} />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Offerings ── */}
              {section === "offerings" && (
                <>
                  {!editing.id ? (
                    <p className="text-sm text-brown/60 italic">Save the chadhava first, then add offerings.</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
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
                        <p className="text-sm text-brown/40 italic text-center py-6">No offerings yet — add your first one</p>
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
                              <input value={editingOff.name || ""} onChange={e => patchOff({name: e.target.value })} className={inputCls} placeholder="Phool Mala" />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-maroon">Name (HI)</label>
                              <input value={editingOff.name_hi || ""} onChange={e => patchOff({name_hi: e.target.value })} className={inputCls} placeholder="फूल माला" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-maroon">Price (₹) *</label>
                              <input type="number" inputMode="numeric" min={1} step={1} value={editingOff.price || ""} onChange={e => patchOff({price: priceInput(e.target.value) })} className={inputCls} />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-maroon">Sort Order</label>
                              <input type="number" value={editingOff.sort_order || 0} onChange={e => patchOff({sort_order: Number(e.target.value) || 0 })} className={inputCls} />
                            </div>
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
                </>
              )}

              {/* ── About ── */}
              {section === "about" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">About This Temple (EN)</label>
                    <textarea value={editing.about || ""} onChange={(e) => patch({about: e.target.value })}
                      rows={6} className={inputCls + " resize-none"} placeholder="Write about this temple's history, significance, and divine energy…" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">मंदिर के बारे में (HI)</label>
                    <textarea value={editing.about_hi || ""} onChange={(e) => patch({about_hi: e.target.value })}
                      rows={6} className={inputCls + " resize-none"} placeholder="इस मंदिर के बारे में हिंदी में लिखें…" />
                    <p className="mt-1 text-xs text-ink-soft">Tip: a short line on its own (like “Location:”) shows as a heading on the site, and “Label: text” shows the label in bold.</p>
                  </div>
                </>
              )}

              {/* ── FAQs ── */}
              {section === "faqs" && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-brown/60">{(editing.faqs || []).length} FAQs</p>
                    <button onClick={addFaq} className="flex items-center gap-1 rounded-lg bg-saffron px-3 py-2 text-xs font-semibold text-white hover:bg-maroon"><Plus size={14} /> Add FAQ</button>
                  </div>
                  <div className="space-y-3">
                    {(editing.faqs || []).map((faq, i) => (
                      <div key={i} className="rounded-xl border border-gold/30 bg-cream p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <input value={faq.question} onChange={e => updateFaq(i, "question", e.target.value)}
                            className={inputCls} placeholder="Question" />
                          <button onClick={() => removeFaq(i)} className="shrink-0 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                        <textarea value={faq.answer} onChange={e => updateFaq(i, "answer", e.target.value)}
                          rows={2} className={inputCls + " resize-none"} placeholder="Answer" />
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>

            {/* Sticky action bar — always reachable on mobile */}
            <div className="shrink-0 flex gap-3 border-t border-gold/20 bg-ivory px-4 sm:px-6 py-3"
                 style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}>
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-saffron py-3 text-sm font-bold text-white shadow-md hover:bg-maroon transition-all disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : editing.id ? "Update Chadhava" : "Create Chadhava"}
              </button>
              <button onClick={closeEditor} className="rounded-xl border border-gold/50 px-6 py-3 text-sm font-medium text-maroon hover:bg-gold/10 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChadhavaManager;
