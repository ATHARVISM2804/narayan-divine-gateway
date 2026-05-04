import { useState, useEffect } from "react";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase, type Puja as PujaType } from "@/lib/supabase";
import PageHero from "@/components/PageHero";
import heroPuja from "@/assets/hero-puja-page.png";

const deities = ["All", "Vishnu", "Shiva", "Ganga", "Navgraha", "Ganesh", "Durga", "Lakshmi", "Hanuman", "Saraswati"];

const Puja = () => {
  usePageTitle("Sacred Pujas — Narayan Kripa");

  const [deity, setDeity] = useState("All");
  const [pujas, setPujas] = useState<PujaType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("pujas")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPujas(data as PujaType[]);
        setLoading(false);
      });
  }, []);

  const filtered = pujas.filter(
    (p) => deity === "All" || p.deity === deity
  );

  const Chip = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
    <button onClick={onClick} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${active ? "bg-saffron text-white shadow-md" : "border border-gold/50 bg-ivory text-maroon hover:bg-gold/20 hover:border-gold"}`}>
      {label}
    </button>
  );

  /* Loading skeleton */
  const Skeleton = () => (
    <div className="rounded-2xl border border-gold/30 bg-ivory overflow-hidden animate-pulse">
      <div className="h-36 bg-gold/10" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-gold/10 rounded" />
        <div className="h-3 w-1/2 bg-gold/10 rounded" />
        <div className="h-3 w-2/3 bg-gold/10 rounded" />
        <div className="h-32 bg-gold/10 rounded-xl mt-4" />
        <div className="h-10 bg-gold/10 rounded-full mt-4" />
      </div>
    </div>
  );

  return (
    <main>
      <PageHero title="Sacred Pujas for Every Need" subtitle="Verified pandits, authentic rituals, divine blessings" breadcrumb="Pujas" bgImage={heroPuja} />

      <section className="bg-background py-12">
        <div className="container grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit space-y-6 rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
            <div>
              <h4 className="mb-4 font-display text-lg text-maroon">By Deity</h4>
              <div className="flex flex-wrap gap-2.5">{deities.map((d) => <Chip key={d} active={deity === d} onClick={() => setDeity(d)} label={d} />)}</div>
            </div>
          </aside>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 items-start">
            {loading ? (
              <>
                <Skeleton /><Skeleton /><Skeleton />
              </>
            ) : filtered.length === 0 ? (
              <p className="col-span-full py-12 text-center text-brown/60">No pujas match your filters.</p>
            ) : filtered.map((p) => {
              const minPrice = Math.min(...(p.prices || []).map(t => t.price));
              return (
              <Link
                to={`/puja/${p.id}`}
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-gold/50 bg-ivory transition-all duration-500 hover:-translate-y-1.5 hover:border-saffron hover:shadow-sacred flex flex-col h-full shadow-soft"
              >
                <div className="relative grid h-44 place-items-center bg-gradient-to-br from-sacred/15 via-gold/15 to-transparent overflow-hidden border-b border-gold/30">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-30 mix-blend-multiply texture-parchment transition-transform duration-700 group-hover:scale-110"></div>
                      <div className="relative text-6xl drop-shadow-[0_0_15px_rgba(255,184,0,0.5)] transition-transform duration-500 group-hover:scale-110">🪔</div>
                    </>
                  )}
                  {/* Deity badge */}
                  <span className="absolute top-3 left-3 rounded-full bg-maroon/80 backdrop-blur px-3 py-1 text-[10px] font-bold text-gold">
                    {p.deity}
                  </span>
                  {p.featured && (
                    <span className="absolute top-3 right-3 rounded-full bg-saffron/90 px-2.5 py-1 text-[10px] font-bold text-white">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5 bg-gradient-to-b from-ivory to-cream/30">
                  <h3 className="font-display text-[20px] text-maroon leading-tight mb-3 drop-shadow-sm">{p.name}</h3>

                  <div className="flex flex-col gap-2 text-xs text-brown/90 font-medium">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-saffron" /> {p.date}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-saffron" /> {p.location}</span>
                  </div>

                  <div className="flex-1"></div>

                  {/* Starting price + tier count */}
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-brown/50 uppercase tracking-wider font-medium">Starting from</p>
                      <p className="font-sans font-bold text-saffron text-xl mt-0.5">₹{minPrice.toLocaleString("en-IN")}</p>
                    </div>
                    <span className="text-[11px] text-brown/50">{(p.prices || []).length} packages available</span>
                  </div>

                  <div className="mt-4 w-full text-center rounded-full bg-saffron group-hover:bg-maroon px-5 py-3.5 text-[15px] font-bold text-white shadow-md transition-all group-hover:shadow-gold-glow">
                    View Details →
                  </div>
                </div>
              </Link>
            );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Puja;
