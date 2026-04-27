import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";

const services = [
  { name: "Kundali Reading", desc: "Detailed birth chart analysis", icon: "📜" },
  { name: "Marriage Matching", desc: "Guna milan & compatibility", icon: "💑" },
  { name: "Career Horoscope", desc: "Career path & timing", icon: "💼" },
  { name: "Vastu Consultation", desc: "Home & workplace harmony", icon: "🏠" },
  { name: "Numerology", desc: "Life-path & lucky numbers", icon: "🔢" },
  { name: "Tarot Reading", desc: "Insightful spiritual cards", icon: "🃏" },
];

const zodiacs = [
  { sign: "Aries", symbol: "♈", line: "A burst of energy fuels new beginnings today." },
  { sign: "Taurus", symbol: "♉", line: "Stability rewards your steady patience." },
  { sign: "Gemini", symbol: "♊", line: "Conversations spark unexpected opportunities." },
  { sign: "Cancer", symbol: "♋", line: "Family ties bring quiet joy and strength." },
  { sign: "Leo", symbol: "♌", line: "Your charisma opens golden doors." },
  { sign: "Virgo", symbol: "♍", line: "Attention to detail brings well-earned recognition." },
  { sign: "Libra", symbol: "♎", line: "Harmony in partnerships paves a smoother path." },
  { sign: "Scorpio", symbol: "♏", line: "Trust your intuition — it sees what eyes can't." },
  { sign: "Sagittarius", symbol: "♐", line: "Adventure calls; follow it with an open heart." },
  { sign: "Capricorn", symbol: "♑", line: "Discipline today shapes tomorrow's success." },
  { sign: "Aquarius", symbol: "♒", line: "Innovative ideas find willing listeners." },
  { sign: "Pisces", symbol: "♓", line: "Creativity flows — channel it into devotion." },
];

const Astrology = () => {
  usePageTitle("Vedic Astrology & Pandit Consultation — Narayan Kripa");

  return (
  <main>
    <PageHero title="Discover the Wisdom of the Stars" subtitle="Vedic guidance for life's most important decisions" variant="brown" breadcrumb="Astrology" />

    <section className="bg-background py-16">
      <div className="container">
        <SectionHeading title="Astrology Services" subtitle="Personalised consultations by certified Vedic acharyas" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.name} className="rounded-2xl border border-gold/50 bg-ivory p-6 transition-all hover:-translate-y-1 hover:border-saffron hover:shadow-lg">
              <div className="text-4xl">{s.icon}</div>
              <h3 className="mt-3 font-display text-maroon">{s.name}</h3>
              <p className="text-sm text-brown/70">{s.desc}</p>
              <button className="mt-4 text-sm font-semibold text-saffron hover:text-maroon">Consult Now →</button>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-cream py-16">
      <div className="container">
        <SectionHeading title="Daily Horoscope" subtitle="What the stars say for you today" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {zodiacs.map((z) => (
            <article key={z.sign} className="rounded-2xl border border-gold/40 bg-ivory p-5 text-center transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-2xl text-white">{z.symbol}</div>
              <h4 className="mt-2 font-display text-maroon">{z.sign}</h4>
              <p className="mt-1 text-xs text-brown/70">{z.line}</p>
              <button className="mt-3 text-xs font-semibold text-saffron hover:text-maroon">Read More →</button>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-maroon py-16 text-cream">
      <div className="container text-center">
        <h2 className="font-display text-3xl text-gold md:text-4xl">Speak to a Certified Pandit Today</h2>
        <p className="mx-auto mt-3 max-w-xl font-serif italic text-cream/80">Personalised guidance on career, marriage, health and dharmic life.</p>
        <button className="mt-6 rounded-full bg-saffron px-8 py-3 font-semibold text-white hover:bg-gold hover:text-maroon transition-colors">Consult a Pandit →</button>
      </div>
    </section>
  </main>
  );
};

export default Astrology;
