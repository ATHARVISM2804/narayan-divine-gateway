import { MapPin } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const temples = [
  "Kashi Vishwanath", "Tirupati Balaji", "Siddhivinayak", "ISKCON Vrindavan",
  "Mathura Krishna", "Shirdi Sai Baba", "Vaishno Devi", "Jagannath Puri",
  "Mahakaleshwar Ujjain", "Kedarnath", "Badrinath", "Somnath",
];

const featured = [
  { name: "Kashi Vishwanath", location: "Varanasi, UP", desc: "One of the twelve Jyotirlingas, the spiritual heart of India.", emoji: "🕉️" },
  { name: "Tirupati Balaji", location: "Tirumala, AP", desc: "The sacred abode of Lord Venkateswara.", emoji: "🛕" },
  { name: "Siddhivinayak", location: "Mumbai, MH", desc: "The renowned temple of Lord Ganesha.", emoji: "🐘" },
];

const Pill = ({ name }: { name: string }) => (
  <span className="mx-2 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-gold bg-ivory px-5 py-2 text-sm text-maroon shadow-sm">
    🛕 {name}
  </span>
);

const TemplePartners = () => {
  const doubled = [...temples, ...temples];
  const reversed = [...temples].reverse();
  const doubledRev = [...reversed, ...reversed];

  return (
    <section className="bg-cream py-16">
      <div className="container">
        <SectionHeading title="Partnered with India's Most Sacred Temples" subtitle="Devotion delivered from Himalayan peaks to coastal shrines" />
      </div>

      <div className="space-y-3 overflow-hidden py-3">
        <div className="flex w-max animate-marquee">
          {doubled.map((t, i) => <Pill key={`a${i}`} name={t} />)}
        </div>
        <div className="flex w-max animate-marquee [animation-direction:reverse] [animation-duration:32s]">
          {doubledRev.map((t, i) => <Pill key={`b${i}`} name={t} />)}
        </div>
      </div>

      <div className="container mt-12 grid gap-6 md:grid-cols-3">
        {featured.map((t) => (
          <article key={t.name} className="flex gap-4 rounded-2xl border border-gold/50 bg-ivory p-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/20">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-saffron/20 to-gold/30 text-4xl">
              {t.emoji}
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg text-maroon">{t.name}</h3>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-maroon">
                  <MapPin size={10} /> {t.location}
                </span>
                <p className="mt-2 text-xs text-brown/70">{t.desc}</p>
              </div>
              <button className="self-start text-xs font-semibold text-saffron hover:text-maroon">Book Chadhava →</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TemplePartners;
