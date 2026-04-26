import { useState } from "react";
import { Star, Clock, Award } from "lucide-react";
import PageHero from "@/components/PageHero";

const allPujas = [
  { name: "Ganesh Puja", deity: "Ganesh", purpose: "Prosperity", price: 1100, dur: "2 hrs", lang: "Hindi" },
  { name: "Lakshmi Puja", deity: "Lakshmi", purpose: "Prosperity", price: 2100, dur: "3 hrs", lang: "Sanskrit" },
  { name: "Maha Rudrabhishek", deity: "Shiva", purpose: "Health", price: 5100, dur: "4 hrs", lang: "Sanskrit" },
  { name: "Satyanarayan Puja", deity: "Vishnu", purpose: "Protection", price: 1500, dur: "2.5 hrs", lang: "Hindi" },
  { name: "Navgraha Shanti", deity: "Navgraha", purpose: "Career", price: 3100, dur: "3 hrs", lang: "Sanskrit" },
  { name: "Durga Saptashati", deity: "Durga", purpose: "Protection", price: 4100, dur: "5 hrs", lang: "Sanskrit" },
  { name: "Hanuman Chalisa Path", deity: "Hanuman", purpose: "Protection", price: 700, dur: "1 hr", lang: "Hindi" },
  { name: "Shiv Mahimna Stotra", deity: "Shiva", purpose: "Health", price: 1800, dur: "2 hrs", lang: "Sanskrit" },
  { name: "Vishnu Sahasranama", deity: "Vishnu", purpose: "Marriage", price: 2500, dur: "3 hrs", lang: "Sanskrit" },
  { name: "Sundarkand Path", deity: "Hanuman", purpose: "Education", price: 1100, dur: "2 hrs", lang: "Hindi" },
  { name: "Kaal Sarp Dosh Puja", deity: "Navgraha", purpose: "Protection", price: 6100, dur: "5 hrs", lang: "Sanskrit" },
  { name: "Mangal Dosh Nivaran", deity: "Navgraha", purpose: "Marriage", price: 3500, dur: "3 hrs", lang: "Sanskrit" },
];

const deities = ["All", "Ganesh", "Shiva", "Vishnu", "Durga", "Lakshmi", "Hanuman", "Navgraha"];
const purposes = ["All", "Prosperity", "Health", "Marriage", "Protection", "Career", "Education"];
const languages = ["All", "Hindi", "Sanskrit"];

const Puja = () => {
  const [deity, setDeity] = useState("All");
  const [purpose, setPurpose] = useState("All");
  const [lang, setLang] = useState("All");
  const [maxPrice, setMaxPrice] = useState(25000);

  const filtered = allPujas.filter(
    (p) =>
      (deity === "All" || p.deity === deity) &&
      (purpose === "All" || p.purpose === purpose) &&
      (lang === "All" || p.lang === lang) &&
      p.price <= maxPrice
  );

  const Chip = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
    <button onClick={onClick} className={`rounded-full px-3 py-1 text-xs ${active ? "bg-saffron text-white" : "border border-gold bg-ivory text-maroon hover:bg-gold/20"}`}>
      {label}
    </button>
  );

  return (
    <main>
      <title>Sacred Pujas — Narayan Kripa</title>
      <meta name="description" content="Browse 50+ Vedic pujas by deity, purpose, language and price. Performed by certified pandits at sacred temples across India." />
      <PageHero title="Sacred Pujas for Every Need" subtitle="Verified pandits, authentic rituals, divine blessings" breadcrumb="Pujas" />

      <section className="bg-background py-12">
        <div className="container grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit space-y-6 rounded-2xl border border-gold/40 bg-ivory p-5">
            <div>
              <h4 className="mb-3 font-display text-maroon">By Deity</h4>
              <div className="flex flex-wrap gap-2">{deities.map((d) => <Chip key={d} active={deity === d} onClick={() => setDeity(d)} label={d} />)}</div>
            </div>
            <div>
              <h4 className="mb-3 font-display text-maroon">By Purpose</h4>
              <div className="flex flex-wrap gap-2">{purposes.map((d) => <Chip key={d} active={purpose === d} onClick={() => setPurpose(d)} label={d} />)}</div>
            </div>
            <div>
              <h4 className="mb-3 font-display text-maroon">Price Range</h4>
              <input type="range" min={500} max={25000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-saffron" />
              <p className="mt-1 text-xs text-brown/70">Up to ₹{maxPrice.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <h4 className="mb-3 font-display text-maroon">Language</h4>
              <div className="flex flex-wrap gap-2">{languages.map((d) => <Chip key={d} active={lang === d} onClick={() => setLang(d)} label={d} />)}</div>
            </div>
          </aside>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <article key={p.name} className="overflow-hidden rounded-2xl border border-gold/60 bg-ivory transition-all hover:-translate-y-1 hover:border-saffron hover:shadow-xl">
                <div className="grid h-40 place-items-center bg-gradient-to-br from-saffron/30 to-gold/20 text-6xl">🪔</div>
                <div className="space-y-2 p-4">
                  <h3 className="font-display text-lg text-maroon">{p.name}</h3>
                  <p className="text-xs text-brown/60">For {p.purpose} • {p.lang}</p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-maroon"><Clock size={10} /> {p.dur}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-maroon"><Award size={10} /> Certified Pandit</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-brown/70">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill="hsl(var(--gold))" stroke="hsl(var(--gold))" />)}
                    <span className="ml-1">(120+)</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gold/30 pt-2">
                    <span className="font-display font-semibold text-saffron">₹{p.price.toLocaleString("en-IN")}</span>
                    <button className="text-sm font-semibold text-maroon hover:text-saffron">Book →</button>
                  </div>
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
