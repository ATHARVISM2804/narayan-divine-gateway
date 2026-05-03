import { useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";
import heroPuja from "@/assets/hero-puja-page.png";

const allPujas = [
  { 
    id: 1,
    name: "Ekadashi Special Badrinarayan Rakshaya Ka Watch", 
    deity: "Vishnu", 
    purpose: "Special", 
    price: 951, 
    dur: "Special", 
    lang: "Hindi",
    location: "Badrinath Dham Shetra",
    date: "13 May",
    prices: [
      { label: "Single", price: 951 },
      { label: "Couple", price: 1551 },
      { label: "4 Family", price: 2551 },
      { label: "6 Members", price: 3551 }
    ]
  },
  { 
    id: 2,
    name: "Shani Jayanti Special Nav Greh Shanti Pooja & Tel Abhishek", 
    deity: "Navgraha", 
    purpose: "Special", 
    price: 951, 
    dur: "Special", 
    lang: "Hindi",
    location: "Nav Greh Mandir Haridwar",
    date: "16 May",
    prices: [
      { label: "Single", price: 951 },
      { label: "Couple", price: 1551 },
      { label: "4 Family", price: 2551 },
      { label: "6 Members", price: 3551 }
    ]
  },
  { 
    id: 3,
    name: "Ganga Dussehra Special Maa Ganga Abhishek & Deep Daan", 
    deity: "Ganga", 
    purpose: "Special", 
    price: 951, 
    dur: "Special", 
    lang: "Hindi",
    location: "Har Ki Pauri",
    date: "25 May",
    prices: [
      { label: "Single", price: 951 },
      { label: "Couple", price: 1551 },
      { label: "4 Family", price: 2551 },
      { label: "6 Members", price: 3551 }
    ]
  },
];

const deities = ["All", "Vishnu", "Navgraha", "Ganga"];

const Puja = () => {
  usePageTitle("Sacred Pujas — Narayan Kripa");

  const [deity, setDeity] = useState("All");

  const filtered = allPujas.filter(
    (p) => deity === "All" || p.deity === deity
  );

  const Chip = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
    <button onClick={onClick} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${active ? "bg-saffron text-white shadow-md" : "border border-gold/50 bg-ivory text-maroon hover:bg-gold/20 hover:border-gold"}`}>
      {label}
    </button>
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
            {filtered.map((p) => (
              <article key={p.id} className="group overflow-hidden rounded-2xl border border-gold/50 bg-ivory transition-all duration-500 hover:-translate-y-1.5 hover:border-saffron hover:shadow-sacred flex flex-col h-full shadow-soft">
                <div className="relative grid h-36 place-items-center bg-gradient-to-br from-sacred/15 via-gold/15 to-transparent overflow-hidden border-b border-gold/30">
                  <div className="absolute inset-0 opacity-30 mix-blend-multiply texture-parchment transition-transform duration-700 group-hover:scale-110"></div>
                  <div className="relative text-6xl drop-shadow-[0_0_15px_rgba(255,184,0,0.5)] transition-transform duration-500 group-hover:scale-110">🪔</div>
                </div>
                
                <div className="flex flex-col flex-1 p-5 bg-gradient-to-b from-ivory to-cream/30">
                  <h3 className="font-display text-[20px] text-maroon leading-tight mb-3 drop-shadow-sm">{p.name}</h3>
                  
                  <div className="flex flex-col gap-2 text-xs text-brown/90 font-medium">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-saffron" /> {p.date}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-saffron" /> {p.location}</span>
                  </div>

                  <div className="flex-1"></div>

                  <div className="my-5 overflow-hidden rounded-xl border border-gold/40 bg-gradient-to-b from-cream to-ivory shadow-sm">
                    <div className="bg-gradient-to-r from-gold/10 via-saffron/10 to-gold/10 py-2 px-3 border-b border-gold/30">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-maroon text-center">Available Packages</h4>
                    </div>
                    <div className="p-3.5 flex flex-col gap-2.5">
                      {p.prices.map((tier, idx) => (
                        <div key={tier.label} className={`flex items-center justify-between text-sm ${idx !== p.prices.length - 1 ? 'border-b border-gold/20 pb-2.5' : ''}`}>
                          <span className="text-maroon font-bold tracking-wide">{tier.label}</span>
                          <span className="font-sans font-bold text-saffron text-base tracking-wide">₹{tier.price.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full rounded-full bg-saffron hover:bg-maroon px-5 py-3.5 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow mt-auto hover:-translate-y-0.5">
                    Book Now
                  </button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-12 text-center text-brown/60">No pujas match your filters.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Puja;
