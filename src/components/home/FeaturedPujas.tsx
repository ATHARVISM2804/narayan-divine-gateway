import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import { supabase, type Puja } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

const FeaturedPujas = () => {
  const { t, lang } = useLanguage();
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("pujas")
      .select("*")
      .eq("status", "active")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setPujas(data as Puja[]);
        setLoading(false);
      });
  }, []);

  /* Loading skeleton */
  const Skeleton = () => (
    <div className="rounded-2xl border border-gold/30 bg-ivory overflow-hidden animate-pulse">
      <div className="h-56 bg-gold/10" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-gold/10 rounded" />
        <div className="h-3 w-1/2 bg-gold/10 rounded" />
        <div className="h-36 bg-gold/10 rounded-xl mt-4" />
        <div className="h-11 bg-gold/10 rounded-full mt-4" />
      </div>
    </div>
  );

  if (!loading && pujas.length === 0) return null;

  return (
    <section className="relative texture-parchment py-20">
      {/* decorative top + bottom borders */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="container">
        <SectionHeading
          title={t("featured_title")}
          subtitle={t("featured_sub")}
        />

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          {loading ? (
            <><Skeleton /><Skeleton /><Skeleton /></>
          ) : pujas.map((p) => {
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
                  <img src={p.image_url} alt={p.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-30 mix-blend-multiply texture-parchment transition-transform duration-700 group-hover:scale-110"></div>
                    <div className="relative text-6xl drop-shadow-[0_0_15px_rgba(255,184,0,0.5)] transition-transform duration-500 group-hover:scale-110">🪔</div>
                  </>
                )}
              </div>

              <div className="flex flex-col flex-1 p-5 bg-gradient-to-b from-ivory to-cream/30">
                <h3 className="font-body text-[18px] font-bold text-maroon leading-snug mb-3">{displayName}</h3>

                <div className="flex flex-col gap-1.5 text-xs text-brown/70 font-semibold">
                  <span className="flex items-center gap-1.5"><span className="w-4 flex items-center justify-center shrink-0"><Calendar size={13} className="text-saffron" /></span> {p.date}</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 flex items-center justify-center shrink-0 text-sm leading-none">🛕</span> {displayLocation}</span>
                </div>

                {displayBenefit && (
                  <div className="mt-3 rounded-xl bg-saffron/10 border border-saffron/20 px-3 py-2">
                    <p className="text-[14px] font-bold text-maroon leading-snug">✦ {displayBenefit}</p>
                  </div>
                )}

                <div className="flex-1"></div>

                <div className="mt-4 w-full text-center rounded-full bg-saffron group-hover:bg-maroon px-5 py-3.5 text-[15px] font-bold text-white shadow-md transition-all group-hover:shadow-gold-glow">
                  {t("btn_participate")}
                </div>
              </div>
            </Link>
          );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/puja" className="inline-flex items-center gap-2 rounded-full border-2 border-gold bg-ivory px-8 py-3 font-semibold text-maroon shadow-soft transition-all hover:bg-gold hover:shadow-gold-glow">
            {t("featured_view_all")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPujas;
