import { useState, useEffect } from "react";
import { MapPin, Calendar, ShoppingCart, Check } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import { useCart } from "@/context/CartContext";
import { supabase, type Puja } from "@/lib/supabase";

const FeaturedPujas = () => {
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("pujas")
      .select("*")
      .eq("status", "active")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setPujas(data as Puja[]);
        setLoading(false);
      });
  }, []);

  /* Loading skeleton */
  const Skeleton = () => (
    <div className="rounded-2xl border border-gold/30 bg-ivory overflow-hidden animate-pulse">
      <div className="h-56 bg-gold/10" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-gold/10 rounded" />
        <div className="h-3 w-1/2 bg-gold/10 rounded" />
        <div className="h-36 bg-gold/10 rounded-xl mt-4" />
        <div className="h-11 bg-gold/10 rounded-full mt-4" />
      </div>
    </div>
  );

  if (!loading && pujas.length === 0) return null;

  return (
    <section className="relative texture-parchment py-20">
      {/* decorative top border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="container">
        <SectionHeading
          title="Sacred Pujas for Every Occasion"
          subtitle="Performed by verified pandits at partnered temples — ancient rituals delivered with modern care"
        />

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          {loading ? (
            <><Skeleton /><Skeleton /><Skeleton /></>
          ) : pujas.map((p) => (
            <article
              key={p.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-gold/50 bg-ivory shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-saffron hover:shadow-sacred"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-saffron/20 via-gold/20 to-maroon/10 flex items-center justify-center text-7xl">🪔</div>
                )}
                {/* Gradient overlay for badges legibility */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-maroon-deep/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-maroon-deep/85 to-transparent" />

                <span className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1 text-[10px] font-bold tracking-wider text-gold shadow-md">
                  ★ SPECIAL
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-gold-grad px-3 py-1 text-[10px] font-bold text-maroon shadow-md">
                  {p.deity}
                </span>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-cream drop-shadow-md">
                  <span className="flex items-center gap-1.5 font-medium"><Calendar size={13} className="text-gold" /> {p.date}</span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-5 bg-gradient-to-b from-ivory to-cream/30">
                <div>
                  <h3 className="font-display text-[22px] text-maroon leading-tight mb-2 drop-shadow-sm">{p.name}</h3>
                  <p className="flex items-center gap-1.5 font-serif italic text-sm text-brown/90 font-medium">
                    <MapPin size={15} className="text-saffron" /> {p.location}
                  </p>
                </div>

                <div className="flex-1"></div>

                <div className="my-5 overflow-hidden rounded-xl border border-gold/40 bg-gradient-to-b from-cream to-ivory shadow-sm">
                  <div className="bg-gradient-to-r from-gold/10 via-saffron/10 to-gold/10 py-2 px-3 border-b border-gold/30">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-maroon text-center">Available Packages</h4>
                  </div>
                  <div className="p-3.5 flex flex-col gap-2.5">
                    {(p.prices || []).map((tier: { label: string; price: number }, idx: number) => {
                      const itemId = `puja-${p.id}-${tier.label}`;
                      const justAdded = addedId === itemId;
                      return (
                      <div key={tier.label} className={`flex items-center justify-between text-sm ${idx !== (p.prices?.length || 0) - 1 ? 'border-b border-gold/20 pb-2.5' : ''}`}>
                        <span className="text-maroon font-bold tracking-wide">{tier.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-saffron text-base tracking-wide">₹{tier.price.toLocaleString("en-IN")}</span>
                          <button
                            onClick={() => {
                              addItem({
                                id: itemId,
                                name: `${p.name} (${tier.label})`,
                                description: `${p.date} • ${p.location}`,
                                price: tier.price,
                                category: "puja",
                              });
                              setAddedId(itemId);
                              setTimeout(() => setAddedId(null), 1500);
                            }}
                            className={`grid h-7 w-7 place-items-center rounded-full transition-all ${
                              justAdded
                                ? "bg-green-500 text-white scale-110"
                                : "bg-saffron/15 text-saffron hover:bg-saffron hover:text-white"
                            }`}
                            aria-label={`Add ${tier.label} to cart`}
                          >
                            {justAdded ? <Check size={14} /> : <ShoppingCart size={13} />}
                          </button>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>

                <Link to="/cart" className="w-full text-center inline-block rounded-full bg-saffron hover:bg-maroon px-5 py-3.5 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow mt-auto hover:-translate-y-0.5">
                  View Cart →
                </Link>
              </div>

              {/* corner ornament */}
              <svg
                viewBox="0 0 40 40"
                className="pointer-events-none absolute right-2 bottom-2 h-8 w-8 text-gold/20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
              >
                <path d="M2 38 L2 20 Q 2 2 20 2 L38 2" />
                <circle cx="6" cy="34" r="1.5" fill="currentColor" />
              </svg>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/puja" className="inline-flex items-center gap-2 rounded-full border-2 border-gold bg-ivory px-8 py-3 font-semibold text-maroon shadow-soft transition-all hover:bg-gold hover:shadow-gold-glow">
            View All Pujas →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPujas;
