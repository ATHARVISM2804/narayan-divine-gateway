import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Star, Trash2, Video, X } from "lucide-react";
import { toast } from "sonner";
import { supabase, type Chadhava, type Puja } from "@/lib/supabase";
import { youTubeId, type Review } from "@/lib/proof";
import ImageUpload from "./ImageUpload";
import StorageImage from "@/components/StorageImage";
import { deleteRow, insertRow, saveErrorMessage, updateRow } from "@/lib/adminWrite";
import { clearCatalogCache } from "@/lib/catalog";
import { useFormSession } from "./useFormSession";

interface Props { pujas: Puja[]; chadhavas: Chadhava[] }

const today = () => new Date().toISOString().slice(0, 10);

const emptyReview = (): Partial<Review> => ({
  name: "", city: "", city_hi: "", rating: 5, text: "", text_hi: "",
  puja_id: null, chadhava_id: null, review_date: today(),
  video_url: "", photo_url: null, featured: false, sort_order: 0, status: "draft",
});

const inputCls = "w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron";
const labelCls = "text-[11px] font-semibold text-maroon";

/** Real customer reviews and video testimonials shown on the site.
    Needs docs/sql/reviews-and-proof.sql. Videos are YouTube links (unlisted is
    fine), never uploads: Supabase Storage bandwidth is limited on the free plan. */
const ReviewManager = ({ pujas, chadhavas }: Props) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingTable, setMissingTable] = useState(false);
  const [editing, setEditing] = useState<Partial<Review> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  // Field updates start from the latest form, never from a copy a slow upload captured.
  const patch = (fields: Partial<Review>) => setEditing((prev) => (prev ? { ...prev, ...fields } : prev));
  const form = useFormSession();
  const startNew = () => { form.bump(); setEditing(emptyReview()); };
  const closeEditor = () => { form.bump(); setEditing(null); };

  // Edit the row as it is in the database now, not the list's copy.
  const openEdit = async (r: Review) => {
    setOpening(r.id);
    const { data, error } = await supabase.from("reviews").select("*").eq("id", r.id).maybeSingle();
    setOpening(null);
    if (error) { toast.error(`Could not open the latest version: ${saveErrorMessage(error)}`); return; }
    if (!data) { toast.error("This review no longer exists."); fetchReviews(); return; }
    form.bump();
    setEditing(data as Review);
  };

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("review_date", { ascending: false });
    setLoading(false);
    if (error) {
      setMissingTable(/relation|does not exist|schema cache/i.test(error.message));
      if (!/relation|does not exist|schema cache/i.test(error.message)) toast.error(error.message);
      return;
    }
    setMissingTable(false);
    setReviews((data as Review[]) ?? []);
  };

  useEffect(() => { fetchReviews(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) return toast.error("Please enter the devotee's name");
    if (!editing.text?.trim() && !editing.text_hi?.trim() && !editing.video_url?.trim())
      return toast.error("Add the review text or a video link");
    if (editing.video_url?.trim() && !youTubeId(editing.video_url))
      return toast.error("The video link must be a YouTube link");
    setSaving(true);
    const payload = {
      name: editing.name.trim(),
      city: editing.city?.trim() || null,
      city_hi: editing.city_hi?.trim() || null,
      rating: Math.min(5, Math.max(1, Number(editing.rating) || 5)),
      text: editing.text?.trim() || null,
      text_hi: editing.text_hi?.trim() || null,
      puja_id: editing.puja_id || null,
      chadhava_id: editing.chadhava_id || null,
      review_date: editing.review_date || today(),
      video_url: editing.video_url?.trim() || null,
      photo_url: editing.photo_url || null,
      featured: !!editing.featured,
      sort_order: editing.sort_order || 0,
      status: editing.status || "draft",
    };
    try {
      // `version`: refuse to overwrite a save made on another device after this form opened.
      if (editing.id) await updateRow("reviews", editing.id, payload, { version: (editing as { updated_at?: string }).updated_at });
      else await insertRow("reviews", payload);
    } catch (e) {
      toast.error(saveErrorMessage(e), { duration: 10000 });
      return;
    } finally {
      setSaving(false);
    }
    clearCatalogCache();
    toast.success(editing.id ? "Review updated" : "Review added");
    await fetchReviews();
    closeEditor();
  };

  const remove = async (r: Review) => {
    if (!confirm(`Delete the review by ${r.name}? This cannot be undone.`)) return;
    setDeleting(r.id);
    try {
      await deleteRow("reviews", r.id);
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    } finally {
      setDeleting(null);
    }
    clearCatalogCache();
    toast.success("Review deleted");
    fetchReviews();
  };

  const toggleStatus = async (r: Review) => {
    const next = r.status === "active" ? "draft" : "active";
    try {
      await updateRow("reviews", r.id, { status: next });
    } catch (e) {
      toast.error(saveErrorMessage(e));
      return;
    }
    clearCatalogCache();
    toast.success(next === "active" ? "Review published" : "Review hidden"); fetchReviews();
  };

  const linkedTo = (r: Review) =>
    pujas.find((p) => p.id === r.puja_id)?.name ?? chadhavas.find((c) => c.id === r.chadhava_id)?.item ?? "All pages";

  if (missingTable) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-ivory p-6 text-sm text-brown/80">
        <p className="font-semibold text-maroon">Reviews are not set up yet.</p>
        <p className="mt-1">Run <code className="rounded bg-cream px-1">docs/sql/reviews-and-proof.sql</code> in the Supabase SQL editor once, then refresh this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brown/70">
          <span className="font-bold text-maroon">{reviews.filter((r) => r.status === "active").length}</span> live of {reviews.length}
        </p>
        <button onClick={startNew}
          className="flex items-center gap-1.5 rounded-xl bg-saffron px-4 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-maroon">
          <Plus size={16} /> New review
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-gold/10" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
          <p className="font-semibold text-maroon">No reviews yet</p>
          <p className="mt-1 text-xs text-brown/50">Click "New review" to add the first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="flex flex-col gap-4 rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft sm:flex-row sm:items-center">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-cream text-sm font-bold text-maroon">
                {r.photo_url ? <StorageImage src={r.photo_url} width={64} alt="" className="h-full w-full object-cover" /> : r.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-maroon">{r.name}</h3>
                  {r.city && <span className="text-xs text-brown/60">{r.city}</span>}
                  <span className="flex items-center gap-0.5 text-xs text-brown/70"><Star size={11} className="fill-saffron text-saffron" /> {r.rating}</span>
                  {r.video_url && <span className="flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold text-maroon"><Video size={10} /> Video</span>}
                  {r.featured && <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-bold text-saffron">Featured</span>}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-brown/70">{r.text || r.text_hi || r.video_url}</p>
                <p className="mt-0.5 text-[11px] text-brown/40">{r.review_date} · {linkedTo(r)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => toggleStatus(r)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    r.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>{r.status === "active" ? "Live" : "Draft"}</button>
                <button onClick={() => openEdit(r)} disabled={opening === r.id} aria-label="Edit"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon transition-colors hover:bg-gold/30 disabled:opacity-50">
                  {opening === r.id ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
                </button>
                <button onClick={() => remove(r)} disabled={deleting === r.id}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50">
                  {deleting === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={closeEditor} />
          <div className="relative flex h-full w-full max-w-2xl flex-col bg-ivory shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-gold/30 px-4 py-4 sm:px-6">
              <h3 className="text-lg font-semibold text-maroon">{editing.id ? "Edit review" : "New review"}</h3>
              <button onClick={closeEditor} aria-label="Close" className="text-brown/50 transition-colors hover:text-maroon"><X size={20} /></button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><label className={labelCls}>Devotee name *</label><input value={editing.name || ""} onChange={(e) => patch({name: e.target.value })} className={inputCls} placeholder="Ramesh Gupta" /></div>
                <div><label className={labelCls}>Review date</label><input type="date" value={editing.review_date || ""} onChange={(e) => patch({review_date: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div><label className={labelCls}>City (EN)</label><input value={editing.city || ""} onChange={(e) => patch({city: e.target.value })} className={inputCls} placeholder="Lucknow" /></div>
                <div><label className={labelCls}>City (HI)</label><input value={editing.city_hi || ""} onChange={(e) => patch({city_hi: e.target.value })} className={inputCls} placeholder="लखनऊ" /></div>
                <div>
                  <label className={labelCls}>Rating</label>
                  <select value={editing.rating ?? 5} onChange={(e) => patch({rating: Number(e.target.value) })} className={inputCls}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Review (EN)</label><textarea value={editing.text || ""} onChange={(e) => patch({text: e.target.value })} rows={3} className={inputCls + " resize-none"} placeholder="What the devotee said, in their words" /></div>
              <div><label className={labelCls}>Review (HI)</label><textarea value={editing.text_hi || ""} onChange={(e) => patch({text_hi: e.target.value })} rows={3} className={inputCls + " resize-none"} placeholder="भक्त के अपने शब्दों में" /></div>
              <div>
                <label className={labelCls}>Video testimonial (YouTube link, optional)</label>
                <input value={editing.video_url || ""} onChange={(e) => patch({video_url: e.target.value })} className={inputCls} placeholder="https://youtube.com/shorts/..." />
                {editing.video_url && !youTubeId(editing.video_url) && <p className="mt-1 text-[11px] text-red-500">This does not look like a YouTube link.</p>}
              </div>
              <div>
                <label className={labelCls}>Photo (optional)</label>
                <div className="mt-1"><ImageUpload value={editing.photo_url ?? null} onChange={form.guard((url: string | null) => patch({ photo_url: url }))} /></div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Show on pooja</label>
                  <select value={editing.puja_id || ""} onChange={(e) => patch({puja_id: e.target.value || null, chadhava_id: e.target.value ? null : editing.chadhava_id })} className={inputCls}>
                    <option value="">Not linked</option>
                    {pujas.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Or on chadhava</label>
                  <select value={editing.chadhava_id || ""} onChange={(e) => patch({chadhava_id: e.target.value || null, puja_id: e.target.value ? null : editing.puja_id })} className={inputCls}>
                    <option value="">Not linked</option>
                    {chadhavas.map((c) => <option key={c.id} value={c.id}>{c.item}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-brown/50">Unlinked reviews show everywhere. Linked reviews show first on that page.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><label className={labelCls}>Sort order</label><input type="number" value={editing.sort_order ?? 0} onChange={(e) => patch({sort_order: Number(e.target.value) })} className={inputCls} /></div>
                <label className="mt-5 flex items-center gap-2 text-sm text-maroon">
                  <input type="checkbox" checked={!!editing.featured} onChange={(e) => patch({featured: e.target.checked })} className="h-4 w-4 accent-saffron" />
                  Featured (shown first)
                </label>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className={labelCls}>Status:</span>
                {(["active", "draft"] as const).map((s) => (
                  <button key={s} onClick={() => patch({status: s })}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      editing.status === s ? "bg-saffron text-white shadow-sm" : "border border-gold/40 bg-cream text-maroon hover:bg-gold/20"
                    }`}>{s === "active" ? "Live" : "Draft (hidden)"}</button>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 gap-3 border-t border-gold/20 bg-ivory px-4 py-3 sm:px-6" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}>
              <button onClick={save} disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-saffron py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-maroon disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : editing.id ? "Update review" : "Add review"}
              </button>
              <button onClick={closeEditor} className="rounded-xl border border-gold/50 px-6 py-3 text-sm font-medium text-maroon transition-colors hover:bg-gold/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManager;
