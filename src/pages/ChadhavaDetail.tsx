import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCart } from "@/context/CartContext";
import { supabase, type Chadhava } from "@/lib/supabase";
import { ArrowLeft, Loader2, ShoppingCart, Check, Shield, MapPin, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const ChadhavaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { addItem } = useCart();

  const [chadhava, setChadhava] = useState<Chadhava | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [showAction, setShowAction] = useState(false);

  usePageTitle(chadhava ? `${chadhava.temple} — ${chadhava.item} — Narayan Kripa` : "Loading…");

  useEffect(() => {
    if (!id) return;
    supabase
      .from("chadhavas")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          nav("/chadhava", { replace: true });
          return;
        }
        setChadhava(data as Chadhava);
        setLoading(false);
      });
  }, [id, nav]);

  const handleAdd = (goToCheckout = false) => {
    if (!chadhava) return;
    const itemId = `chadhava-${chadhava.id}`;
    addItem({
      id: itemId,
      name: `${chadhava.temple} — ${chadhava.item}`,
      description: chadhava.temple,
      price: chadhava.price,
      category: "chadhava",
      image: chadhava.image_url || undefined,
    });
    setAdded(true);

    if (goToCheckout) {
      toast.success("Proceeding to payment…");
      nav("/checkout");
    } else {
      toast.success(`${chadhava.item} added to cart!`);
      setShowAction(false);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[60vh] bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-saffron" />
          <p className="text-brown/60 font-serif italic">Loading offering details…</p>
        </div>
      </main>
    );
  }

  if (!chadhava) return null;

  return (
    <main className="bg-background min-h-screen">
      {/* ── Hero / Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-maroon via-maroon-deep to-maroon">
        {chadhava.image_url && (
          <img src={chadhava.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/60 via-maroon-deep/80 to-maroon" />

        <div className="container relative py-10 md:py-14">
          <Link to="/chadhava" className="inline-flex items-center gap-2 text-gold/70 hover:text-gold text-sm mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to all Chadhava
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Image */}
            <div className="w-full md:w-80 lg:w-96 shrink-0 rounded-2xl overflow-hidden border-2 border-gold/30 shadow-2xl">
              {chadhava.image_url ? (
                <img src={chadhava.image_url} alt={chadhava.item} className="w-full h-56 md:h-64 object-cover" />
              ) : (
                <div className="w-full h-56 md:h-64 bg-gradient-to-br from-sacred/30 to-gold/20 grid place-items-center">
                  <span className="text-7xl drop-shadow-lg">🌺</span>
                </div>
              )}
            </div>

            {/* Title + Info */}
            <div className="flex-1">
              <span className="rounded-full bg-gold/20 border border-gold/40 px-3 py-1 text-xs font-bold text-gold inline-flex items-center gap-1 mb-3">
                <MapPin size={10} /> {chadhava.temple}
              </span>

              <h1 className="font-display text-3xl md:text-4xl text-gold leading-tight">{chadhava.item}</h1>

              <p className="mt-3 text-cream/70 text-sm font-serif italic">
                Sacred offering at {chadhava.temple}
              </p>

              {/* Price */}
              <div className="mt-6 flex items-end gap-2">
                <span className="font-sans text-4xl font-bold text-gold">
                  ₹{chadhava.price.toLocaleString("en-IN")}
                </span>
                <span className="text-cream/60 text-sm mb-1">per offering</span>
              </div>

              {/* CTA button */}
              <button
                onClick={() => setShowAction(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron to-yellow-500 px-8 py-4 text-[15px] font-bold text-white shadow-lg transition-all hover:shadow-gold-glow hover:-translate-y-0.5 group"
              >
                Offer Chadhava
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
                { icon: "🌺", text: "Authentic Temple Offering" },
                { icon: "🙏", text: "Verified Temple Priests" },
                { icon: "📦", text: "Prasad Home Delivery" },
                { icon: "📜", text: "Blessings Certificate" },
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
                  "Chadhava offered by verified temple priests at the sacred shrine",
                  "Sankalp taken in your name, gotra, and intention",
                  "Blessed prasad delivered to your doorstep",
                  "Photo/video proof of the offering ceremony",
                  "Personalized blessings certificate",
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
                  { step: "1", title: "Choose & Pay", desc: "Select your offering and complete secure payment" },
                  { step: "2", title: "Offering Made", desc: "Verified priests perform the chadhava at the temple" },
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

          {/* Right — Offering Card (sticky) */}
          <div className="h-fit sticky top-28 rounded-2xl border border-gold/60 bg-gradient-to-b from-ivory to-cream p-6 shadow-lg">
            <div className="text-center mb-5">
              <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-saffron/20 to-gold/20 border border-gold/30">
                <span className="text-3xl">🌺</span>
              </div>
              <h2 className="font-display text-lg text-maroon">{chadhava.item}</h2>
              <p className="text-xs text-brown/60 font-serif italic mt-1">{chadhava.temple}</p>
            </div>

            <div className="rounded-xl bg-gold/10 border border-gold/30 p-4 text-center mb-5">
              <p className="text-[10px] text-brown/50 uppercase tracking-wider font-medium">Offering Price</p>
              <p className="font-sans font-bold text-saffron text-3xl mt-1">₹{chadhava.price.toLocaleString("en-IN")}</p>
            </div>

            <button
              onClick={() => setShowAction(true)}
              className="w-full rounded-xl bg-gradient-to-r from-saffron to-maroon py-4 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5"
            >
              Offer Chadhava
            </button>

            <p className="mt-4 text-center text-[11px] text-brown/50 font-serif italic">
              🔒 Secure payment via Razorpay
            </p>
          </div>
        </div>
      </div>

      {/* ── Action Choice Modal (Add to Cart vs Buy Now) ── */}
      {showAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAction(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-ivory shadow-2xl p-6 animate-fadeIn">
            {/* Selected offering summary */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-saffron to-maroon shadow-lg">
                <span className="text-2xl">🌺</span>
              </div>
              <h3 className="font-display text-lg text-maroon">{chadhava.item}</h3>
              <p className="text-xs text-brown/60 mt-1">{chadhava.temple}</p>
              <div className="mt-2 inline-block rounded-full bg-gold/15 border border-gold/40 px-4 py-1.5">
                <span className="font-bold text-saffron text-lg">₹{chadhava.price.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleAdd(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-4 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5"
              >
                Buy Now → Proceed to Payment
              </button>

              <button
                onClick={() => handleAdd(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-gold/50 bg-cream py-3.5 text-[14px] font-bold text-maroon transition-all hover:bg-gold/10 hover:border-saffron"
              >
                <ShoppingCart size={16} className="text-saffron" /> Add to Cart
              </button>
            </div>

            <button onClick={() => setShowAction(false)}
              className="mt-4 w-full text-center text-sm text-brown/60 hover:text-maroon transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ChadhavaDetail;
