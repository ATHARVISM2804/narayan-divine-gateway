import { useState } from "react";
import { supabase, type Chadhava } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

interface Props { chadhavas: Chadhava[]; onRefresh: () => void }

const emptyChadhava = (): Partial<Chadhava> => ({
  temple: "", item: "", price: 0, image_url: null, description: "",
  item_hi: "", temple_hi: "", description_hi: "", status: "draft",
});

const ChadhavaManager = ({ chadhavas, onRefresh }: Props) => {
  const [editing, setEditing] = useState<Partial<Chadhava> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* ── Save ── */
  const save = async () => {
    if (!editing) return;
    const { temple, item, price } = editing;
    if (!temple?.trim() || !item?.trim() || !price || price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    const payload = { temple: temple.trim(), item: item.trim(), price, image_url: editing.image_url || null, description: editing.description?.trim() || null, item_hi: editing.item_hi?.trim() || null, temple_hi: editing.temple_hi?.trim() || null, description_hi: editing.description_hi?.trim() || null, status: editing.status || "draft" };

    let err;
    if (editing.id) {
      ({ error: err } = await supabase.from("chadhavas").update(payload).eq("id", editing.id));
    } else {
      ({ error: err } = await supabase.from("chadhavas").insert(payload));
    }
    setSaving(false);
    if (err) { toast.error(err.message); return; }
    toast.success(editing.id ? "Chadhava updated" : "Chadhava created");
    setEditing(null);
    onRefresh();
  };

  /* ── Delete ── */
  const remove = async (id: string) => {
    setDeleting(id);
    const { error: err } = await supabase.from("chadhavas").delete().eq("id", id);
    setDeleting(null);
    if (err) { toast.error(err.message); return; }
    toast.success("Chadhava deleted");
    onRefresh();
  };

  /* ── Toggle status ── */
  const toggleStatus = async (c: Chadhava) => {
    const next = c.status === "active" ? "draft" : "active";
    const { error: err } = await supabase.from("chadhavas").update({ status: next }).eq("id", c.id);
    if (err) toast.error(err.message);
    else { toast.success(`Chadhava ${next === "active" ? "published" : "unpublished"}`); onRefresh(); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/60">{chadhavas.length} chadhava{chadhavas.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setEditing(emptyChadhava())} className="flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-maroon transition-all">
          <Plus size={16} />Add Chadhava
        </button>
      </div>

      {/* List */}
      {chadhavas.length === 0 ? (
        <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
          <p className="text-3xl mb-3">🌺</p>
          <p className="font-display text-maroon">No chadhavas yet</p>
          <p className="text-sm text-brown/60 mt-1">Add your first chadhava offering</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chadhavas.map((c) => (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft transition-all hover:border-gold/60">
              {/* Thumbnail */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-saffron/20 to-gold/20">
                {c.image_url ? <img src={c.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-2xl">🌺</div>}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-maroon text-base truncate">{c.temple}</h3>
                <p className="text-xs text-brown/60 mt-0.5">{c.item}</p>
                <p className="text-xs text-saffron font-semibold mt-0.5">₹{c.price.toLocaleString("en-IN")}</p>
              </div>
              {/* Status + Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleStatus(c)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    c.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >{c.status === "active" ? "Active" : "Draft"}</button>
                <button onClick={() => setEditing({ ...c })} className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(c.id)} disabled={deleting === c.id}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-lg overflow-y-auto bg-ivory shadow-2xl animate-fadeIn">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold/30 bg-ivory/95 px-6 py-4 backdrop-blur">
              <h3 className="font-display text-lg text-maroon">{editing.id ? "Edit Chadhava" : "New Chadhava"}</h3>
              <button onClick={() => setEditing(null)} className="text-brown/50 hover:text-maroon transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-5 p-6">
              {/* Image */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Image</label>
                <ImageUpload value={editing.image_url || null} onChange={(url) => setEditing({ ...editing, image_url: url })} />
              </div>

              {/* Temple */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Temple Name *</label>
                <input value={editing.temple || ""} onChange={(e) => setEditing({ ...editing, temple: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Kashi Vishwanath" />
              </div>

              {/* Offering Item */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Offering Item *</label>
                <input value={editing.item || ""} onChange={(e) => setEditing({ ...editing, item: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Bel Patra & Dhatura" />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Description</label>
                <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={4} className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-none"
                  placeholder="Describe the significance of this chadhava, the ritual, and its benefits…" />
                <p className="mt-1 text-[11px] text-brown/40">{(editing.description || "").length} characters</p>
              </div>

              {/* ── Hindi Translation Section ── */}
              <div className="rounded-xl border border-saffron/40 bg-saffron/5 p-4 space-y-4">
                <p className="text-xs font-bold text-saffron uppercase tracking-wider flex items-center gap-1.5">🇮🇳 हिंदी अनुवाद (Hindi Translation)</p>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">मंदिर का नाम (Hindi Temple)</label>
                  <input value={editing.temple_hi || ""} onChange={(e) => setEditing({ ...editing, temple_hi: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="जैसे: काशी विश्वनाथ मंदिर" />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">चढ़ावा वस्तु (Hindi Item)</label>
                  <input value={editing.item_hi || ""} onChange={(e) => setEditing({ ...editing, item_hi: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="जैसे: बेल पत्र और धतूरा" />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">विवरण (Hindi Description)</label>
                  <textarea value={editing.description_hi || ""} onChange={(e) => setEditing({ ...editing, description_hi: e.target.value })}
                    rows={3} className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron resize-none"
                    placeholder="चढ़ावे का महत्व हिंदी में लिखें…" />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Price (₹) *</label>
                <div className="flex items-center rounded-xl border border-gold/50 bg-cream px-4 py-2.5">
                  <span className="text-sm text-brown/50 mr-1">₹</span>
                  <input type="number" value={editing.price || ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) || 0 })}
                    className="w-full bg-transparent text-sm outline-none" placeholder="0" />
                </div>
              </div>

              {/* Status toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={editing.status === "active"} onChange={(e) => setEditing({ ...editing, status: e.target.checked ? "active" : "draft" })}
                  className="h-4 w-4 rounded border-gold accent-saffron" />
                <span className="text-sm text-maroon font-medium">Active (visible on website)</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-gold/20">
                <button onClick={save} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-saffron py-3 text-sm font-bold text-white shadow-md hover:bg-maroon transition-all disabled:opacity-60">
                  {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : editing.id ? "Update Chadhava" : "Create Chadhava"}
                </button>
                <button onClick={() => setEditing(null)} className="rounded-xl border border-gold/50 px-6 py-3 text-sm font-medium text-maroon hover:bg-gold/10 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChadhavaManager;
