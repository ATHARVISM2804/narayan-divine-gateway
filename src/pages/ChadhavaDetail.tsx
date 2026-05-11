import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCart } from "@/context/CartContext";
import { supabase, type Chadhava } from "@/lib/supabase";
import { Loader2, ShoppingCart, Check, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import defaultOfferingImg from "@/assets/chadhava-offering.png";
import { useLanguage } from "@/context/LanguageContext";

const ChadhavaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { addItem } = useCart();
  const { t, lang } = useLanguage();

  const [chadhava, setChadhava] = useState<Chadhava | null>(null);
  const [loading, setLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  usePageTitle(chadhava ? `${chadhava.item} at ${chadhava.temple} — Narayan Kripa` : "Loading…");

  useEffect(() => {
    if (!id) return;
    supabase.from("chadhavas").select("*").eq("id", id).eq("status", "active").single()
      .then(({ data, error }) => {
        if (error || !data) { nav("/chadhava", { replace: true }); return; }
        setChadhava(data as Chadhava);
        setLoading(false);
      });
  }, [id, nav]);

  const handleAdd = (goToCheckout = false) => {
    if (!chadhava) return;
    addItem({
      id: `chadhava-${chadhava.id}`,
      name: `${chadhava.temple} — ${chadhava.item}`,
      description: chadhava.temple,
      price: chadhava.price,
      category: "chadhava",
      image: chadhava.image_url || defaultOfferingImg,
    });
    if (goToCheckout) {
      toast.success("Proceeding to payment…");
      nav("/checkout");
    } else {
      toast.success(`${chadhava.item} added to cart!`);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
    }
  };

  if (loading) return (
    <main className="min-h-[60vh] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-saffron" />
        <p className="text-brown/60 font-semibold">Loading offering details…</p>
      </div>
    </main>
  );

  if (!chadhava) return null;

  const displayItem = (lang === 'hi' && chadhava.item_hi) ? chadhava.item_hi : chadhava.item;
  const displayTemple = (lang === 'hi' && chadhava.temple_hi) ? chadhava.temple_hi : chadhava.temple;
  const displayDescription = (lang === 'hi' && chadhava.description_hi) ? chadhava.description_hi : chadhava.description;

  const img = chadhava.image_url || defaultOfferingImg;
  const DESC_LIMIT = 220;
  const isLongDesc = (displayDescription?.length || 0) > DESC_LIMIT;
  const shownDesc = displayDescription
    ? (isLongDesc && !descExpanded)
      ? displayDescription.slice(0, DESC_LIMIT) + "…"
      : displayDescription
    : null;

  return (
    <main className="bg-background min-h-screen pb-24 md:pb-10">

      {/* ── Breadcrumb ── */}
      <div className="bg-cream border-b border-gold/20">
        <div className="container py-3 flex items-center gap-2 text-xs font-semibold text-brown/50">
          <Link to="/" className="hover:text-maroon transition-colors">Home</Link>
          <span>/</span>
          <Link to="/chadhava" className="hover:text-maroon transition-colors">{t("breadcrumb_chadhava")}</Link>
          <span>/</span>
          <span className="text-maroon truncate max-w-[200px]">{chadhava.item}</span>
        </div>
      </div>

      {/* ── Main Section ── */}
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] items-start">

          {/* ── LEFT: Image ── */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border-2 border-gold/30 shadow-xl aspect-[4/3] bg-gradient-to-br from-saffron/10 to-maroon/10">
              <img src={img} alt={chadhava.item} className="w-full h-full object-cover" />
            </div>

            {/* Social proof under image */}
            <div className="flex flex-wrap gap-4 px-1">
              {[
                { num: "50,000+", label: t("devotees_served") },
                { num: "100%", label: t("authentic") },
                { num: "4.9★", label: t("avg_rating") },
              ].map(s => (
                <div key={s.label} className="flex-1 min-w-[90px] text-center rounded-xl bg-ivory border border-gold/20 py-3 px-2">
                  <p className="font-bold text-maroon text-lg">{s.num}</p>
                  <p className="text-[11px] text-brown/60 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* What's Included — visible on desktop below image */}
            <div className="hidden lg:block rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
              <h2 className="font-body text-lg font-bold text-maroon mb-4">{t("whats_included")}</h2>
              <ul className="space-y-3">
                {[t("inc1"), t("inc2"), t("inc3"), t("inc4"), t("inc5")].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium text-brown/80">
                    <Check size={15} className="text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── RIGHT: Info + Buy ── */}
          <div className="space-y-5">

            {/* Temple badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-saffron/10 border border-saffron/30 px-4 py-2">
              <span className="text-base">🛕</span>
              <span className="text-sm font-bold text-maroon">{displayTemple}</span>
            </div>

            {/* Title */}
            <h1 className="font-body text-2xl md:text-3xl font-bold text-maroon leading-snug">
              {displayItem}
            </h1>

            {/* Description with Read More */}
            {shownDesc && (
              <div>
                <p className="text-sm font-medium text-brown/75 leading-relaxed">{shownDesc}</p>
                {isLongDesc && (
                  <button onClick={() => setDescExpanded(!descExpanded)}
                    className="mt-2 flex items-center gap-1 text-sm font-bold text-saffron hover:text-maroon transition-colors">
                    {descExpanded ? <><ChevronUp size={15} /> {t("btn_read_less")}</> : <><ChevronDown size={15} /> {t("btn_read_more")}</>}
                  </button>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gold/20" />

            {/* Price */}
            <div className="rounded-2xl bg-gradient-to-r from-saffron/10 to-gold/10 border border-gold/30 px-5 py-4">
              <p className="text-xs text-brown/50 font-bold uppercase tracking-wider">{t("offering_price")}</p>
              <p className="font-bold text-saffron text-4xl mt-1">₹{chadhava.price.toLocaleString("en-IN")}</p>
              <p className="text-xs text-brown/50 mt-1 font-semibold">{t("inclusive")}</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleAdd(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-4 text-[16px] font-bold text-white shadow-lg transition-all hover:shadow-gold-glow hover:-translate-y-0.5"
              >
                {t("btn_offer_now")} <ChevronRight size={20} />
              </button>
              <button
                onClick={() => handleAdd(false)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-[15px] font-bold transition-all ${
                  justAdded
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-gold/50 bg-ivory text-maroon hover:bg-gold/10 hover:border-saffron"
                }`}
              >
                {justAdded
                  ? <><Check size={17} className="text-green-600" /> {t("btn_added")}</>
                  : <><ShoppingCart size={17} className="text-saffron" /> {t("btn_add_cart")}</>
                }
              </button>
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: "🔒", text: t("trust_secure") },
                { icon: "📦", text: t("trust_prasad_home") },
                { icon: "🙏", text: t("trust_priests") },
              ].map(badge => (
                <div key={badge.text} className="rounded-xl border border-gold/20 bg-cream py-2.5 px-1">
                  <p className="text-lg">{badge.icon}</p>
                  <p className="text-[11px] font-bold text-maroon mt-0.5 leading-tight">{badge.text}</p>
                </div>
              ))}
            </div>

            {/* How It Works */}
            <div className="rounded-2xl border border-gold/30 bg-ivory p-5">
              <h2 className="font-body text-base font-bold text-maroon mb-4">{t("how_works")}</h2>
              <div className="flex flex-col gap-4">
                {[
                  { step: "1", title: t("ch_step1t"), desc: t("ch_step1d") },
                  { step: "2", title: t("ch_step2t"), desc: t("ch_step2d") },
                  { step: "3", title: t("ch_step3t"), desc: t("ch_step3d") },
                ].map((s, i, arr) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="shrink-0 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-white font-bold text-sm shadow-md">
                        {s.step}
                      </div>
                      {i < arr.length - 1 && <div className="w-px flex-1 min-h-[20px] bg-gold/30 mt-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="font-bold text-maroon text-sm">{s.title}</p>
                      <p className="text-xs text-brown/60 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What's Included — mobile only */}
        <div className="mt-8 lg:hidden rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
          <h2 className="font-body text-lg font-bold text-maroon mb-4">✦ What's Included</h2>
          <ul className="space-y-3">
            {[t("inc1"), t("inc2"), t("inc3"), t("inc4"), t("inc5")].map((item) => (

              <li key={item} className="flex items-start gap-3 text-sm font-medium text-brown/80">
                <Check size={15} className="text-green-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-ivory border-t-2 border-gold/30 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-maroon text-sm truncate">{displayItem}</p>
          <p className="font-bold text-saffron text-lg leading-tight">₹{chadhava.price.toLocaleString("en-IN")}</p>
        </div>
        <button
          onClick={() => handleAdd(false)}
          className={`shrink-0 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
            justAdded ? "bg-green-500 text-white" : "bg-gradient-to-r from-saffron to-maroon text-white shadow-md"
          }`}
        >
          {justAdded ? <><Check size={15} /> {t("btn_added")}</> : <><ShoppingCart size={15} /> {t("btn_add_cart")}</>}
        </button>
        <button
          onClick={() => handleAdd(true)}
          className="shrink-0 flex items-center gap-2 rounded-xl border-2 border-maroon px-5 py-3 text-sm font-bold text-maroon transition-all hover:bg-maroon hover:text-white"
        >
          {t("btn_offer_now")}
        </button>
      </div>
    </main>
  );
};

export default ChadhavaDetail;
