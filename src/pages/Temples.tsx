import { useState } from "react";
import { Search, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import heroTemples from "@/assets/hero-temples-page.png";
import { useLanguage } from "@/context/LanguageContext";
import imgShiva from "@/assets/puja-shiva.jpg";
import imgVishnu from "@/assets/puja-vishnu.jpg";
import imgGanesh from "@/assets/puja-ganesh.jpg";
import imgDurga from "@/assets/puja-durga.jpg";
import imgDarshan from "@/assets/hero-darshan.jpg";
import imgTemple from "@/assets/hero-temple.jpg";

const temples = [
  { name: "Kashi Vishwanath", name_hi: "काशी विश्वनाथ", state: "Uttar Pradesh", state_hi: "उत्तर प्रदेश", deity: "Shiva", deity_hi: "शिव", timings: "4 AM – 11 PM", image: imgDarshan },
  { name: "Tirupati Balaji", name_hi: "तिरुपति बालाजी", state: "Andhra Pradesh", state_hi: "आंध्र प्रदेश", deity: "Vishnu", deity_hi: "विष्णु", timings: "3 AM – 10 PM", image: imgVishnu },
  { name: "Siddhivinayak", name_hi: "सिद्धिविनायक", state: "Maharashtra", state_hi: "महाराष्ट्र", deity: "Ganesh", deity_hi: "गणेश", timings: "5:30 AM – 9:30 PM", image: imgGanesh },
  { name: "Vaishno Devi", name_hi: "वैष्णो देवी", state: "Jammu & Kashmir", state_hi: "जम्मू और कश्मीर", deity: "Durga", deity_hi: "दुर्गा", timings: "5 AM – 12 AM", image: imgDurga },
  { name: "Jagannath Puri", name_hi: "जगन्नाथ पुरी", state: "Odisha", state_hi: "ओडिशा", deity: "Vishnu", deity_hi: "विष्णु", timings: "5 AM – 9 PM", image: imgTemple },
  { name: "Mahakaleshwar", name_hi: "महाकालेश्वर", state: "Madhya Pradesh", state_hi: "मध्य प्रदेश", deity: "Shiva", deity_hi: "शिव", timings: "4 AM – 11 PM", image: imgShiva },
];

const states = ["All", "Uttar Pradesh", "Maharashtra", "Andhra Pradesh", "Odisha", "Madhya Pradesh", "Jammu & Kashmir"];
const deities = ["All", "Shiva", "Vishnu", "Ganesh", "Durga"];

const Temples = () => {
  const { t, lang } = useLanguage();
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");
  const [deity, setDeity] = useState("All");

  const filtered = temples.filter(
    (t) =>
      (t.name.toLowerCase().includes(q.toLowerCase()) || t.name_hi.includes(q)) &&
      (state === "All" || t.state === state) &&
      (deity === "All" || t.deity === deity)
  );

  usePageTitle("Sacred Temples of India — Narayan Kripa");

  return (
    <main>
      <PageHero title={t("tmp_hero")} subtitle={t("tmp_hero_sub")} breadcrumb={t("tmp_breadcrumb")} bgImage={heroTemples} />

      <section className="bg-background py-12">
        <div className="container">
          <div className="mx-auto mb-8 flex max-w-4xl flex-col gap-3 rounded-2xl border border-gold/50 bg-ivory p-4 md:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-gold/60 bg-cream px-4 py-2">
              <Search size={16} className="text-saffron" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("tmp_search")} className="w-full bg-transparent text-sm outline-none placeholder:text-brown/40" />
            </div>
            <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-full border border-gold/60 bg-cream px-4 py-2 text-sm text-maroon outline-none">
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={deity} onChange={(e) => setDeity(e.target.value)} className="rounded-full border border-gold/60 bg-cream px-4 py-2 text-sm text-maroon outline-none">
              {deities.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>



          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tp) => {
              const dName = lang === "hi" ? tp.name_hi : tp.name;
              const dState = lang === "hi" ? tp.state_hi : tp.state;
              const dDeity = lang === "hi" ? tp.deity_hi : tp.deity;
              return (
              <article key={tp.name} className="group overflow-hidden rounded-2xl border border-gold/60 bg-ivory transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-48 overflow-hidden">
                  <img src={tp.image} alt={dName} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 font-display text-xl text-white drop-shadow-md">{dName}</span>
                </div>
                <div className="space-y-3 p-4">

                  <div className="flex flex-wrap gap-2 text-[11px] text-brown/70">
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5"><MapPin size={10} /> {dState}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5">{dDeity}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5"><Clock size={10} /> {tp.timings}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link to="/chadhava" className="flex-1 text-center rounded-full bg-saffron px-3 py-1.5 text-xs font-semibold text-white hover:bg-maroon transition-colors">{t("tmp_book_chadhava")}</Link>
                    <Link to="/contact" className="flex-1 text-center rounded-full border border-gold px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-gold/20">{t("tmp_details")}</Link>
                  </div>
                </div>
              </article>
            )})}

          </div>
        </div>
      </section>

      {/* Spotlight */}
      <section className="bg-cream py-16">
        <div className="container">
          <SectionHeading title={t("tmp_spot_title")} />
          <div className="grid gap-6 overflow-hidden rounded-3xl border border-gold/60 bg-ivory md:grid-cols-2">
            <div className="relative overflow-hidden h-64 md:h-full min-h-[300px]">
               <img src={imgDarshan} alt="Kashi Vishwanath" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/60 via-maroon-deep/20 to-transparent" />
            </div>
            <div className="p-8 md:p-10">
              <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold text-maroon">{t("tmp_spot_tag")}</span>
              <h3 className="mt-3 font-display text-3xl text-maroon">{lang === "hi" ? "काशी विश्वनाथ" : "Kashi Vishwanath"}</h3>
              <p className="mt-2 text-sm text-brown/70">{lang === "hi" ? "वाराणसी, उत्तर प्रदेश" : "Varanasi, Uttar Pradesh"}</p>
              <p className="mt-4 text-brown/80">
                {t("tmp_spot_desc")}
              </p>
              <div className="mt-6 flex gap-3">
                <Link to="/chadhava" className="inline-block text-center rounded-full bg-saffron px-5 py-2 text-sm font-semibold text-white hover:bg-maroon transition-colors">{t("tmp_book_chadhava")}</Link>
                <Link to="/contact" className="inline-block text-center rounded-full border border-gold px-5 py-2 text-sm font-semibold text-maroon hover:bg-gold/20">{t("tmp_view_details")}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Temples;
