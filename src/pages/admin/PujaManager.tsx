import { useState } from "react";
import { supabase, type Puja } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Loader2, Star, StarOff } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

interface Props { pujas: Puja[]; onRefresh: () => void }

const DEITIES = ["Vishnu", "Shiva", "Ganga", "Navgraha", "Ganesh", "Durga", "Lakshmi", "Hanuman", "Saraswati", "Other"];

const emptyPuja = (): Partial<Puja> => ({
  name: "", deity: "Vishnu", location: "", date: "", image_url: null,
  prices: [{ label: "Single", price: 951 }, { label: "Couple", price: 1551 }, { label: "4 Family", price: 2551 }, { label: "6 Members", price: 3551 }],
  status: "draft", featured: false,
});

const PujaManager = ({ pujas, onRefresh }: Props) => {
  const [editing, setEditing] = useState<Partial<Puja> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* ── Save (create or update) ── */
  const save = async () => {
    if (!editing) return;
    const { name, deity, location, date, prices } = editing;
    if (!name?.trim() || !deity || !location?.trim() || !date?.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!prices?.length || prices.some((t) => !t.label.trim() || t.price <= 0)) {
      toast.error("Each pricing tier needs a label and a price > 0");
      return;
    }
    setSaving(true);
    const payload = { name: name.trim(), deity, location: location.trim(), date: date.trim(), image_url: editing.image_url || null, prices, status: editing.status || "draft", featured: editing.featured || false };

    let err;
    if (editing.id) {
      ({ error: err } = await supabase.from("pujas").update(payload).eq("id", editing.id));
    } else {
      ({ error: err } = await supabase.from("pujas").insert(payload));
    }
    setSaving(false);
    if (err) { toast.error(err.message); return; }
    toast.success(editing.id ? "Puja updated" : "Puja created");
    setEditing(null);
    onRefresh();
  };

  /* ── Delete ── */
  const remove = async (id: string) => {
    setDeleting(id);
    const { error: err } = await supabase.from("pujas").delete().eq("id", id);
    setDeleting(null);
    if (err) { toast.error(err.message); return; }
    toast.success("Puja deleted");
    onRefresh();
  };

  /* ── Toggle status ── */
  const toggleStatus = async (p: Puja) => {
    const next = p.status === "active" ? "draft" : "active";
    const { error: err } = await supabase.from("pujas").update({ status: next }).eq("id", p.id);
    if (err) toast.error(err.message);
    else { toast.success(`Puja ${next === "active" ? "published" : "unpublished"}`); onRefresh(); }
  };

  /* ── Pricing tier helpers ── */
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/60">{pujas.length} puja{pujas.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setEditing(emptyPuja())} className="flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-maroon transition-all">
          <Plus size={16} />Add Puja
        </button>
      </div>

      {/* List */}
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
              {/* Thumbnail */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-saffron/20 to-gold/20">
                {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-2xl">🪔</div>}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-maroon text-base truncate">{p.name}</h3>
                  {p.featured && <Star size={14} className="text-saffron fill-saffron shrink-0" />}
                </div>
                <p className="text-xs text-brown/60 mt-0.5">{p.deity} • {p.location} • {p.date}</p>
                <p className="text-xs text-saffron font-semibold mt-0.5">From ₹{Math.min(...p.prices.map((t) => t.price)).toLocaleString("en-IN")}</p>
              </div>
              {/* Status + Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleStatus(p)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    p.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >{p.status === "active" ? "Active" : "Draft"}</button>
                <button onClick={() => setEditing({ ...p })} className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(p.id)} disabled={deleting === p.id}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                >{deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
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
            {/* Form header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold/30 bg-ivory/95 px-6 py-4 backdrop-blur">
              <h3 className="font-display text-lg text-maroon">{editing.id ? "Edit Puja" : "New Puja"}</h3>
              <button onClick={() => setEditing(null)} className="text-brown/50 hover:text-maroon transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-5 p-6">
              {/* Image */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Image</label>
                <ImageUpload value={editing.image_url || null} onChange={(url) => setEditing({ ...editing, image_url: url })} />
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Name *</label>
                <input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Maha Rudrabhishek" />
              </div>

              {/* Deity + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Deity *</label>
                  <select value={editing.deity || ""} onChange={(e) => setEditing({ ...editing, deity: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron">
                    {DEITIES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Date *</label>
                  <input value={editing.date || ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                    className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. 13 May" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Location *</label>
                <input value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" placeholder="e.g. Badrinath Dham Shetra" />
              </div>

              {/* Pricing Tiers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-maroon">Pricing Tiers *</label>
                  <button type="button" onClick={addTier} className="flex items-center gap-1 text-xs font-semibold text-saffron hover:text-maroon transition-colors">
                    <Plus size={13} />Add Tier
                  </button>
                </div>
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
                        <button type="button" onClick={() => removeTier(idx)} className="text-red-400 hover:text-red-600 transition-colors"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={editing.status === "active"} onChange={(e) => setEditing({ ...editing, status: e.target.checked ? "active" : "draft" })}
                    className="h-4 w-4 rounded border-gold accent-saffron" />
                  <span className="text-sm text-maroon font-medium">Active (visible on website)</span>
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
                <button onClick={() => setEditing(null)} className="rounded-xl border border-gold/50 px-6 py-3 text-sm font-medium text-maroon hover:bg-gold/10 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PujaManager;
