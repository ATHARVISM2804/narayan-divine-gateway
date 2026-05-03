import { MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import imgLakshmi from "@/assets/puja-lakshmi.jpg";
import imgVishnu from "@/assets/puja-vishnu.jpg";
import imgNavgraha from "@/assets/puja-navgraha.jpg";

const pujas = [
  { 
    id: 1,
    name: "Ekadashi Special Badrinarayan Rakshaya Ka Watch", 
    deity: "Vishnu", 
    purpose: "Badrinath Dham Shetra", 
    price: 951, 
    badge: "SPECIAL", 
    image: imgVishnu, 
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
    purpose: "Nav Greh Mandir Haridwar", 
    price: 951, 
    badge: "SPECIAL", 
    image: imgNavgraha, 
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
    purpose: "Har Ki Pauri", 
    price: 951, 
    badge: "SPECIAL", 
    image: imgLakshmi, 
    date: "25 May",
    prices: [
      { label: "Single", price: 951 },
      { label: "Couple", price: 1551 },
      { label: "4 Family", price: 2551 },
      { label: "6 Members", price: 3551 }
    ]
  },
];

const FeaturedPujas = () => {
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
          {pujas.map((p) => (
            <article
              key={p.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-gold/50 bg-ivory shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-saffron hover:shadow-sacred"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden shrink-0">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-cream drop-shadow-md">
                  <span className="flex items-center gap-1.5 font-medium"><Calendar size={13} className="text-gold" /> {p.date}</span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-5 bg-gradient-to-b from-ivory to-cream/30">
                <div>
                  <h3 className="font-display text-[22px] text-maroon leading-tight mb-2 drop-shadow-sm">{p.name}</h3>
                  <p className="flex items-center gap-1.5 font-serif italic text-sm text-brown/90 font-medium">
                    <MapPin size={15} className="text-saffron" /> {p.purpose}
                  </p>
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

                <Link to="/contact" className="w-full text-center inline-block rounded-full bg-saffron hover:bg-maroon px-5 py-3.5 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow mt-auto hover:-translate-y-0.5">
                  Book Now →
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
