import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCart } from "@/context/CartContext";
import { supabase, type Puja } from "@/lib/supabase";
import { Calendar, MapPin, ShoppingCart, Check, ArrowLeft, Loader2, Users, Star, Shield, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const PujaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { addItem } = useCart();

  const [puja, setPuja] = useState<Puja | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [showTierModal, setShowTierModal] = useState(false);

  usePageTitle(puja ? `${puja.name} — Narayan Kripa` : "Loading…");

  useEffect(() => {
    if (!id) return;
    supabase
      .from("pujas")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          nav("/puja", { replace: true });
          return;
        }
        setPuja(data as Puja);
        setLoading(false);
      });
  }, [id, nav]);

  const [selectedTier, setSelectedTier] = useState<{ label: string; price: number } | null>(null);

  const handleAdd = (tier: { label: string; price: number }, goToCheckout = false) => {
    if (!puja) return;
    const itemId = `puja-${puja.id}-${tier.label}`;
    addItem({
      id: itemId,
      name: `${puja.name} (${tier.label})`,
      description: `${puja.date} • ${puja.location}`,
      price: tier.price,
      category: "puja",
      image: puja.image_url || undefined,
    });
    setAddedId(itemId);

    if (goToCheckout) {
      toast.success("Proceeding to payment…");
      nav("/checkout");
    } else {
      toast.success(`${puja.name} (${tier.label}) added to cart!`);
      setSelectedTier(null);
      setTimeout(() => setAddedId(null), 1500);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[60vh] bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-saffron" />
          <p className="text-brown/60 font-serif italic">Loading puja details…</p>
        </div>
      </main>
    );
  }

  if (!puja) return null;

  return (
    <main className="bg-background min-h-screen">
      {/* ── Hero / Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-maroon via-maroon-deep to-maroon">
        {/* Background image with overlay */}
        {puja.image_url && (
          <img src={puja.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/60 via-maroon-deep/80 to-maroon" />

        <div className="container relative py-10 md:py-14">
          <Link to="/puja" className="inline-flex items-center gap-2 text-gold/70 hover:text-gold text-sm mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to all Pujas
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Image */}
            <div className="w-full md:w-80 lg:w-96 shrink-0 rounded-2xl overflow-hidden border-2 border-gold/30 shadow-2xl">
              {puja.image_url ? (
                <img src={puja.image_url} alt={puja.name} className="w-full h-56 md:h-64 object-cover" />
              ) : (
                <div className="w-full h-56 md:h-64 bg-gradient-to-br from-sacred/30 to-gold/20 grid place-items-center">
                  <span className="text-7xl drop-shadow-lg">🪔</span>
                </div>
              )}
            </div>

            {/* Title + Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="rounded-full bg-gold/20 border border-gold/40 px-3 py-1 text-xs font-bold text-gold">
                  {puja.deity}
                </span>
                {puja.featured && (
                  <span className="rounded-full bg-saffron/20 border border-saffron/40 px-3 py-1 text-xs font-bold text-saffron flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Featured
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl text-gold leading-tight">{puja.name}</h1>

              <div className="mt-4 flex flex-col gap-2">
                <span className="flex items-center gap-2 text-cream/80 text-sm">
                  <Calendar size={15} className="text-gold" /> {puja.date}
                </span>
                <span className="flex items-center gap-2 text-cream/80 text-sm">
                  <MapPin size={15} className="text-gold" /> {puja.location}
                </span>
              </div>

              {/* Starting price */}
              <div className="mt-6 flex items-end gap-2">
                <span className="text-cream/60 text-sm">Starting from</span>
                <span className="font-sans text-3xl font-bold text-gold">
                  ₹{Math.min(...(puja.prices || []).map(t => t.price)).toLocaleString("en-IN")}
                </span>
              </div>

              {/* CTA button */}
              <button
                onClick={() => setShowTierModal(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron to-yellow-500 px-8 py-4 text-[15px] font-bold text-white shadow-lg transition-all hover:shadow-gold-glow hover:-translate-y-0.5 group"
              >
                Book Now
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left — Details */}
          <div className="space-y-8">
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "🪔", text: "Authentic Vedic Rituals" },
                { icon: "🧑‍🦳", text: "Verified Experienced Pandits" },
                { icon: "📦", text: "Prasad Delivery Included" },
                { icon: "📞", text: "Live Updates & Support" },
              ].map((b) => (
                <span key={b.text} className="flex items-center gap-2 rounded-xl bg-ivory border border-gold/30 px-4 py-2.5 text-xs font-medium text-maroon shadow-soft">
                  <span className="text-lg">{b.icon}</span> {b.text}
                </span>
              ))}
            </div>

            {/* What you get */}
            <div className="rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
              <h2 className="font-display text-xl text-maroon mb-4 flex items-center gap-2">
                <Shield size={18} className="text-saffron" /> What You Receive
              </h2>
              <ul className="space-y-3">
                {[
                  "Complete puja performed by experienced, verified pandits",
                  "Sankalp taken in your name and gotra",
                  "Sacred prasad & energized items delivered to your address",
                  "Photo/video updates of the puja ceremony",
                  "Puja completion certificate with mantra count",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-brown/80">
                    <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
              <h2 className="font-display text-xl text-maroon mb-4">How It Works</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { step: "1", title: "Book & Pay", desc: "Choose your package and complete secure payment" },
                  { step: "2", title: "Puja Performed", desc: "Expert pandits perform the puja at the sacred location" },
                  { step: "3", title: "Prasad Delivered", desc: "Receive blessed prasad at your doorstep" },
                ].map((s) => (
                  <div key={s.step} className="text-center">
                    <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-white font-bold text-sm shadow-md">
                      {s.step}
                    </div>
                    <p className="font-display text-maroon text-sm">{s.title}</p>
                    <p className="text-xs text-brown/60 mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Pricing Card (sticky) */}
          <div className="h-fit sticky top-28 rounded-2xl border border-gold/60 bg-gradient-to-b from-ivory to-cream p-6 shadow-lg">
            <h2 className="font-display text-xl text-maroon mb-2 flex items-center gap-2">
              <Users size={18} className="text-gold" /> Choose Your Package
            </h2>
            <p className="text-xs text-brown/60 mb-5 font-serif italic">Select the package that suits your needs</p>

            <div className="space-y-3">
              {(puja.prices || []).map((tier) => {
                const itemId = `puja-${puja.id}-${tier.label}`;
                const justAdded = addedId === itemId;
                return (
                  <button
                    key={tier.label}
                    onClick={() => setSelectedTier(tier)}
                    className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      justAdded
                        ? "border-green-400 bg-green-50 shadow-md"
                        : "border-gold/40 bg-cream hover:border-saffron hover:bg-saffron/5 hover:shadow-md"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-maroon text-sm">{tier.label}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-sans font-bold text-saffron text-lg">₹{tier.price.toLocaleString("en-IN")}</span>
                      <div className={`grid h-8 w-8 place-items-center rounded-full transition-all ${
                        justAdded ? "bg-green-500 text-white" : "bg-saffron/15 text-saffron"
                      }`}>
                        {justAdded ? <Check size={16} /> : <ChevronRight size={14} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-center text-[11px] text-brown/50 font-serif italic">
              🔒 Secure payment via Razorpay
            </p>
          </div>
        </div>
      </div>

      {/* ── Tier Selection Modal (from Book Now button) ── */}
      {showTierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTierModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-ivory shadow-2xl p-6 animate-fadeIn">
            <h3 className="font-display text-xl text-maroon mb-2">Choose Package</h3>
            <p className="text-xs text-brown/60 mb-5 font-serif italic">for {puja.name}</p>

            <div className="space-y-3">
              {(puja.prices || []).map((tier) => (
                <button
                  key={tier.label}
                  onClick={() => { setShowTierModal(false); setSelectedTier(tier); }}
                  className="w-full flex items-center justify-between rounded-xl border border-gold/40 bg-cream hover:border-saffron hover:bg-saffron/5 p-4 text-left transition-all"
                >
                  <span className="font-bold text-maroon">{tier.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-saffron text-lg">₹{tier.price.toLocaleString("en-IN")}</span>
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-saffron text-white">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setShowTierModal(false)}
              className="mt-4 w-full text-center text-sm text-brown/60 hover:text-maroon transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Action Choice Modal (Add to Cart vs Buy Now) ── */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTier(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-ivory shadow-2xl p-6 animate-fadeIn">
            {/* Selected package summary */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-saffron to-maroon shadow-lg">
                <span className="text-2xl">🪔</span>
              </div>
              <h3 className="font-display text-lg text-maroon">{puja.name}</h3>
              <div className="mt-2 inline-block rounded-full bg-gold/15 border border-gold/40 px-4 py-1.5">
                <span className="font-bold text-maroon text-sm">{selectedTier.label}</span>
                <span className="mx-2 text-gold/60">•</span>
                <span className="font-bold text-saffron text-lg">₹{selectedTier.price.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleAdd(selectedTier, true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-4 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5"
              >
                Buy Now → Proceed to Payment
              </button>

              <button
                onClick={() => handleAdd(selectedTier, false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-gold/50 bg-cream py-3.5 text-[14px] font-bold text-maroon transition-all hover:bg-gold/10 hover:border-saffron"
              >
                <ShoppingCart size={16} className="text-saffron" /> Add to Cart
              </button>
            </div>

            <button onClick={() => setSelectedTier(null)}
              className="mt-4 w-full text-center text-sm text-brown/60 hover:text-maroon transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default PujaDetail;

