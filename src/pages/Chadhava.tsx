import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase, type Chadhava as CType } from "@/lib/supabase";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import heroChadhava from "@/assets/hero-chadhava-page.png";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronRight, MapPin } from "lucide-react";

const Chadhava = () => {
  usePageTitle("Offer Chadhava — Narayan Kripa");
  const { t, lang } = useLanguage();
  const [chadhavas, setChadhavas] = useState<CType[]>([]);
  const [minPrices, setMinPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: chData } = await supabase
        .from("chadhavas")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (chData) {
        setChadhavas(chData as CType[]);
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

  const Skeleton = () => (
    <div className="rounded-2xl border border-gold/30 bg-ivory overflow-hidden animate-pulse">
      <div className="h-44 bg-gold/10" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-gold/10 rounded" />
        <div className="h-3 w-1/2 bg-gold/10 rounded" />
        <div className="h-10 bg-gold/10 rounded-full mt-4" />
      </div>
    </div>
  );

  return (
    <main>
      <PageHero title={t("chadhava_hero_title")} subtitle={t("chadhava_hero_sub")} variant="saffron" breadcrumb={t("breadcrumb_chadhava")} bgImage={heroChadhava} />

      <section className="bg-cream py-12">
        <div className="container">
          <SectionHeading title={t("chadhava_section_title")} subtitle={t("chadhava_section_sub")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <><Skeleton /><Skeleton /><Skeleton /><Skeleton /><Skeleton /><Skeleton /></>
            ) : chadhavas.length === 0 ? (
              <p className="col-span-full py-12 text-center text-brown/60">{t("chadhava_empty")}</p>
            ) : chadhavas.map((c) => {
              const dItem = (lang === "hi" && c.item_hi) ? c.item_hi : c.item;
              const dTemple = (lang === "hi" && c.temple_hi) ? c.temple_hi : c.temple;
              const dDesc = (lang === "hi" && c.description_hi) ? c.description_hi : c.description;
              const startPrice = minPrices[c.id] || c.price;
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
                    {/* Chadhava Name — primary */}
                    <h3 className="font-body text-[17px] font-bold text-maroon leading-snug mb-1">{dItem}</h3>

                    {/* Benefit/description — colored */}
                    {dDesc && (
                      <p className="text-xs text-saffron font-semibold line-clamp-2 mb-2">{dDesc}</p>
                    )}

                    {/* Temple name — secondary */}
                    <div className="flex items-center gap-1.5 text-brown/50 mb-3">
                      <MapPin size={12} className="shrink-0" />
                      <p className="text-xs font-medium truncate">{dTemple}</p>
                    </div>

                    <div className="flex-1" />

                    {/* CTA */}
                    <div className="border-t border-gold/30 pt-3 mt-1">
                      <span className="flex items-center justify-center gap-1.5 rounded-full bg-saffron group-hover:bg-maroon w-full py-2.5 text-sm font-bold text-white transition-colors">
                        {t("btn_participate")} <ChevronRight size={14} />
                      </span>
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

export default Chadhava;
