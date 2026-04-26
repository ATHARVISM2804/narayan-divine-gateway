import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const items = [
  { name: "Aarti Sharma", city: "Delhi", initials: "AS", quote: "I booked the Maha Rudrabhishek for my father's health and the entire experience was transcendent. The pandits were learned, the ritual was conducted with utmost devotion, and we received the prasad within days.", rating: 5 },
  { name: "Ramesh Iyer", city: "Bengaluru", initials: "RI", quote: "Narayan Kripa made it possible for me to offer chadhava at Tirupati despite living far away. Watching the live darshan brought tears to my eyes. Truly a blessing for our digital age.", rating: 5 },
  { name: "Priya Verma", city: "Mumbai", initials: "PV", quote: "The kundali consultation with their pandit ji helped my family understand grah-doshas and the right remedies. We performed the Navgraha Shanti and saw real positive changes within months.", rating: 5 },
];

const mini = [
  { name: "Suresh K.", city: "Pune", quote: "Beautifully conducted Satyanarayan puja. Felt the divine presence." },
  { name: "Meera R.", city: "Hyderabad", quote: "The pandits are extremely knowledgeable. Highly recommended." },
  { name: "Anil S.", city: "Kolkata", quote: "Live darshan from Kashi feels like being there in person." },
];

const Testimonials = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((c) => (c + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, []);
  const t = items[i];

  return (
    <section className="bg-maroon py-16 text-cream">
      <div className="container">
        <SectionHeading title="Blessings Received. Lives Transformed." light />

        <div className="relative mx-auto mt-10 max-w-3xl rounded-2xl border border-gold/30 bg-maroon-deep/40 p-8 md:p-12">
          <span className="absolute left-4 top-2 font-display text-7xl leading-none text-gold/30">"</span>
          <blockquote key={i} className="font-serif text-xl italic text-cream md:text-2xl animate-fadeIn">
            {t.quote}
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gold font-semibold text-maroon">
              {t.initials}
            </div>
            <div>
              <p className="font-semibold text-gold">{t.name}</p>
              <p className="text-xs text-cream/60">{t.city}</p>
            </div>
            <div className="ml-auto flex">
              {Array.from({ length: t.rating }).map((_, k) => (
                <Star key={k} size={16} fill="hsl(var(--gold))" stroke="hsl(var(--gold))" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Testimonial ${k + 1}`}
              className={`h-2.5 rounded-full transition-all ${k === i ? "w-8 bg-gold" : "w-2.5 border border-gold"}`}
            />
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {mini.map((m) => (
            <div key={m.name} className="rounded-xl border border-gold/30 bg-ivory p-4 text-brown">
              <p className="text-sm italic">"{m.quote}"</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-maroon">{m.name}, <span className="text-brown/60">{m.city}</span></span>
                <span className="flex">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="hsl(var(--gold))" stroke="hsl(var(--gold))" />)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
