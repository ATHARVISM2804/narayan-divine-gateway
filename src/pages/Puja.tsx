import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase, type Puja as PujaType } from "@/lib/supabase";
import PageHero from "@/components/PageHero";
import heroPuja from "@/assets/hero-puja-page.png";
import { useLanguage } from "@/context/LanguageContext";


const Puja = () => {
  usePageTitle("Sacred Pujas — Narayan Kripa");
  const { t, lang } = useLanguage();

  const [pujas, setPujas] = useState<PujaType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("pujas")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPujas(data as PujaType[]);
        setLoading(false);
      });
  }, []);

  /* Loading skeleton */
  const Skeleton = () => (
    <div className="rounded-2xl border border-gold/30 bg-ivory overflow-hidden animate-pulse">
      <div className="h-36 bg-gold/10" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-gold/10 rounded" />
        <div className="h-3 w-1/2 bg-gold/10 rounded" />
        <div className="h-3 w-2/3 bg-gold/10 rounded" />
        <div className="h-32 bg-gold/10 rounded-xl mt-4" />
        <div className="h-10 bg-gold/10 rounded-full mt-4" />
      </div>
    </div>
  );

  return (
    <main>
      <PageHero title={t("puja_hero_title")} subtitle={t("puja_hero_sub")} breadcrumb={t("nav_puja")} bgImage={heroPuja} />

      <section className="bg-background py-12">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <><Skeleton /><Skeleton /><Skeleton /></>
            ) : pujas.length === 0 ? (
              <p className="col-span-full py-12 text-center text-brown/60">{t("puja_empty")}</p>
            ) : pujas.map((p) => {
              const minPrice = Math.min(...(p.prices || []).map(t => t.price));
              const displayName = (lang === 'hi' && p.name_hi) ? p.name_hi : p.name;
              const displayLocation = (lang === 'hi' && p.location_hi) ? p.location_hi : p.location;
              const displayBenefit = (lang === 'hi' && p.benefit_hi) ? p.benefit_hi : p.benefit;
              return (
              <Link
                to={`/puja/${p.id}`}
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-gold/50 bg-ivory transition-all duration-500 hover:-translate-y-1.5 hover:border-saffron hover:shadow-sacred flex flex-col h-full shadow-soft"
              >
                <div className="relative grid h-44 place-items-center bg-gradient-to-br from-sacred/15 via-gold/15 to-transparent overflow-hidden border-b border-gold/30">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-30 mix-blend-multiply texture-parchment transition-transform duration-700 group-hover:scale-110"></div>
                      <div className="relative text-6xl drop-shadow-[0_0_15px_rgba(255,184,0,0.5)] transition-transform duration-500 group-hover:scale-110">🪔</div>
                    </>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5 bg-gradient-to-b from-ivory to-cream/30">
                  <h3 className="font-body text-[18px] font-bold text-maroon leading-snug mb-3">{displayName}</h3>

                  <div className="flex flex-col gap-2 text-sm text-brown/90 font-semibold">
                    <span className="flex items-center gap-2"><Calendar size={15} className="text-saffron" /> {p.date}</span>
                    <span className="flex items-center gap-2"><span className="text-base leading-none">🛕</span> {displayLocation}</span>
                  </div>

                  {displayBenefit && (
                    <div className="mt-3 rounded-xl bg-saffron/10 border border-saffron/20 px-3 py-2">
                      <p className="text-[14px] font-bold text-maroon leading-snug">✦ {displayBenefit}</p>
                    </div>
                  )}

                  <div className="flex-1"></div>

                  {/* Starting price + tier count */}
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-brown/50 uppercase tracking-wider font-medium">{t("puja_starting")}</p>
                      <p className="font-sans font-bold text-saffron text-xl mt-0.5">₹{minPrice.toLocaleString("en-IN")}</p>
                    </div>

                  </div>

                  <div className="mt-4 w-full text-center rounded-full bg-saffron group-hover:bg-maroon px-5 py-3.5 text-[15px] font-bold text-white shadow-md transition-all group-hover:shadow-gold-glow">
                    {t("btn_participate")}
                  </div>
                </div>
              </Link>
            );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Puja;
