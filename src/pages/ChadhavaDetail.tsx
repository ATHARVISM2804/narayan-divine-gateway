import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCart } from "@/context/CartContext";
import { supabase, type Chadhava, type ChadhavaOffering } from "@/lib/supabase";
import { Loader2, ShoppingCart, Check, ChevronRight, ChevronDown, ChevronUp, Plus, Minus, MapPin } from "lucide-react";
import { toast } from "sonner";
import PujaGallery from "@/components/puja/PujaGallery";
import { useLanguage } from "@/context/LanguageContext";

const ChadhavaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { addItem } = useCart();
  const { t, lang } = useLanguage();

  const [chadhava, setChadhava] = useState<Chadhava | null>(null);
  const [offerings, setOfferings] = useState<ChadhavaOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  usePageTitle(chadhava ? `${chadhava.item} — Narayan Kripa` : "Loading…");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("chadhavas").select("*").eq("id", id).eq("status", "active").single(),
      supabase.from("chadhava_offerings").select("*").eq("chadhava_id", id).eq("status", "active").order("sort_order"),
    ]).then(([chRes, offRes]) => {
      if (chRes.error || !chRes.data) { nav("/chadhava", { replace: true }); return; }
      setChadhava(chRes.data as Chadhava);
      if (offRes.data) setOfferings(offRes.data as ChadhavaOffering[]);
      setLoading(false);
    });
  }, [id, nav]);

  /* ── Selection logic ── */
  const toggleOffering = (offId: string) => {
    setSelected(prev => {
      const copy = { ...prev };
      if (copy[offId]) delete copy[offId];
      else copy[offId] = 1;
      return copy;
    });
  };

  const updateQty = (offId: string, delta: number) => {
    setSelected(prev => {
      const copy = { ...prev };
      const newQty = (copy[offId] || 1) + delta;
      if (newQty <= 0) delete copy[offId];
      else copy[offId] = newQty;
      return copy;
    });
  };

  const selectedCount = Object.keys(selected).length;
  const totalPrice = offerings.reduce((sum, o) => sum + (selected[o.id] || 0) * o.price, 0);

  const handleProceed = () => {
    if (!chadhava || selectedCount === 0) return;
    offerings.forEach(o => {
      const qty = selected[o.id];
      if (!qty) return;
      for (let i = 0; i < qty; i++) {
        addItem({
          id: `chadhava-${chadhava.id}-${o.id}`,
          name: `${o.name}`,
          description: chadhava.item,
          price: o.price,
          category: "chadhava",
          image: o.image_url || chadhava.image_url || undefined,
        });
      }
    });
    toast.success(`${selectedCount} offering${selectedCount > 1 ? "s" : ""} added to cart!`);
    nav("/cart");
  };

  /* ── Loading ── */
  if (loading) return (
    <main className="min-h-[60vh] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-saffron" />
        <p className="text-brown/60 font-serif italic">Loading chadhava details…</p>
      </div>
    </main>
  );

  if (!chadhava) return null;

  const displayItem = (lang === "hi" && chadhava.item_hi) ? chadhava.item_hi : chadhava.item;
  const displayTemple = (lang === "hi" && chadhava.temple_hi) ? chadhava.temple_hi : chadhava.temple;
  const displayDesc = (lang === "hi" && chadhava.description_hi) ? chadhava.description_hi : chadhava.description;
  const displayAbout = (lang === "hi" && chadhava.about_hi) ? chadhava.about_hi : chadhava.about;
  const faqs = (lang === "hi" && chadhava.faqs_hi?.length) ? chadhava.faqs_hi : chadhava.faqs;
  const galleryImages = chadhava.gallery?.length ? chadhava.gallery : [];

  return (
    <main className="bg-background min-h-screen pb-28 md:pb-10">

      {/* ══════════════════════════════════════════════
          HERO — Same dark maroon style as PujaDetail
          ══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-maroon via-maroon-deep to-maroon">
        {chadhava.image_url && (
          <img src={chadhava.image_url} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/60 via-maroon-deep/80 to-maroon" />

        <div className="container relative py-10 md:py-14">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Gallery — same sizing as PujaDetail */}
            <div className="w-full md:w-[480px] lg:w-[560px] shrink-0">
              <PujaGallery images={galleryImages} fallbackUrl={chadhava.image_url} name={chadhava.item} />
            </div>

            {/* Title + Info */}
            <div className="flex-1">
              <h1 className="font-body text-2xl md:text-3xl font-bold text-gold leading-snug">{displayItem}</h1>

              <div className="mt-4 flex flex-col gap-2">
                <span className="flex items-center gap-2 text-cream/90 text-base font-semibold">
                  <span className="text-lg leading-none">🛕</span> {displayTemple}
                </span>
              </div>

              {displayDesc && (
                <div className="mt-4 rounded-xl bg-white/10 border border-gold/30 px-4 py-3">
                  <p className="text-base font-bold text-gold leading-snug">✦ {displayDesc}</p>
                </div>
              )}

              {/* Scroll to offerings CTA — same style as PujaDetail "Select Package" */}
              <button onClick={() => document.getElementById("offerings")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-gold px-6 py-3.5 text-[15px] font-bold text-white shadow-lg transition-all hover:shadow-gold-glow hover:-translate-y-0.5">
                {t("ch_choose_offering")} <ChevronDown size={18} />
              </button>

              {/* Trust badges — same style as PujaDetail */}
              <div className="mt-6 hidden md:flex flex-wrap gap-2">
                {[
                  { icon: "🪔", text: t("trust_temple") },
                  { icon: "📦", text: t("trust_prasad_home") },
                  { icon: "🔒", text: t("trust_cert") },
                ].map(b => (
                  <span key={b.text} className="flex items-center gap-1.5 rounded-full bg-white/10 border border-gold/20 px-3 py-1.5 text-xs font-semibold text-cream/80">
                    {b.icon} {b.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          CHOOSE YOUR OFFERING — styled like Packages section
          ══════════════════════════════════════════════ */}
      <section id="offerings" className="scroll-mt-32 bg-cream border-b border-gold/20 py-10">
        <div className="container">
          <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-1">{t("ch_choose_offering")}</h2>
          <p className="text-sm text-brown/60 font-semibold mb-6">{t("ch_choose_sub")}</p>

          {offerings.length === 0 ? (
            <div className="rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
              <p className="text-3xl mb-3">🌺</p>
              <p className="font-display text-maroon">{t("ch_no_offerings")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {offerings.map(o => {
                const qty = selected[o.id] || 0;
                const isSelected = qty > 0;
                const dName = (lang === "hi" && o.name_hi) ? o.name_hi : o.name;
                return (
                  <div key={o.id}
                    className={`relative group rounded-2xl overflow-hidden border-2 text-left transition-all duration-300 shadow-soft hover:-translate-y-1 hover:shadow-lg ${
                      isSelected ? "border-saffron shadow-lg -translate-y-1" : "border-gold/30 hover:border-saffron/60"
                    }`}>

                    {/* Image — same style as package cards */}
                    <div className="relative h-28 sm:h-36 overflow-hidden bg-gradient-to-br from-saffron/20 via-gold/15 to-maroon/10 cursor-pointer"
                      onClick={() => toggleOffering(o.id)}>
                      {o.image_url ? (
                        <img src={o.image_url} alt={o.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🌺</div>
                      )}
                      {isSelected && <div className="absolute inset-0 bg-saffron/20" />}
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-saffron flex items-center justify-center shadow-md">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Info — same padding/style as package cards */}
                    <div className={`p-3 md:p-4 transition-colors ${isSelected ? "bg-saffron/5" : "bg-ivory"}`}>
                      <p className="font-bold text-maroon text-sm md:text-base leading-snug line-clamp-2 min-h-[36px]">{dName}</p>
                      <p className="font-bold text-lg md:text-xl mt-1 text-saffron">₹{o.price.toLocaleString("en-IN")}</p>

                      {/* Add / Qty controls */}
                      {!isSelected ? (
                        <button onClick={() => toggleOffering(o.id)}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl border-2 border-gold/50 bg-cream py-2 text-sm font-bold text-maroon transition-all hover:bg-gold/10 hover:border-saffron">
                          <Plus size={14} className="text-saffron" /> {t("ch_add")}
                        </button>
                      ) : (
                        <div className="mt-2 flex items-center justify-between rounded-xl border-2 border-saffron bg-saffron/10 overflow-hidden">
                          <button onClick={() => updateQty(o.id, -1)}
                            className="px-3 py-2 text-saffron hover:bg-saffron hover:text-white transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-maroon text-sm">{qty}</span>
                          <button onClick={() => updateQty(o.id, 1)}
                            className="px-3 py-2 text-saffron hover:bg-saffron hover:text-white transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Summary — same style as PujaDetail action bar */}
          {selectedCount > 0 && (
            <div className="mt-6 rounded-2xl border-2 border-saffron/30 bg-ivory p-5 shadow-soft animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-brown/60 font-semibold">{selectedCount} {t("ch_items_selected")}</p>
                  <p className="font-bold text-saffron text-2xl">₹{totalPrice.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:shrink-0">
                  <button onClick={handleProceed}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon px-6 py-4 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5">
                    {t("ch_proceed")} <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-brown/40 font-serif italic">{t("secure_pay")}</p>
            </div>
          )}

          {/* Trust row — same as PujaDetail packages section */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              { icon: "🪔", text: t("trust_temple") },
              { icon: "🧑‍🦳", text: t("trust_priests") },
              { icon: "📦", text: t("trust_prasad_home") },
              { icon: "📞", text: t("trust_cert") },
            ].map(b => (
              <span key={b.text} className="flex items-center gap-2 rounded-xl bg-ivory border border-gold/30 px-4 py-2.5 text-sm font-semibold text-maroon shadow-soft">
                <span className="text-lg">{b.icon}</span> {b.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ABOUT — same card style as PujaDetail sections
          ══════════════════════════════════════════════ */}
      {displayAbout && (
        <section className="bg-background border-b border-gold/20">
          <div className="container py-10">
            <div className="max-w-4xl mx-auto rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
              <h2 className="font-body text-xl font-bold text-maroon mb-4">{t("ch_about_temple")}</h2>
              <p className="text-sm text-brown/70 leading-relaxed whitespace-pre-line">{displayAbout}</p>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          WHAT'S INCLUDED — same as PujaDetail includes
          ══════════════════════════════════════════════ */}
      <section className="bg-cream border-b border-gold/20">
        <div className="container py-10">
          <div className="max-w-4xl mx-auto rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
            <h3 className="text-sm font-bold text-maroon mb-3">{t("whats_included")}</h3>
            <ul className="space-y-2">
              {[t("inc1"), t("inc2"), t("inc3"), t("inc4"), t("inc5")].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-medium text-brown/80">
                  <Check size={14} className="text-green-500 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — same as PujaDetail fallback
          ══════════════════════════════════════════════ */}
      <section className="bg-background border-b border-gold/20">
        <div className="container py-10">
          <div className="max-w-4xl mx-auto rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
            <h2 className="font-body text-xl font-bold text-maroon mb-4">{t("how_works")}</h2>
            <div className="flex flex-col gap-5">
              {[
                { step: "1", title: t("ch_step1t"), desc: t("ch_step1d") },
                { step: "2", title: t("ch_step2t"), desc: t("ch_step2d") },
                { step: "3", title: t("ch_step3t"), desc: t("ch_step3d") },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-white font-bold text-sm shadow-md">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-bold text-maroon text-sm">{s.title}</p>
                    <p className="text-xs text-brown/60 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQs — same accordion style
          ══════════════════════════════════════════════ */}
      {faqs && faqs.length > 0 && (
        <section className="bg-cream">
          <div className="container py-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-body text-xl font-bold text-maroon mb-6">{t("pd_faqs")}</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="rounded-2xl border border-gold/30 bg-ivory shadow-soft overflow-hidden">
                    <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left">
                      <span className="font-bold text-maroon text-sm pr-4">{faq.question}</span>
                      {faqOpen === i ? <ChevronUp size={18} className="text-saffron shrink-0" /> : <ChevronDown size={18} className="text-brown/40 shrink-0" />}
                    </button>
                    {faqOpen === i && (
                      <div className="px-5 pb-4 border-t border-gold/20">
                        <p className="text-sm text-brown/70 leading-relaxed pt-3">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          STICKY BOTTOM BAR (mobile) — same gradient as PujaDetail CTA
          ══════════════════════════════════════════════ */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-[51] md:hidden bg-ivory border-t-2 border-gold/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-bottom">
          <div className="container py-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-brown/50 font-semibold">{selectedCount} {t("ch_items_selected")}</p>
              <p className="font-bold text-saffron text-xl leading-tight">₹{totalPrice.toLocaleString("en-IN")}</p>
            </div>
            <button onClick={handleProceed}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon px-5 py-3 text-[14px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow">
              <ShoppingCart size={16} /> {t("ch_proceed")} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ChadhavaDetail;
