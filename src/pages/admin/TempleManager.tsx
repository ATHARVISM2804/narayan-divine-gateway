import { useState } from "react";
import { supabase, type Temple } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Loader2, Star, MapPin } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import StorageImage from "@/components/StorageImage";
import { deleteRow, insertRow, saveErrorMessage, updateRow } from "@/lib/adminWrite";
import { clearCatalogCache } from "@/lib/catalog";
import { useFormSession } from "./useFormSession";

interface Props { temples: Temple[]; onRefresh: () => Promise<void> | void }

const emptyTemple = (sortOrder = 0): Partial<Temple> => ({
  name: "", name_hi: "",
  city: "", state: "", state_hi: "",
  deity: "", deity_hi: "",
  timings: "", image_url: null,
  rating: 4.8, reviews: 0,
  established: "", best_time: "",
  description: "", description_hi: "",
  highlights: [], highlights_hi: [],
  sort_order: sortOrder,
  status: "draft",
});

const inputCls = "w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron";
const labelCls = "text-[11px] font-semibold text-maroon";

const TempleManager = ({ temples, onRefresh }: Props) => {
  const [editing, setEditing] = useState<Partial<Temple> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [section, setSection] = useState<"basic" | "details" | "about" | "highlights">("basic");

  // Field updates start from the latest form, never from a copy a slow upload captured.
  const patch = (fields: Partial<Temple>) => setEditing((prev) => (prev ? { ...prev, ...fields } : prev));
  const form = useFormSession();

  // Edit the row as it is in the database now, not the list's copy.
  const openEdit = async (t: Temple) => {
    setOpening(t.id);
    const { data, error } = await supabase.from("temples").select("*").eq("id", t.id).maybeSingle();
    setOpening(null);
    if (error) { toast.error(`Could not open the latest version: ${saveErrorMessage(error)}`); return; }
    if (!data) { toast.error("This temple no longer exists."); onRefresh(); return; }
    form.bump();
    setEditing(data as Temple);
    setSection("basic");
  };
  const closeEditor = () => { form.bump(); setEditing(null); };

  /* ── Save (insert / update) ── */
  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) { toast.error("Please fill in the temple name"); return; }
    if (editing.rating != null && !(editing.rating >= 0 && editing.rating <= 5)) { toast.error("Rating must be between 0 and 5."); setSection("details"); return; }
    if (!Number.isInteger(editing.reviews ?? 0) || (editing.reviews ?? 0) < 0) { toast.error("Reviews count must be a whole number."); setSection("details"); return; }
    if (!Number.isInteger(editing.sort_order ?? 0)) { toast.error("Sort order must be a whole number."); setSection("details"); return; }
    setSaving(true);
    const payload = {
      name: editing.name.trim(),
      name_hi: editing.name_hi?.trim() || null,
      city: editing.city?.trim() || null,
      state: editing.state?.trim() || null,
      state_hi: editing.state_hi?.trim() || null,
      deity: editing.deity?.trim() || null,
      deity_hi: editing.deity_hi?.trim() || null,
      timings: editing.timings?.trim() || null,
      image_url: editing.image_url || null,
      rating: editing.rating ?? null,
      reviews: editing.reviews ?? 0,
      established: editing.established?.trim() || null,
      best_time: editing.best_time?.trim() || null,
      description: editing.description?.trim() || null,
      description_hi: editing.description_hi?.trim() || null,
      highlights: (editing.highlights || []).map((h) => h.trim()).filter(Boolean),
      highlights_hi: (editing.highlights_hi || []).map((h) => h.trim()).filter(Boolean),
      sort_order: editing.sort_order || 0,
      status: editing.status || "draft",
    };
    try {
      // `version`: refuse to overwrite a save made on another device after this form opened.
      if (editing.id) await updateRow("temples", editing.id, payload, { version: editing.updated_at });
      else await insertRow("temples", payload);
    } catch (e) {
      toast.error(saveErrorMessage(e), { duration: 10000 });
      return;
    } finally {
      setSaving(false);
    }
    clearCatalogCache();
    toast.success(editing.id ? "Temple updated" : "Temple created");
    await onRefresh();
    closeEditor();
  };

  /* ── Delete ── */
  const remove = async (t: Temple) => {
    if (!confirm(`Delete the temple "${t.name}"? This cannot be undone.`)) return;
    setDeleting(t.id);
    try {
      await deleteRow("temples", t.id);
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    } finally {
      setDeleting(null);
    }
    clearCatalogCache();
    toast.success("Temple deleted");
    onRefresh();
  };

  /* ── Publish / unpublish ── */
  const toggleStatus = async (t: Temple) => {
    const next = t.status === "active" ? "draft" : "active";
    try {
      await updateRow("temples", t.id, { status: next });
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    }
    clearCatalogCache();
    toast.success(`Temple ${next === "active" ? "published" : "unpublished"}`); onRefresh();
  };

  /* ── Highlight list helpers ── */
  const listKey = (hi: boolean): "highlights" | "highlights_hi" => (hi ? "highlights_hi" : "highlights");
  const setList = (hi: boolean, fn: (list: string[]) => string[]) =>
    setEditing((prev) => (prev ? { ...prev, [listKey(hi)]: fn(prev[listKey(hi)] || []) } : prev));
  const addHighlight = (hi: boolean) => setList(hi, (l) => [...l, ""]);
  const updateHighlight = (hi: boolean, idx: number, val: string) => setList(hi, (l) => l.map((h, i) => (i === idx ? val : h)));
  const removeHighlight = (hi: boolean, idx: number) => setList(hi, (l) => l.filter((_, i) => i !== idx));

  const openNew = () => {
    const maxOrder = temples.reduce((m, t) => Math.max(m, t.sort_order || 0), 0);
    form.bump();
    setEditing(emptyTemple(maxOrder + 1));
    setSection("basic");
  };

  const sections = [
    { key: "basic" as const,      label: "Basic" },
    { key: "details" as const,    label: "Details" },
    { key: "about" as const,      label: "Description" },
    { key: "highlights" as const, label: "Highlights" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brown/70">
          <span className="text-maroon font-bold">{temples.length}</span> temple{temples.length !== 1 ? "s" : ""}
        </p>
        <button onClick={openNew}
          className="flex items-center gap-1.5 rounded-xl bg-saffron px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-maroon transition-colors">
          <Plus size={16} /> New Temple
        </button>
      </div>

      {/* List */}
      {temples.length === 0 ? (
        <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
          <p className="text-3xl mb-3">🛕</p>
          <p className="font-display text-maroon">No temples yet</p>
          <p className="text-xs text-brown/50 mt-1">Click "New Temple" to add your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {temples.map((t) => (
            <div key={t.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft transition-all hover:border-gold/60">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-saffron/20 to-gold/20">
                {t.image_url
                  ? <StorageImage src={t.image_url} width={96} alt="" className="h-full w-full object-cover" />
                  : <div className="grid h-full w-full place-items-center text-2xl">🛕</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-maroon text-sm">{t.name}</h3>
                  {t.deity && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-maroon">{t.deity}</span>}
                </div>
                <p className="flex items-center gap-1 text-xs text-brown/60 mt-0.5">
                  <MapPin size={11} className="text-saffron" /> {[t.city, t.state].filter(Boolean).join(", ") || "—"}
                </p>
                <p className="flex items-center gap-2 text-[11px] text-brown/40 mt-0.5">
                  {t.rating != null && <span className="flex items-center gap-0.5"><Star size={10} className="text-saffron fill-saffron" /> {t.rating}</span>}
                  <span>· {(t.reviews || 0).toLocaleString("en-IN")} reviews</span>
                  {t.timings && <span>· {t.timings}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleStatus(t)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    t.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>{t.status === "active" ? "Active" : "Draft"}</button>
                <button onClick={() => openEdit(t)} disabled={opening === t.id} aria-label="Edit"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors disabled:opacity-50">
                  {opening === t.id ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
                </button>
                <button onClick={() => remove(t)} disabled={deleting === t.id}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50">
                  {deleting === t.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Slide-over form ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeEditor} />
          <div className="relative flex h-full w-full max-w-2xl flex-col bg-ivory shadow-2xl animate-fadeIn">
            <div className="shrink-0 flex items-center justify-between border-b border-gold/30 bg-ivory/95 px-4 sm:px-6 py-4 backdrop-blur">
              <h3 className="font-display text-lg text-maroon">{editing.id ? "Edit Temple" : "New Temple"}</h3>
              <button onClick={closeEditor} aria-label="Close" className="text-brown/50 hover:text-maroon transition-colors"><X size={20} /></button>
            </div>

            {/* Section tabs */}
            <div className="shrink-0 flex gap-1.5 border-b border-gold/20 bg-ivory/95 px-4 sm:px-6 py-2.5 backdrop-blur overflow-x-auto">
              {sections.map((s) => (
                <button key={s.key} onClick={() => setSection(s.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                    section === s.key ? "bg-saffron text-white shadow-sm" : "bg-cream border border-gold/40 text-maroon hover:bg-gold/20"
                  }`}>{s.label}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
              {/* ── BASIC ── */}
              {section === "basic" && (
                <>
                  <div>
                    <label className={labelCls}>Temple Photo</label>
                    <div className="mt-1"><ImageUpload value={editing.image_url ?? null} onChange={form.guard((url: string | null) => patch({ image_url: url }))} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>Name (EN) *</label><input value={editing.name || ""} onChange={(e) => patch({name: e.target.value })} className={inputCls} placeholder="Kashi Vishwanath" /></div>
                    <div><label className={labelCls}>Name (HI)</label><input value={editing.name_hi || ""} onChange={(e) => patch({name_hi: e.target.value })} className={inputCls} placeholder="काशी विश्वनाथ" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>City</label><input value={editing.city || ""} onChange={(e) => patch({city: e.target.value })} className={inputCls} placeholder="Varanasi" /></div>
                    <div><label className={labelCls}>State (EN)</label><input value={editing.state || ""} onChange={(e) => patch({state: e.target.value })} className={inputCls} placeholder="Uttar Pradesh" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>State (HI)</label><input value={editing.state_hi || ""} onChange={(e) => patch({state_hi: e.target.value })} className={inputCls} placeholder="उत्तर प्रदेश" /></div>
                    <div><label className={labelCls}>Deity (EN)</label><input value={editing.deity || ""} onChange={(e) => patch({deity: e.target.value })} className={inputCls} placeholder="Shiva" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>Deity (HI)</label><input value={editing.deity_hi || ""} onChange={(e) => patch({deity_hi: e.target.value })} className={inputCls} placeholder="शिव" /></div>
                  </div>
                </>
              )}

              {/* ── DETAILS ── */}
              {section === "details" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>Timings</label><input value={editing.timings || ""} onChange={(e) => patch({timings: e.target.value })} className={inputCls} placeholder="4 AM – 11 PM" /></div>
                    <div><label className={labelCls}>Established</label><input value={editing.established || ""} onChange={(e) => patch({established: e.target.value })} className={inputCls} placeholder="11th Century" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>Best Time to Visit</label><input value={editing.best_time || ""} onChange={(e) => patch({best_time: e.target.value })} className={inputCls} placeholder="Oct – Mar" /></div>
                    <div><label className={labelCls}>Sort Order</label><input type="number" value={editing.sort_order ?? 0} onChange={(e) => patch({sort_order: Number(e.target.value) })} className={inputCls} placeholder="1" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>Rating (0–5)</label><input type="number" step="0.1" min="0" max="5" value={editing.rating ?? ""} onChange={(e) => patch({rating: e.target.value === "" ? null : Number(e.target.value) })} className={inputCls} placeholder="4.9" /></div>
                    <div><label className={labelCls}>Reviews Count</label><input type="number" value={editing.reviews ?? 0} onChange={(e) => patch({reviews: Number(e.target.value) })} className={inputCls} placeholder="12480" /></div>
                  </div>
                  <p className="text-[11px] text-brown/50">Rating &amp; reviews show on the temple card and in the detail popup.</p>
                </>
              )}

              {/* ── DESCRIPTION ── */}
              {section === "about" && (
                <>
                  <div><label className={labelCls}>Description (EN)</label><textarea value={editing.description || ""} onChange={(e) => patch({description: e.target.value })} rows={4} className={inputCls + " resize-none"} placeholder="About this temple…" /></div>
                  <div><label className={labelCls}>Description (HI)</label><textarea value={editing.description_hi || ""} onChange={(e) => patch({description_hi: e.target.value })} rows={4} className={inputCls + " resize-none"} placeholder="मंदिर के बारे में…" /></div>
                </>
              )}

              {/* ── HIGHLIGHTS ── */}
              {section === "highlights" && (
                <>
                  {([false, true] as const).map((hi) => (
                    <div key={String(hi)}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelCls}>{hi ? "Highlights (HI)" : "Highlights (EN)"} — “Famous For” pills</label>
                        <button onClick={() => addHighlight(hi)} className="flex items-center gap-1 text-xs font-semibold text-saffron hover:text-maroon"><Plus size={13} /> Add</button>
                      </div>
                      <div className="space-y-2">
                        {(editing[listKey(hi)] || []).length === 0 && <p className="text-xs text-brown/40 italic">No highlights yet.</p>}
                        {(editing[listKey(hi)] || []).map((h, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input value={h} onChange={(e) => updateHighlight(hi, i, e.target.value)} className={inputCls} placeholder={hi ? "गंगा आरती" : "Ganga Aarti"} />
                            <button onClick={() => removeHighlight(hi, i)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Status + Save */}
              <div className="flex items-center gap-2 pt-2">
                <span className={labelCls}>Status:</span>
                {(["active", "draft"] as const).map((s) => (
                  <button key={s} onClick={() => patch({status: s })}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all capitalize ${
                      editing.status === s ? "bg-saffron text-white shadow-sm" : "bg-cream border border-gold/40 text-maroon hover:bg-gold/20"
                    }`}>{s === "active" ? "Active (live)" : "Draft (hidden)"}</button>
                ))}
              </div>

            </div>

            {/* Sticky action bar — always reachable on mobile */}
            <div className="shrink-0 flex gap-3 border-t border-gold/20 bg-ivory px-4 sm:px-6 py-3"
                 style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}>
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-saffron py-3 text-sm font-bold text-white shadow-md hover:bg-maroon transition-all disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : editing.id ? "Update Temple" : "Create Temple"}
              </button>
              <button onClick={closeEditor} className="rounded-xl border border-gold/50 px-6 py-3 text-sm font-medium text-maroon hover:bg-gold/10 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempleManager;
