import { useState, useEffect } from "react";
import { supabase, type Chadhava, type ChadhavaOffering } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Loader2, ChevronDown, ChevronUp, Image as ImageIcon, Star } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

interface Props { chadhavas: Chadhava[]; onRefresh: () => void }

const emptyChadhava = (): Partial<Chadhava> => ({
  temple: "", item: "", date: "", price: 0, image_url: null, description: "",
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

const ChadhavaManager = ({ chadhavas, onRefresh }: Props) => {
  const [editing, setEditing] = useState<Partial<Chadhava> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [section, setSection] = useState<string>("basic");

  // Offerings state
  const [offerings, setOfferings] = useState<ChadhavaOffering[]>([]);
  const [editingOff, setEditingOff] = useState<Partial<ChadhavaOffering> | null>(null);
  const [savingOff, setSavingOff] = useState(false);
  const [offeringCounts, setOfferingCounts] = useState<Record<string, number>>({});

  // Load offering counts for list view
  useEffect(() => {
    const loadCounts = async () => {
      const { data } = await supabase.from("chadhava_offerings").select("chadhava_id");
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((o: { chadhava_id: string }) => {
          counts[o.chadhava_id] = (counts[o.chadhava_id] || 0) + 1;
        });
        setOfferingCounts(counts);
      }
    };
    loadCounts();
  }, [chadhavas]);

  // Load offerings when editing a chadhava
  const loadOfferings = async (chadhavaId: string) => {
    const { data } = await supabase.from("chadhava_offerings").select("*").eq("chadhava_id", chadhavaId).order("sort_order");
    if (data) setOfferings(data as ChadhavaOffering[]);
  };

  const openEdit = async (c: Partial<Chadhava>) => {
    setEditing(c);
    setSection("basic");
    if (c.id) await loadOfferings(c.id);
    else setOfferings([]);
  };

  /* ── Save Chadhava ── */
  const save = async () => {
    if (!editing) return;
    const { temple } = editing;
    if (!editing.item?.trim()) {
      toast.error("Please fill in the chadhava name");
      return;
    }
    setSaving(true);
    const payload = {
      temple: editing.temple?.trim() || "",
      item: editing.item.trim(),
      date: editing.date?.trim() || null,
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
      faqs: editing.faqs || [],
      faqs_hi: editing.faqs_hi || [],
      featured: editing.featured || false,
      status: editing.status || "draft",
    };

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

  /* ── Delete Chadhava ── */
  const remove = async (id: string) => {
    if (!confirm("Delete this chadhava and all its offerings?")) return;
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

  /* ── Save Offering ── */
  const saveOffering = async () => {
    if (!editingOff || !editingOff.name?.trim() || !editingOff.price) {
      toast.error("Offering name and price required");
      return;
    }
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
    let err;
    if (editingOff.id) {
      ({ error: err } = await supabase.from("chadhava_offerings").update(payload).eq("id", editingOff.id));
    } else {
      ({ error: err } = await supabase.from("chadhava_offerings").insert(payload));
    }
    setSavingOff(false);
    if (err) { toast.error(err.message); return; }
    toast.success(editingOff.id ? "Offering updated" : "Offering created");
    setEditingOff(null);
    if (editing?.id) loadOfferings(editing.id);
  };

  const removeOffering = async (offId: string) => {
    const { error: err } = await supabase.from("chadhava_offerings").delete().eq("id", offId);
    if (err) { toast.error(err.message); return; }
    toast.success("Offering deleted");
    if (editing?.id) loadOfferings(editing.id);
  };

  /* ── Gallery helpers ── */
  const addGalleryImage = (url: string) => {
    if (!editing) return;
    const g = [...(editing.gallery || [])];
    if (g.length >= 6) { toast.error("Max 6 images"); return; }
    g.push(url);
    setEditing({ ...editing, gallery: g });
  };
  const removeGalleryImage = (idx: number) => {
    if (!editing) return;
    const g = [...(editing.gallery || [])];
    g.splice(idx, 1);
    setEditing({ ...editing, gallery: g });
  };

  /* ── FAQ helpers ── */
  const addFaq = () => {
    if (!editing) return;
    setEditing({ ...editing, faqs: [...(editing.faqs || []), { question: "", answer: "" }] });
  };
  const updateFaq = (idx: number, field: "question" | "answer", val: string) => {
    if (!editing) return;
    const f = [...(editing.faqs || [])];
    f[idx] = { ...f[idx], [field]: val };
    setEditing({ ...editing, faqs: f });
  };
  const removeFaq = (idx: number) => {
    if (!editing) return;
    const f = [...(editing.faqs || [])];
    f.splice(idx, 1);
    setEditing({ ...editing, faqs: f });
  };

  const inputCls = "w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/60">{chadhavas.length} chadhava{chadhavas.length !== 1 ? "s" : ""}</p>
        <button onClick={() => openEdit(emptyChadhava())} className="flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-maroon transition-all">
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
                {c.image_url ? <img src={c.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-2xl">🛕</div>}
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
                <button onClick={() => openEdit({ ...c })} className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors"><Pencil size={14} /></button>
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
          <div className="relative w-full max-w-2xl overflow-y-auto bg-ivory shadow-2xl animate-fadeIn">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold/30 bg-ivory/95 px-6 py-4 backdrop-blur">
              <h3 className="font-display text-lg text-maroon">{editing.id ? "Edit Chadhava" : "New Chadhava"}</h3>
              <button onClick={() => setEditing(null)} className="text-brown/50 hover:text-maroon transition-colors"><X size={20} /></button>
            </div>

            {/* Section tabs */}
            <div className="sticky top-[65px] z-10 flex border-b border-gold/30 bg-ivory/95 backdrop-blur px-6 gap-1 overflow-x-auto">
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

            <div className="p-6 space-y-5">
              {/* ── Basic Info ── */}
              {section === "basic" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Main Image</label>
                    <ImageUpload value={editing.image_url || null} onChange={(url) => setEditing({ ...editing, image_url: url })} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Chadhava Name *</label>
                    <input value={editing.item || ""} onChange={(e) => setEditing({ ...editing, item: e.target.value })}
                      className={inputCls} placeholder="e.g. Gau Seva Chadhava" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Temple Name</label>
                    <input value={editing.temple || ""} onChange={(e) => setEditing({ ...editing, temple: e.target.value })}
                      className={inputCls} placeholder="e.g. Vrindavan Teerth Kshetra, Mathura" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Date</label>
                    <input value={editing.date || ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                      className={inputCls} placeholder="e.g. 25 May" />
                    <p className="text-[11px] text-brown/40 mt-1">Shown on cards and detail page (e.g. "25 May", "Every Monday")</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Benefit / Short Description</label>
                    <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      rows={2} className={inputCls + " resize-none"} placeholder="e.g. For end of suffering and prosperity in life" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Special Occasion Tag</label>
                    <input value={editing.occasion || ""} onChange={(e) => setEditing({ ...editing, occasion: e.target.value })}
                      className={inputCls} placeholder="e.g. Akshaya Tritiya Special" />
                    <p className="text-[11px] text-brown/40 mt-1">Shown as a highlighted badge above the title (leave empty to hide)</p>
                  </div>

                  {/* Hindi */}
                  <div className="rounded-xl border border-saffron/40 bg-saffron/5 p-4 space-y-4">
                    <p className="text-xs font-bold text-saffron uppercase tracking-wider">🇮🇳 हिंदी अनुवाद</p>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-maroon">चढ़ावा का नाम</label>
                      <input value={editing.item_hi || ""} onChange={(e) => setEditing({ ...editing, item_hi: e.target.value })}
                        className={inputCls} placeholder="जैसे: गौ सेवा चढ़ावा" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-maroon">मंदिर का नाम</label>
                      <input value={editing.temple_hi || ""} onChange={(e) => setEditing({ ...editing, temple_hi: e.target.value })}
                        className={inputCls} placeholder="जैसे: वृंदावन तीर्थ क्षेत्र, मथुरा" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-maroon">विवरण / लाभ</label>
                      <textarea value={editing.description_hi || ""} onChange={(e) => setEditing({ ...editing, description_hi: e.target.value })}
                        rows={2} className={inputCls + " resize-none"} placeholder="जैसे: कष्ट निवारण और समृद्धि के लिए" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-maroon">विशेष अवसर टैग</label>
                      <input value={editing.occasion_hi || ""} onChange={(e) => setEditing({ ...editing, occasion_hi: e.target.value })}
                        className={inputCls} placeholder="जैसे: अक्षय तृतीया विशेष" />
                    </div>
                  </div>

                  {/* Status & Featured */}
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
                </>
              )}

              {/* ── Gallery ── */}
              {section === "gallery" && (
                <>
                  <p className="text-xs text-brown/60 font-semibold">Upload up to 6 images for the temple gallery</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(editing.gallery || []).map((url, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden border border-gold/30 aspect-square bg-cream">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white grid place-items-center text-xs hover:bg-red-600">×</button>
                      </div>
                    ))}
                    {(editing.gallery || []).length < 6 && (
                      <div className="rounded-xl border-2 border-dashed border-gold/40 aspect-square flex items-center justify-center">
                        <ImageUpload value={null} onChange={(url) => { if (url) addGalleryImage(url); }} />
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
                        <button onClick={() => setEditingOff(emptyOffering(editing.id!))}
                          className="flex items-center gap-1 rounded-lg bg-saffron px-3 py-2 text-xs font-semibold text-white hover:bg-maroon transition-all">
                          <Plus size={14} /> Add Offering
                        </button>
                      </div>

                      {offerings.length === 0 ? (
                        <p className="text-sm text-brown/40 italic text-center py-6">No offerings yet — add your first one</p>
                      ) : (
                        <div className="space-y-2">
                          {offerings.map(o => (
                            <div key={o.id} className="flex items-center gap-3 rounded-xl border border-gold/20 bg-cream p-3">
                              <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gold/10">
                                {o.image_url ? <img src={o.image_url} className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center text-lg">🌺</div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-maroon truncate">{o.name}</p>
                                <p className="text-xs text-saffron font-bold">₹{o.price}</p>
                              </div>
                              <button onClick={() => setEditingOff({ ...o })} className="grid h-7 w-7 place-items-center rounded bg-gold/15 text-maroon hover:bg-gold/30"><Pencil size={12} /></button>
                              <button onClick={() => removeOffering(o.id)} className="grid h-7 w-7 place-items-center rounded bg-red-50 text-red-400 hover:bg-red-100"><Trash2 size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Offering edit form */}
                      {editingOff && (
                        <div className="mt-4 rounded-xl border-2 border-saffron/30 bg-saffron/5 p-4 space-y-3">
                          <p className="text-sm font-bold text-maroon">{editingOff.id ? "Edit Offering" : "New Offering"}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-maroon">Name (EN) *</label>
                              <input value={editingOff.name || ""} onChange={e => setEditingOff({ ...editingOff, name: e.target.value })} className={inputCls} placeholder="Phool Mala" />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-maroon">Name (HI)</label>
                              <input value={editingOff.name_hi || ""} onChange={e => setEditingOff({ ...editingOff, name_hi: e.target.value })} className={inputCls} placeholder="फूल माला" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-maroon">Price (₹) *</label>
                              <input type="number" value={editingOff.price || ""} onChange={e => setEditingOff({ ...editingOff, price: Number(e.target.value) || 0 })} className={inputCls} />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-maroon">Sort Order</label>
                              <input type="number" value={editingOff.sort_order || 0} onChange={e => setEditingOff({ ...editingOff, sort_order: Number(e.target.value) || 0 })} className={inputCls} />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-maroon">Image</label>
                            <ImageUpload value={editingOff.image_url || null} onChange={url => setEditingOff({ ...editingOff, image_url: url })} />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveOffering} disabled={savingOff}
                              className="flex-1 rounded-lg bg-saffron py-2 text-sm font-bold text-white hover:bg-maroon transition-all disabled:opacity-60">
                              {savingOff ? "Saving…" : editingOff.id ? "Update" : "Create"}</button>
                            <button onClick={() => setEditingOff(null)} className="rounded-lg border border-gold/50 px-4 py-2 text-sm text-maroon hover:bg-gold/10">Cancel</button>
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
                    <textarea value={editing.about || ""} onChange={(e) => setEditing({ ...editing, about: e.target.value })}
                      rows={6} className={inputCls + " resize-none"} placeholder="Write about this temple's history, significance, and divine energy…" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">मंदिर के बारे में (HI)</label>
                    <textarea value={editing.about_hi || ""} onChange={(e) => setEditing({ ...editing, about_hi: e.target.value })}
                      rows={6} className={inputCls + " resize-none"} placeholder="इस मंदिर के बारे में हिंदी में लिखें…" />
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

              {/* Save / Cancel */}
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
