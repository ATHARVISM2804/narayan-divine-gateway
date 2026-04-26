import { useState } from "react";
import { Star, Clock, Award } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import imgGanesh from "@/assets/puja-ganesh.jpg";
import imgLakshmi from "@/assets/puja-lakshmi.jpg";
import imgShiva from "@/assets/puja-shiva.jpg";
import imgVishnu from "@/assets/puja-vishnu.jpg";
import imgNavgraha from "@/assets/puja-navgraha.jpg";
import imgDurga from "@/assets/puja-durga.jpg";

const pujas = [
  { id: 1, name: "Ganesh Puja", deity: "Ganesh", purpose: "For Prosperity & New Beginnings", price: 1100, reviews: 124, badge: "POPULAR", image: imgGanesh, duration: "90 min" },
  { id: 2, name: "Lakshmi Puja", deity: "Lakshmi", purpose: "For Wealth & Abundance", price: 2100, reviews: 98, badge: "SPECIAL", image: imgLakshmi, duration: "2 hrs" },
  { id: 3, name: "Maha Rudrabhishek", deity: "Shiva", purpose: "For Health & Protection", price: 5100, reviews: 212, badge: "PREMIUM", image: imgShiva, duration: "3 hrs" },
  { id: 4, name: "Satyanarayan Puja", deity: "Vishnu", purpose: "For Peace & Blessings", price: 1500, reviews: 156, badge: "POPULAR", image: imgVishnu, duration: "2 hrs" },
  { id: 5, name: "Navgraha Shanti", deity: "Navgraha", purpose: "For Career & Remedies", price: 3100, reviews: 78, badge: "SPECIAL", image: imgNavgraha, duration: "2.5 hrs" },
  { id: 6, name: "Durga Saptashati", deity: "Durga", purpose: "For Protection & Victory", price: 4100, reviews: 142, badge: "PREMIUM", image: imgDurga, duration: "3 hrs" },
];

const filters = ["All", "Ganesh", "Lakshmi", "Shiva", "Vishnu", "Durga", "Navgraha"];

const FeaturedPujas = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? pujas : pujas.filter((p) => p.deity === active);

  return (
    <section className="relative texture-parchment py-20">
      {/* decorative top border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="container">
        <SectionHeading
          title="Sacred Pujas for Every Occasion"
          subtitle="Performed by verified pandits at partnered temples — ancient rituals delivered with modern care"
        />

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                active === f
                  ? "bg-sacred text-white shadow-md scale-105"
                  : "border border-gold/60 bg-ivory text-maroon hover:bg-gold/20 hover:border-gold"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-gold/50 bg-ivory shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-saffron hover:shadow-sacred"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlay for badges legibility */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-maroon-deep/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-maroon-deep/85 to-transparent" />

                <span className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1 text-[10px] font-bold tracking-wider text-gold shadow-md">
                  ★ {p.badge}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-gold-grad px-3 py-1 text-[10px] font-bold text-maroon shadow-md">
                  {p.deity}
                </span>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-cream">
                  <Clock size={12} className="text-gold" /> {p.duration}
                  <span className="mx-1 text-gold/50">•</span>
                  <Award size={12} className="text-gold" /> Certified Pandits
                </div>
              </div>

              {/* Body */}
              <div className="space-y-3 p-5">
                <div>
                  <h3 className="font-display text-xl text-maroon">{p.name}</h3>
                  <p className="font-serif italic text-sm text-brown/70">{p.purpose}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-brown/70">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="hsl(var(--gold))" stroke="hsl(var(--gold))" />
                  ))}
                  <span className="ml-1 font-medium">4.9 ({p.reviews} reviews)</span>
                </div>
                <div className="flex items-center justify-between border-t border-gold/30 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-brown/50">Starting from</p>
                    <span className="font-display text-xl font-semibold text-saffron">₹{p.price.toLocaleString("en-IN")}</span>
                  </div>
                  <button className="rounded-full bg-sacred px-5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:shadow-gold-glow">
                    Book Now →
                  </button>
                </div>
              </div>

              {/* corner ornament */}
              <svg
                viewBox="0 0 40 40"
                className="pointer-events-none absolute right-2 bottom-2 h-8 w-8 text-gold/30"
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
          <button className="inline-flex items-center gap-2 rounded-full border-2 border-gold bg-ivory px-8 py-3 font-semibold text-maroon shadow-soft transition-all hover:bg-gold hover:shadow-gold-glow">
            View All Pujas →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPujas;
