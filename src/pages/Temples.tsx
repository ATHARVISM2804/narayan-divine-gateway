import { useState } from "react";
import { Search, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import heroTemples from "@/assets/hero-temples-page.png";
import imgShiva from "@/assets/puja-shiva.jpg";
import imgVishnu from "@/assets/puja-vishnu.jpg";
import imgGanesh from "@/assets/puja-ganesh.jpg";
import imgDurga from "@/assets/puja-durga.jpg";
import imgDarshan from "@/assets/hero-darshan.jpg";
import imgTemple from "@/assets/hero-temple.jpg";

const temples = [
  { name: "Kashi Vishwanath", state: "Uttar Pradesh", deity: "Shiva", timings: "4 AM – 11 PM", image: imgDarshan },
  { name: "Tirupati Balaji", state: "Andhra Pradesh", deity: "Vishnu", timings: "3 AM – 10 PM", image: imgVishnu },
  { name: "Siddhivinayak", state: "Maharashtra", deity: "Ganesh", timings: "5:30 AM – 9:30 PM", image: imgGanesh },
  { name: "Vaishno Devi", state: "Jammu & Kashmir", deity: "Durga", timings: "5 AM – 12 AM", image: imgDurga },
  { name: "Jagannath Puri", state: "Odisha", deity: "Vishnu", timings: "5 AM – 9 PM", image: imgTemple },
  { name: "Mahakaleshwar", state: "Madhya Pradesh", deity: "Shiva", timings: "4 AM – 11 PM", image: imgShiva },
];

const states = ["All", "Uttar Pradesh", "Maharashtra", "Andhra Pradesh", "Odisha", "Madhya Pradesh", "Jammu & Kashmir"];
const deities = ["All", "Shiva", "Vishnu", "Ganesh", "Durga"];

const Temples = () => {
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");
  const [deity, setDeity] = useState("All");

  const filtered = temples.filter(
    (t) =>
      t.name.toLowerCase().includes(q.toLowerCase()) &&
      (state === "All" || t.state === state) &&
      (deity === "All" || t.deity === deity)
  );

  usePageTitle("Sacred Temples of India — Narayan Kripa");

  return (
    <main>
      <PageHero title="Explore India's Most Sacred Temples" subtitle="From Himalayan shrines to coastal sanctums" breadcrumb="Temples" bgImage={heroTemples} />

      <section className="bg-background py-12">
        <div className="container">
          <div className="mx-auto mb-8 flex max-w-4xl flex-col gap-3 rounded-2xl border border-gold/50 bg-ivory p-4 md:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-gold/60 bg-cream px-4 py-2">
              <Search size={16} className="text-saffron" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search temple…" className="w-full bg-transparent text-sm outline-none placeholder:text-brown/40" />
            </div>
            <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-full border border-gold/60 bg-cream px-4 py-2 text-sm text-maroon outline-none">
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={deity} onChange={(e) => setDeity(e.target.value)} className="rounded-full border border-gold/60 bg-cream px-4 py-2 text-sm text-maroon outline-none">
              {deities.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>



          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <article key={t.name} className="group overflow-hidden rounded-2xl border border-gold/60 bg-ivory transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-48 overflow-hidden">
                  <img src={t.image} alt={t.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 font-display text-xl text-white drop-shadow-md">{t.name}</span>
                </div>
                <div className="space-y-3 p-4">

                  <div className="flex flex-wrap gap-2 text-[11px] text-brown/70">
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5"><MapPin size={10} /> {t.state}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5">{t.deity}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5"><Clock size={10} /> {t.timings}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link to="/chadhava" className="flex-1 text-center rounded-full bg-saffron px-3 py-1.5 text-xs font-semibold text-white hover:bg-maroon transition-colors">Book Chadhava</Link>
                    <Link to="/contact" className="flex-1 text-center rounded-full border border-gold px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-gold/20">Details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Spotlight */}
      <section className="bg-cream py-16">
        <div className="container">
          <SectionHeading title="Featured Temple Spotlight" />
          <div className="grid gap-6 overflow-hidden rounded-3xl border border-gold/60 bg-ivory md:grid-cols-2">
            <div className="relative overflow-hidden h-64 md:h-full min-h-[300px]">
               <img src={imgDarshan} alt="Kashi Vishwanath" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/60 via-maroon-deep/20 to-transparent" />
            </div>
            <div className="p-8 md:p-10">
              <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold text-maroon">JYOTIRLINGA</span>
              <h3 className="mt-3 font-display text-3xl text-maroon">Kashi Vishwanath</h3>
              <p className="mt-2 text-sm text-brown/70">Varanasi, Uttar Pradesh</p>
              <p className="mt-4 text-brown/80">
                One of the twelve sacred Jyotirlingas, the temple stands on the western bank of the Ganga and has been a beacon of Shaivism for millennia.
              </p>
              <div className="mt-6 flex gap-3">
                <Link to="/chadhava" className="inline-block text-center rounded-full bg-saffron px-5 py-2 text-sm font-semibold text-white hover:bg-maroon transition-colors">Book Chadhava</Link>
                <Link to="/contact" className="inline-block text-center rounded-full border border-gold px-5 py-2 text-sm font-semibold text-maroon hover:bg-gold/20">View Details</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Temples;
