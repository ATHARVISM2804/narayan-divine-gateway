import { useState, useEffect } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import { supabase, type Chadhava } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

const FeaturedChadhavas = () => {
  const { t, lang } = useLanguage();
  const [chadhavas, setChadhavas] = useState<Chadhava[]>([]);
  const [minPrices, setMinPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: chData } = await supabase
        .from("chadhavas")
        .select("*")
        .eq("status", "active")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (chData && chData.length > 0) {
        setChadhavas(chData as Chadhava[]);
        const { data: offData } = await supabase
          .from("chadhava_offerings")
          .select("chadhava_id, price")
          .eq("status", "active");
        if (offData) {
          const mins: Record<string, number> = {};
          offData.forEach((o: { chadhava_id: string; price: number }) => {
            if (!mins[o.chadhava_id] || o.price < mins[o.chadhava_id]) {
              mins[o.chadhava_id] = o.price;
            }
          });
          setMinPrices(mins);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  /* Loading skeleton */
  const Skeleton = () => (
    <div className="rounded-2xl border border-gold/30 bg-ivory overflow-hidden animate-pulse">
      <div className="h-44 bg-gold/10" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-gold/10 rounded" />
        <div className="h-3 w-1/2 bg-gold/10 rounded" />
        <div className="h-11 bg-gold/10 rounded-full mt-4" />
      </div>
    </div>
  );

  if (!loading && chadhavas.length === 0) return null;

  return (
    <section className="bg-cream py-20">
      <div className="container">
        <SectionHeading
          title={t("featured_ch_title")}
          subtitle={t("featured_ch_sub")}
        />

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          {loading ? (
            <><Skeleton /><Skeleton /><Skeleton /></>
          ) : chadhavas.map((c) => {
            const dItem = (lang === "hi" && c.item_hi) ? c.item_hi : c.item;
            const dTemple = (lang === "hi" && c.temple_hi) ? c.temple_hi : c.temple;
            const dDesc = (lang === "hi" && c.description_hi) ? c.description_hi : c.description;
            return (
              <Link to={`/chadhava/${c.id}`} key={c.id}
                className="group overflow-hidden rounded-2xl border border-gold/50 bg-ivory transition-all duration-500 hover:-translate-y-1.5 hover:border-saffron hover:shadow-sacred flex flex-col h-full shadow-soft">
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-sacred/15 via-gold/15 to-transparent border-b border-gold/30">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.item} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-5xl">🪔</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-5 bg-gradient-to-b from-ivory to-cream/30">
                  <h3 className="font-body text-[18px] font-bold text-maroon leading-snug mb-1">{dItem}</h3>

                  {dDesc && (
                    <p className="text-xs text-saffron font-semibold line-clamp-2 mb-1">{dDesc}</p>
                  )}

                  {c.date && (
                    <p className="flex items-center gap-1.5 text-xs text-brown/70 font-semibold mb-2">
                      <Calendar size={13} className="text-saffron" /> {c.date}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-brown/70 mb-3">
                    <span className="text-sm leading-none shrink-0">🛕</span>
                    <p className="text-xs font-semibold truncate">{dTemple}</p>
                  </div>

                  <div className="flex-1" />

                  {/* CTA */}
                  <div className="border-t border-gold/30 pt-3 mt-1">
                    <span className="flex items-center justify-center gap-1.5 rounded-full bg-saffron group-hover:bg-maroon w-full py-2.5 text-sm font-bold text-white transition-colors">
                      {t("btn_offer_now")} <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/chadhava" className="inline-flex items-center gap-2 rounded-full border-2 border-gold bg-ivory px-8 py-3 font-semibold text-maroon shadow-soft transition-all hover:bg-gold hover:shadow-gold-glow">
            {t("featured_ch_view_all")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedChadhavas;
