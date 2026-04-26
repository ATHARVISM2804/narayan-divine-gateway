import { useState } from "react";
import { Star } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const pujas = [
  { id: 1, name: "Ganesh Puja", deity: "Ganesh", purpose: "For Prosperity & New Beginnings", price: 1100, reviews: 124, badge: "POPULAR", gradient: "from-orange-200 to-amber-300" },
  { id: 2, name: "Lakshmi Puja", deity: "Lakshmi", purpose: "For Wealth & Abundance", price: 2100, reviews: 98, badge: "SPECIAL", gradient: "from-yellow-200 to-amber-200" },
  { id: 3, name: "Maha Rudrabhishek", deity: "Shiva", purpose: "For Health & Protection", price: 5100, reviews: 212, badge: "PREMIUM", gradient: "from-blue-200 to-indigo-300" },
  { id: 4, name: "Satyanarayan Puja", deity: "Vishnu", purpose: "For Peace & Blessings", price: 1500, reviews: 156, badge: "POPULAR", gradient: "from-amber-200 to-orange-300" },
  { id: 5, name: "Navgraha Shanti", deity: "Navgraha", purpose: "For Career & Remedies", price: 3100, reviews: 78, badge: "SPECIAL", gradient: "from-purple-200 to-pink-300" },
  { id: 6, name: "Durga Saptashati", deity: "Durga", purpose: "For Protection & Victory", price: 4100, reviews: 142, badge: "PREMIUM", gradient: "from-red-200 to-rose-300" },
];

const filters = ["All", "Ganesh", "Lakshmi", "Shiva", "Vishnu", "Durga", "Navgraha"];

const FeaturedPujas = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? pujas : pujas.filter((p) => p.deity === active);

  return (
    <section className="bg-background py-16">
      <div className="container">
        <SectionHeading
          title="Sacred Pujas for Every Occasion"
          subtitle="Performed by verified pandits at partnered temples"
        />

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                active === f
                  ? "bg-saffron text-white shadow-md"
                  : "border border-gold bg-cream text-maroon hover:bg-gold/20"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-gold/60 bg-ivory transition-all duration-300 hover:-translate-y-1 hover:border-saffron hover:shadow-xl hover:shadow-gold/20"
            >
              <div className={`relative h-48 bg-gradient-to-br ${p.gradient}`}>
                <div className="absolute inset-0 grid place-items-center text-7xl opacity-50">🪔</div>
                <span className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1 text-[10px] font-semibold tracking-wider text-gold">
                  {p.badge}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold text-maroon">
                  {p.deity}
                </span>
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <h3 className="font-display text-lg text-maroon">{p.name}</h3>
                  <p className="text-xs text-brown/60">{p.purpose}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-brown/70">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill="hsl(var(--gold))" stroke="hsl(var(--gold))" />
                  ))}
                  <span className="ml-1">({p.reviews} reviews)</span>
                </div>
                <div className="flex items-center justify-between border-t border-gold/30 pt-3">
                  <span className="font-display font-semibold text-saffron">Starting ₹{p.price.toLocaleString("en-IN")}</span>
                  <button className="text-sm font-semibold text-maroon transition-colors hover:text-saffron">
                    Book Now →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPujas;
