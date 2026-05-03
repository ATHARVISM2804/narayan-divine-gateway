import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import heroTemple from "@/assets/hero-temple.jpg";
import heroDarshan from "@/assets/hero-darshan.jpg";
import heroChadhava from "@/assets/hero-chadhava.jpg";

const temples = [
  "Kashi Vishwanath", "Tirupati Balaji", "Siddhivinayak", "ISKCON Vrindavan",
  "Mathura Krishna", "Shirdi Sai Baba", "Vaishno Devi", "Jagannath Puri",
  "Mahakaleshwar Ujjain", "Kedarnath", "Badrinath", "Somnath",
];

const featured = [
  { name: "Kashi Vishwanath", location: "Varanasi, UP", desc: "One of the twelve Jyotirlingas, the spiritual heart of India and abode of Lord Shiva.", image: heroDarshan },
  { name: "Tirupati Balaji", location: "Tirumala, AP", desc: "The sacred abode of Lord Venkateswara — visited by millions every year.", image: heroTemple },
  { name: "Siddhivinayak", location: "Mumbai, MH", desc: "The renowned temple of Lord Ganesha, remover of obstacles.", image: heroChadhava },
];

const Pill = ({ name }: { name: string }) => (
  <span className="mx-2 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-gold bg-ivory px-5 py-2.5 text-sm font-medium text-maroon shadow-soft">
    🛕 {name}
  </span>
);

const TemplePartners = () => {
  const doubled = [...temples, ...temples];
  const reversed = [...temples].reverse();
  const doubledRev = [...reversed, ...reversed];

  return (
    <section className="relative bg-cream py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Sacred Sanctuaries"
          title="Partnered with India's Most Sacred Temples"
          subtitle="Devotion delivered from Himalayan peaks to coastal shrines"
        />
      </div>

      <div className="space-y-3 overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee">
          {doubled.map((t, i) => <Pill key={`a${i}`} name={t} />)}
        </div>
        <div className="flex w-max animate-marquee [animation-direction:reverse] [animation-duration:32s]">
          {doubledRev.map((t, i) => <Pill key={`b${i}`} name={t} />)}
        </div>
      </div>

      <div className="container mt-14 grid gap-7 md:grid-cols-3">
        {featured.map((t) => (
          <article
            key={t.name}
            className="group relative overflow-hidden rounded-2xl border border-gold/50 bg-ivory shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-sacred"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={t.image}
                alt={t.name}
                loading="lazy"
                width={1024}
                height={768}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-gold/95 px-3 py-1 text-[10px] font-semibold text-maroon">
                <MapPin size={10} /> {t.location}
              </span>
            </div>
            <div className="space-y-3 p-5">
              <h3 className="font-display text-xl text-maroon">{t.name}</h3>
              <p className="font-serif italic text-sm text-brown/70 leading-relaxed">{t.desc}</p>
              <Link to="/chadhava" className="inline-block items-center gap-1 rounded-full border border-saffron bg-transparent px-4 py-1.5 text-xs font-semibold text-saffron transition-all hover:bg-saffron hover:text-white">
                Book Chadhava →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TemplePartners;
