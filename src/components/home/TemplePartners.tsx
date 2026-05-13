import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, ChevronRight, Calendar } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { supabase, type Chadhava as CType } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

const temples = [
  "Kashi Vishwanath", "Tirupati Balaji", "Siddhivinayak", "ISKCON Vrindavan",
  "Mathura Krishna", "Shirdi Sai Baba", "Vaishno Devi", "Jagannath Puri",
  "Mahakaleshwar Ujjain", "Kedarnath", "Badrinath", "Somnath",
];

const Pill = ({ name }: { name: string }) => (
  <span className="mx-2 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-gold bg-ivory px-5 py-2.5 text-sm font-medium text-maroon shadow-soft">
    🛕 {name}
  </span>
);

/* ── Skeleton matches the Chadhava card shape exactly ── */
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

const TemplePartners = () => {
  const { t, lang } = useLanguage();
  const [chadhavas, setChadhavas] = useState<CType[]>([]);
  const [minPrices, setMinPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const doubled = [...temples, ...temples];
  const reversed = [...temples].reverse();
  const doubledRev = [...reversed, ...reversed];

  useEffect(() => {
    const load = async () => {
      const { data: chData } = await supabase
        .from("chadhavas")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

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

  return (
    <section className="relative bg-gradient-to-b from-cream via-ivory to-cream py-20">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-saffron/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-saffron/60 to-transparent" />

      <div className="container">
        <SectionHeading
          eyebrow={t("tp_eyebrow")}
          title={t("tp_title")}
          subtitle={t("tp_sub")}
        />
      </div>

      {/* Marquee scrolling temple names */}
      <div className="space-y-3 overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee will-change-transform">
          {doubled.map((tpl, i) => <Pill key={`a${i}`} name={tpl} />)}
        </div>
        <div className="flex w-max animate-marquee will-change-transform [animation-direction:reverse] [animation-duration:32s]">
          {doubledRev.map((tpl, i) => <Pill key={`b${i}`} name={tpl} />)}
        </div>
      </div>

      {/* Chadhava cards — identical to Chadhava page */}
      <div className="container mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <><Skeleton /><Skeleton /><Skeleton /></>
        ) : chadhavas.length === 0 ? (
          <p className="col-span-full py-12 text-center text-brown/60">
            {t("chadhava_empty")}
          </p>
        ) : chadhavas.map((c) => {
          const dItem   = (lang === "hi" && c.item_hi)        ? c.item_hi        : c.item;
          const dTemple = (lang === "hi" && c.temple_hi)      ? c.temple_hi      : c.temple;
          const dDesc   = (lang === "hi" && c.description_hi) ? c.description_hi : c.description;

          return (
            <Link
              to={`/chadhava/${c.id}`}
              key={c.id}
              className="group overflow-hidden rounded-2xl border border-gold/50 bg-ivory transition-all duration-500 hover:-translate-y-1.5 hover:border-saffron hover:shadow-sacred flex flex-col h-full shadow-soft"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-sacred/15 via-gold/15 to-transparent border-b border-gold/30">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.item}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-5xl">🪔</div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 p-5 bg-gradient-to-b from-ivory to-cream/30">
                {/* Chadhava Name */}
                <h3 className="font-body text-[17px] font-bold text-maroon leading-snug mb-1">{dItem}</h3>

                {/* Description */}
                {dDesc && (
                  <p className="text-xs text-saffron font-semibold line-clamp-2 mb-1">{dDesc}</p>
                )}

                {/* Date */}
                {c.date && (
                  <p className="flex items-center gap-1.5 text-xs text-brown/60 font-semibold mb-2">
                    <Calendar size={13} className="text-saffron" /> {c.date}
                  </p>
                )}

                {/* Temple name */}
                <div className="flex items-center gap-1.5 text-brown/50 mb-3">
                  <span className="text-sm leading-none shrink-0">🛕</span>
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

      {/* View all link */}
      <div className="container mt-10 text-center">
        <Link
          to="/chadhava"
          className="inline-flex items-center gap-2 rounded-full border-2 border-gold bg-ivory px-8 py-3 font-semibold text-maroon shadow-soft transition-all hover:bg-gold hover:shadow-gold-glow"
        >
          {t("chadhava_view_all") || "View All Chadhava"}
        </Link>
      </div>
    </section>
  );
};

export default TemplePartners;
