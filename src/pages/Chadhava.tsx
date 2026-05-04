import { useState, useEffect } from "react";
import { Check, Search, Heart, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase, type Chadhava as CType } from "@/lib/supabase";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import heroChadhava from "@/assets/hero-chadhava-page.png";
import imgChadhavaHero from "@/assets/hero-chadhava.jpg";

const benefits = [
  "Monthly chadhava at your chosen temple",
  "Prasad delivered to your doorstep",
  "Personalized blessings certificate",
  "Priority darshan booking",
];

const Chadhava = () => {
  usePageTitle("Offer Chadhava — Narayan Kripa");
  const [offerings, setOfferings] = useState<CType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("chadhavas")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOfferings(data as CType[]);
        setLoading(false);
      });
  }, []);

  /* Loading skeleton */
  const Skeleton = () => (
    <div className="rounded-2xl border border-gold/30 bg-ivory p-5 animate-pulse">
      <div className="h-40 w-full rounded-xl bg-gold/10 mb-4" />
      <div className="h-4 w-3/4 bg-gold/10 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gold/10 rounded mb-4" />
      <div className="h-8 w-full bg-gold/10 rounded-full" />
    </div>
  );

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
        <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden rounded-2xl border border-gold/50 shadow-soft">
          <img src={imgChadhavaHero} alt="Offering Chadhava" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/40 to-transparent" />
        </div>
      </div>
    </section>

    {/* Chadhava grid */}
    <section className="bg-cream py-16">
      <div className="container">
        <SectionHeading title="Special Chadhava Offerings" subtitle="Curated offerings for every devotee" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <><Skeleton /><Skeleton /><Skeleton /><Skeleton /><Skeleton /><Skeleton /></>
          ) : offerings.length === 0 ? (
            <p className="col-span-full py-12 text-center text-brown/60">No chadhava offerings available right now.</p>
          ) : offerings.map((o) => (
            <Link to={`/chadhava/${o.id}`} key={o.id} className="group rounded-2xl border border-gold/50 bg-ivory p-5 transition-all hover:-translate-y-1.5 hover:shadow-lg hover:shadow-gold/20 hover:border-saffron">
              <div className="mb-4 h-40 w-full overflow-hidden rounded-xl border border-gold/20">
                {o.image_url ? (
                  <img src={o.image_url} alt={o.temple} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-saffron/15 to-gold/15 text-4xl">🌺</div>
                )}
              </div>
              <h3 className="font-display text-maroon">{o.temple}</h3>
              <p className="text-sm text-brown/70">{o.item}</p>
              <div className="mt-4 flex items-center justify-between border-t border-gold/30 pt-3">
                <span className="font-semibold text-saffron text-lg">₹{o.price.toLocaleString("en-IN")}</span>
                <span className="rounded-full bg-saffron group-hover:bg-maroon px-4 py-1.5 text-sm font-semibold text-white transition-colors">
                  View Details →
                </span>
              </div>
            </Link>
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
