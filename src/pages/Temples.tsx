import { useState } from "react";
import { Search, MapPin, Clock, X, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";
import heroTemples from "@/assets/hero-temples-page.png";
import { useLanguage } from "@/context/LanguageContext";
import imgShiva from "@/assets/puja-shiva.jpg";
import imgVishnu from "@/assets/puja-vishnu.jpg";
import imgGanesh from "@/assets/puja-ganesh.jpg";
import imgDurga from "@/assets/puja-durga.jpg";
import imgDarshan from "@/assets/hero-darshan.jpg";
import imgTemple from "@/assets/hero-temple.jpg";

interface Temple {
  name: string;
  name_hi: string;
  state: string;
  state_hi: string;
  city: string;
  deity: string;
  deity_hi: string;
  timings: string;
  image: string;
  rating: number;
  reviews: number;
  established: string;
  description: string;
  description_hi: string;
  highlights: string[];
  highlights_hi: string[];
  bestTime: string;
  pujas: { name: string; price: number }[];
}

const temples: Temple[] = [
  {
    name: "Kashi Vishwanath",
    name_hi: "काशी विश्वनाथ",
    state: "Uttar Pradesh",
    state_hi: "उत्तर प्रदेश",
    city: "Varanasi",
    deity: "Shiva",
    deity_hi: "शिव",
    timings: "4 AM – 11 PM",
    image: imgDarshan,
    rating: 4.9,
    reviews: 12480,
    established: "11th Century",
    description:
      "One of the holiest temples in India, Kashi Vishwanath is dedicated to Lord Shiva and is located on the western bank of the sacred Ganges. It is one of the twelve Jyotirlingas — the holiest of Shiva shrines.",
    description_hi:
      "भारत के सबसे पवित्र मंदिरों में से एक, काशी विश्वनाथ भगवान शिव को समर्पित है और पवित्र गंगा के पश्चिमी तट पर स्थित है।",
    highlights: ["12 Jyotirlinga", "Ganga Aarti", "Bhasma Aarti", "Rudrabhishek"],
    highlights_hi: ["12 ज्योतिर्लिंग", "गंगा आरती", "भस्म आरती", "रुद्राभिषेक"],
    bestTime: "Oct – Mar",
    pujas: [
      { name: "Rudrabhishek", price: 951 },
      { name: "Maha Mrityunjaya Jaap", price: 1551 },
      { name: "Nav Greh Shanti", price: 2551 },
    ],
  },
  {
    name: "Tirupati Balaji",
    name_hi: "तिरुपति बालाजी",
    state: "Andhra Pradesh",
    state_hi: "आंध्र प्रदेश",
    city: "Tirupati",
    deity: "Vishnu",
    deity_hi: "विष्णु",
    timings: "3 AM – 10 PM",
    image: imgVishnu,
    rating: 4.9,
    reviews: 98400,
    established: "300 AD",
    description:
      "Sri Venkateswara Temple atop the Tirumala hills is the most visited religious site in the world. Dedicated to Lord Venkateswara, a form of Vishnu, it draws millions of devotees every year.",
    description_hi:
      "तिरुमला की पहाड़ियों पर स्थित श्री वेंकटेश्वर मंदिर विश्व का सर्वाधिक दर्शनार्थियों वाला धार्मिक स्थल है।",
    highlights: ["Brahmotsavam", "Kalyanotsavam", "Suprabhatam", "Tiruchanoor"],
    highlights_hi: ["ब्रह्मोत्सवम्", "कल्याणोत्सवम्", "सुप्रभातम", "तिरुचानूर"],
    bestTime: "Sep – Feb",
    pujas: [
      { name: "Kalyanam Seva", price: 1551 },
      { name: "Suprabhatam Seva", price: 2551 },
      { name: "Arjitha Brahmotsavam", price: 3551 },
    ],
  },
  {
    name: "Siddhivinayak",
    name_hi: "सिद्धिविनायक",
    state: "Maharashtra",
    state_hi: "महाराष्ट्र",
    city: "Mumbai",
    deity: "Ganesh",
    deity_hi: "गणेश",
    timings: "5:30 AM – 9:30 PM",
    image: imgGanesh,
    rating: 4.8,
    reviews: 34200,
    established: "1801 AD",
    description:
      "Shree Siddhivinayak Ganapati Mandir in Mumbai is one of the wealthiest temples in Maharashtra. The presiding deity Lord Ganapati is believed to fulfil all wishes of his devotees.",
    description_hi:
      "मुंबई में श्री सिद्धिविनायक गणपति मंदिर महाराष्ट्र के सबसे धनी मंदिरों में से एक है।",
    highlights: ["Ganesh Chaturthi", "Modak Prasad", "Siddhivinayak Aarti", "Tuesday Puja"],
    highlights_hi: ["गणेश चतुर्थी", "मोदक प्रसाद", "सिद्धिविनायक आरती", "मंगलवार पूजा"],
    bestTime: "Aug – Jan",
    pujas: [
      { name: "Modak Prasad Puja", price: 751 },
      { name: "Ganesh Abhishek", price: 1251 },
      { name: "Siddhi Puja", price: 2051 },
    ],
  },
  {
    name: "Vaishno Devi",
    name_hi: "वैष्णो देवी",
    state: "Jammu & Kashmir",
    state_hi: "जम्मू और कश्मीर",
    city: "Katra",
    deity: "Durga",
    deity_hi: "दुर्गा",
    timings: "5 AM – 12 AM",
    image: imgDurga,
    rating: 4.9,
    reviews: 56700,
    established: "Ancient",
    description:
      "Located in the Trikuta Mountains, Vaishno Devi shrine is one of the holiest Hindu temples dedicated to Goddess Vaishno Devi — a manifestation of Maa Durga. Millions undertake the sacred yatra annually.",
    description_hi:
      "त्रिकूट पर्वत में स्थित वैष्णो देवी मंदिर देवी वैष्णो देवी को समर्पित सबसे पवित्र हिंदू मंदिरों में से एक है।",
    highlights: ["Sacred Cave", "Navratri Celebration", "Bhawan Darshan", "Ardh Kuwari"],
    highlights_hi: ["पवित्र गुफा", "नवरात्रि उत्सव", "भवन दर्शन", "अर्ध कुँवारी"],
    bestTime: "Mar – Jul, Oct – Nov",
    pujas: [
      { name: "Mata Ki Aarti", price: 851 },
      { name: "Durga Saptashati Path", price: 1551 },
      { name: "Navratri Maha Puja", price: 2551 },
    ],
  },
  {
    name: "Jagannath Puri",
    name_hi: "जगन्नाथ पुरी",
    state: "Odisha",
    state_hi: "ओडिशा",
    city: "Puri",
    deity: "Vishnu",
    deity_hi: "विष्णु",
    timings: "5 AM – 9 PM",
    image: imgTemple,
    rating: 4.8,
    reviews: 28900,
    established: "12th Century",
    description:
      "The Jagannath Temple in Puri is one of the Char Dham pilgrimage sites. Famous for the grand Rath Yatra festival, it is dedicated to Lord Jagannath — a form of Vishnu. The Mahaprasad is considered sacred.",
    description_hi:
      "पुरी में जगन्नाथ मंदिर चार धाम तीर्थ स्थलों में से एक है। भव्य रथ यात्रा उत्सव के लिए प्रसिद्ध।",
    highlights: ["Rath Yatra", "Mahaprasad", "Snana Yatra", "Navakalevara"],
    highlights_hi: ["रथ यात्रा", "महाप्रसाद", "स्नान यात्रा", "नवकलेवर"],
    bestTime: "Oct – Feb",
    pujas: [
      { name: "Mahaprasad Offering", price: 651 },
      { name: "Sahana Mela Seva", price: 1351 },
      { name: "Rath Yatra Puja", price: 2251 },
    ],
  },
  {
    name: "Mahakaleshwar",
    name_hi: "महाकालेश्वर",
    state: "Madhya Pradesh",
    state_hi: "मध्य प्रदेश",
    city: "Ujjain",
    deity: "Shiva",
    deity_hi: "शिव",
    timings: "4 AM – 11 PM",
    image: imgShiva,
    rating: 4.9,
    reviews: 19300,
    established: "Ancient",
    description:
      "Mahakaleshwar Jyotirlinga is one of the twelve Jyotirlingas of Lord Shiva located in Ujjain, Madhya Pradesh. The unique Bhasma Aarti performed with sacred ash draws thousands of devotees daily.",
    description_hi:
      "महाकालेश्वर ज्योतिर्लिंग भगवान शिव के बारह ज्योतिर्लिंगों में से एक है। भस्म आरती इस मंदिर की विशेषता है।",
    highlights: ["Bhasma Aarti", "Jyotirlinga Darshan", "Kumbh Mela", "Mahashivratri"],
    highlights_hi: ["भस्म आरती", "ज्योतिर्लिंग दर्शन", "कुंभ मेला", "महाशिवरात्रि"],
    bestTime: "Oct – Mar",
    pujas: [
      { name: "Bhasma Aarti", price: 1100 },
      { name: "Rudrabhishek", price: 1551 },
      { name: "Maha Shivratri Puja", price: 3551 },
    ],
  },
];

const states = ["All", "Uttar Pradesh", "Maharashtra", "Andhra Pradesh", "Odisha", "Madhya Pradesh", "Jammu & Kashmir"];
const deities = ["All", "Shiva", "Vishnu", "Ganesh", "Durga"];

const Temples = () => {
  const { t, lang } = useLanguage();
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");
  const [deity, setDeity] = useState("All");
  const [selected, setSelected] = useState<Temple | null>(null);

  usePageTitle("Sacred Temples of India — Narayan Kripa");

  const filtered = temples.filter(
    (tp) =>
      (tp.name.toLowerCase().includes(q.toLowerCase()) || tp.name_hi.includes(q)) &&
      (state === "All" || tp.state === state) &&
      (deity === "All" || tp.deity === deity)
  );

  return (
    <main>
      <PageHero title={t("tmp_hero")} subtitle={t("tmp_hero_sub")} breadcrumb={t("tmp_breadcrumb")} bgImage={heroTemples} />

      <section className="bg-background py-12">
        <div className="container">
          {/* Search + Filters */}
          <div className="mx-auto mb-10 flex max-w-4xl flex-col gap-3 rounded-2xl border border-gold/50 bg-ivory p-4 md:flex-row">
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

          {/* Temple Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tp) => {
              const dName = lang === "hi" ? tp.name_hi : tp.name;
              const dState = lang === "hi" ? tp.state_hi : tp.state;
              const dDeity = lang === "hi" ? tp.deity_hi : tp.deity;
              return (
                <article
                  key={tp.name}
                  onClick={() => setSelected(tp)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-gold/40 bg-ivory shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-sacred hover:border-gold/70"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img src={tp.image} alt={dName} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-maroon-deep/20 to-transparent" />
                    {/* Gold strip */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-saffron via-gold to-saffron" />
                    {/* Deity badge */}
                    <span className="absolute top-3 right-3 rounded-full bg-gold/90 backdrop-blur px-3 py-1 text-[11px] font-bold text-maroon">
                      {dDeity}
                    </span>
                    {/* Temple name on image */}
                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <h3 className="font-display text-xl text-white drop-shadow-md leading-tight">{dName}</h3>
                      <p className="flex items-center gap-1 text-xs text-cream/80 mt-1">
                        <MapPin size={11} /> {tp.city}, {dState}
                      </p>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    {/* Rating + timings row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-saffron fill-saffron" />
                        <span className="text-sm font-bold text-maroon">{tp.rating}</span>
                        <span className="text-xs text-brown/40">({(tp.reviews / 1000).toFixed(1)}k)</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-brown/60 font-medium">
                        <Clock size={11} className="text-saffron" /> {tp.timings}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-brown/65 leading-relaxed mb-3 line-clamp-2">
                      {lang === "hi" ? tp.description_hi : tp.description}
                    </p>

                    {/* Highlights pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(lang === "hi" ? tp.highlights_hi : tp.highlights).slice(0, 3).map((h) => (
                        <span key={h} className="rounded-full bg-saffron/10 border border-saffron/20 px-2.5 py-0.5 text-[11px] font-semibold text-saffron">
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-gold-glow hover:-translate-y-0.5">
                      View Temple & Book Pooja <ChevronRight size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Temple Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />

          {/* Panel */}
          <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-ivory shadow-2xl animate-fadeIn">

            {/* Hero image */}
            <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
              <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/90 via-maroon-deep/40 to-transparent" />
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-saffron via-gold to-saffron" />

              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/60 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Name overlay */}
              <div className="absolute bottom-0 inset-x-0 p-5">
                <span className="rounded-full bg-gold/90 px-3 py-1 text-[11px] font-bold text-maroon mb-2 inline-block">
                  {lang === "hi" ? selected.deity_hi : selected.deity} • Est. {selected.established}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-white drop-shadow-md">
                  {lang === "hi" ? selected.name_hi : selected.name}
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-cream/80 mt-1">
                  <MapPin size={13} /> {selected.city}, {lang === "hi" ? selected.state_hi : selected.state}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Rating + timings */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(selected.rating) ? "text-saffron fill-saffron" : "text-gold/25"} />
                  ))}
                  <span className="text-sm font-bold text-maroon ml-1">{selected.rating}</span>
                  <span className="text-xs text-brown/40">({selected.reviews.toLocaleString("en-IN")} reviews)</span>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-brown/60 font-medium">
                  <Clock size={13} className="text-saffron" /> {selected.timings}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-brown/60 font-medium">
                  🌤️ Best time: {selected.bestTime}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-brown/75 leading-relaxed">
                {lang === "hi" ? selected.description_hi : selected.description}
              </p>

              {/* Highlights */}
              <div>
                <p className="text-xs font-bold text-maroon uppercase tracking-wider mb-2.5">✦ Famous For</p>
                <div className="flex flex-wrap gap-2">
                  {(lang === "hi" ? selected.highlights_hi : selected.highlights).map((h) => (
                    <span key={h} className="rounded-full bg-saffron/10 border border-saffron/25 px-3 py-1.5 text-xs font-semibold text-saffron">
                      {h}
                    </span>
                  ))}
                </div>
              </div>



              {/* Main CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  to="/puja"
                  onClick={() => setSelected(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-3.5 text-sm font-bold text-white shadow-md hover:shadow-gold-glow hover:-translate-y-0.5 transition-all"
                >
                  🪔 Book a Pooja at This Temple
                </Link>
                <Link
                  to="/chadhava"
                  onClick={() => setSelected(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-gold/50 py-3.5 text-sm font-bold text-maroon hover:bg-gold/10 transition-all"
                >
                  🌺 Offer Chadhava
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Temples;
