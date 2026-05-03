import { Check, Search, Heart, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import heroChadhava from "@/assets/hero-chadhava-page.png";

const offerings = [
  { temple: "Kashi Vishwanath", item: "Bel Patra & Dhatura", price: 251 },
  { temple: "Tirupati Balaji", item: "Tulsi Mala & Laddu Prasad", price: 501 },
  { temple: "Siddhivinayak", item: "Modak & Red Hibiscus", price: 351 },
  { temple: "Vaishno Devi", item: "Chunari & Sindoor", price: 451 },
  { temple: "Mahakaleshwar", item: "Bhasma Aarti Offering", price: 1100 },
  { temple: "Jagannath Puri", item: "Mahaprasad Offering", price: 651 },
];

const benefits = [
  "Monthly chadhava at your chosen temple",
  "Prasad delivered to your doorstep",
  "Personalized blessings certificate",
  "Priority darshan booking",
];

const Chadhava = () => {
  usePageTitle("Offer Chadhava — Narayan Kripa");

  return (
  <main>
    <PageHero title="Offer Chadhava at Sacred Temples" subtitle="Your devotion, our sacred delivery" variant="saffron" breadcrumb="Chadhava" bgImage={heroChadhava} />

    {/* What is Chadhava */}
    <section className="bg-background py-16">
      <div className="container grid items-center gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl text-maroon">What is Chadhava?</h2>
          <div className="my-3 h-px w-20 bg-gold" />
          <p className="text-brown/80">
            Chadhava is the sacred act of offering items like flowers, prasad, vastra, sindoor and seva to a deity at a temple — performed on your behalf with the full intent of your sankalp.
          </p>
          <p className="mt-3 text-brown/80">
            With Narayan Kripa, your offering reaches India's most revered shrines through verified temple priests, and the prasad returns to your home as a tangible blessing.
          </p>
        </div>
        <div className="grid place-items-center rounded-2xl bg-ivory border border-gold/50 p-10 text-8xl">
          🌺
        </div>
      </div>
    </section>

    {/* Special Chadhava grid */}
    <section className="bg-cream py-16">
      <div className="container">
        <SectionHeading title="Special Chadhava Offerings" subtitle="Curated offerings for every devotee" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((o) => (
            <article key={o.temple + o.item} className="rounded-2xl border border-gold/50 bg-ivory p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/20">
              <div className="mb-3 grid h-32 place-items-center rounded-xl bg-gradient-to-br from-saffron/20 to-gold/30 text-5xl">🛕</div>
              <h3 className="font-display text-maroon">{o.temple}</h3>
              <p className="text-sm text-brown/70">{o.item}</p>
              <div className="mt-4 flex items-center justify-between border-t border-gold/30 pt-3">
                <span className="font-semibold text-saffron">₹{o.price}</span>
                <Link to="/contact" className="text-sm font-semibold text-maroon hover:text-saffron">Offer Now →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* Subscription */}
    <section className="bg-background py-16">
      <div className="container">
        <div className="mx-auto max-w-3xl rounded-3xl border-2 border-gold bg-gradient-to-br from-maroon to-maroon-deep p-8 text-cream md:p-12">
          <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold text-maroon">CHADHAVA+ SEVA</span>
          <h2 className="mt-3 font-display text-3xl text-gold">Monthly Sacred Subscription</h2>
          <p className="mt-2 text-cream/80">Continuous blessings — automated chadhava every month at your chosen temple.</p>
          <ul className="mt-5 space-y-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2"><Check size={18} className="mt-0.5 text-gold" /> {b}</li>
            ))}
          </ul>
          <Link to="/contact" className="mt-6 inline-block rounded-full bg-saffron px-6 py-3 font-semibold text-white hover:bg-gold hover:text-maroon transition-colors">Subscribe — ₹999/mo</Link>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="bg-cream py-16">
      <div className="container">
        <SectionHeading title="How Chadhava Works" />
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { Icon: Search, title: "Choose Temple & Offering", desc: "Pick your preferred temple and the offering you wish to send." },
            { Icon: Heart, title: "Add Your Sankalp", desc: "Share your name, gotra and intention behind the offering." },
            { Icon: Gift, title: "Receive Prasad", desc: "Get prasad and a blessings certificate delivered to your home." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-gold/40 bg-ivory p-6 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-saffron text-white"><s.Icon size={20} /></div>
              <p className="mt-2 text-xs font-semibold text-saffron">STEP {i + 1}</p>
              <h3 className="font-display text-maroon">{s.title}</h3>
              <p className="mt-2 text-sm text-brown/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
  );
};

export default Chadhava;
