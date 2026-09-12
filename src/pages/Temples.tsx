import { useState, useEffect } from "react";
import { Search, MapPin, Clock, X, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";
import FitImage from "@/components/FitImage";
import heroTemples from "@/assets/hero-temples-page.png";
import fallbackTemple from "@/assets/hero-temple.jpg";
import imgShiva from "@/assets/puja-shiva.jpg";
import imgVishnu from "@/assets/puja-vishnu.jpg";
import imgGanesh from "@/assets/puja-ganesh.jpg";
import imgDurga from "@/assets/puja-durga.jpg";
import imgDarshan from "@/assets/hero-darshan.jpg";
import { useLanguage } from "@/context/LanguageContext";
import { supabase, type Temple } from "@/lib/supabase";

/* Fallback photo per seeded temple (used only until an admin uploads a real
   image_url). Matches the images the site originally shipped with. */
const SEED_IMAGES: Record<string, string> = {
  "Kashi Vishwanath": imgDarshan,
  "Tirupati Balaji": imgVishnu,
  "Siddhivinayak": imgGanesh,
  "Vaishno Devi": imgDurga,
  "Jagannath Puri": fallbackTemple,
  "Mahakaleshwar": imgShiva,
};
/* Uploaded image wins; else the seed image for that temple; else generic. */
const templeImg = (tp: Temple) => tp.image_url || SEED_IMAGES[tp.name] || fallbackTemple;

const Temples = () => {
  const { t, lang } = useLanguage();
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");
  const [deity, setDeity] = useState("All");
  const [selected, setSelected] = useState<Temple | null>(null);

  usePageTitle("Sacred Temples of India — Narayan Kripa");

  useEffect(() => {
    supabase
      .from("temples")
      .select("*")
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTemples(data as Temple[]);
        setLoading(false);
      });
  }, []);

  /* Filter options derived from the actual temples.
     value stays English (used by the filter); label is localized. */
  const isHi = lang === "hi";
  const stateOptions = [
    { value: "All", label: t("filter_all") },
    ...Array.from(
      new Map(temples.filter((tp) => tp.state).map((tp) => [tp.state as string, (isHi && tp.state_hi ? tp.state_hi : tp.state) as string])).entries()
    ).sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ value, label })),
  ];
  const deityOptions = [
    { value: "All", label: t("filter_all") },
    ...Array.from(
      new Map(temples.filter((tp) => tp.deity).map((tp) => [tp.deity as string, (isHi && tp.deity_hi ? tp.deity_hi : tp.deity) as string])).entries()
    ).sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ value, label })),
  ];

  const filtered = temples.filter(
    (tp) =>
      (tp.name.toLowerCase().includes(q.toLowerCase()) || (tp.name_hi || "").includes(q)) &&
      (state === "All" || tp.state === state) &&
      (deity === "All" || tp.deity === deity)
  );

  const hi = lang === "hi";
  const dName  = (tp: Temple) => (hi && tp.name_hi ? tp.name_hi : tp.name);
  const dState = (tp: Temple) => (hi && tp.state_hi ? tp.state_hi : tp.state) || "";
  const dDeity = (tp: Temple) => (hi && tp.deity_hi ? tp.deity_hi : tp.deity) || "";
  const dDesc  = (tp: Temple) => (hi && tp.description_hi ? tp.description_hi : tp.description) || "";
  const dHighlights = (tp: Temple) => (hi && tp.highlights_hi?.length ? tp.highlights_hi : tp.highlights) || [];

  return (
    <main>
      <PageHero title={t("tmp_hero")} subtitle={t("tmp_hero_sub")} breadcrumb={t("tmp_breadcrumb")} bgImage={heroTemples} />

      <section className="bg-background py-12">
        <div className="container">
          {/* Search + Filters */}
          <div className="mx-auto mb-10 flex max-w-4xl flex-col gap-3 rounded-2xl border border-gold/50 bg-ivory p-4 md:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-gold/60 bg-cream px-4 py-2">
              <Search size={16} className="text-saffron" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("tmp_search")} className="w-full bg-transparent text-sm outline-none placeholder:text-brown/40" />
            </div>
            <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-full border border-gold/60 bg-cream px-4 py-2 text-sm text-maroon outline-none">
              {stateOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={deity} onChange={(e) => setDeity(e.target.value)} className="rounded-full border border-gold/60 bg-cream px-4 py-2 text-sm text-maroon outline-none">
              {deityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-80 rounded-2xl bg-gold/10 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-gold/30 bg-ivory p-12 text-center">
              <p className="text-4xl mb-3">🛕</p>
              <p className="font-display text-lg text-maroon">
                {temples.length === 0 ? "No temples available yet" : "No temples match your search"}
              </p>
              <p className="text-xs text-brown/50 mt-1">
                {temples.length === 0 ? "Please check back soon." : "Try a different state, deity or search term."}
              </p>
            </div>
          ) : (
            /* Temple Cards */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tp) => (
                <article
                  key={tp.id}
                  onClick={() => setSelected(tp)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-gold/40 bg-ivory shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-sacred hover:border-gold/70"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <FitImage src={templeImg(tp)} alt={dName(tp)} className="transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-maroon-deep/20 to-transparent" />
                    {/* Gold strip */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-saffron via-gold to-saffron" />
                    {/* Deity badge */}
                    {dDeity(tp) && (
                      <span className="absolute top-3 right-3 rounded-full bg-gold/90 backdrop-blur px-3 py-1 text-[11px] font-bold text-maroon">
                        {dDeity(tp)}
                      </span>
                    )}
                    {/* Temple name on image */}
                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <h3 className="font-display text-xl text-white drop-shadow-md leading-tight">{dName(tp)}</h3>
                      <p className="flex items-center gap-1 text-xs text-cream/80 mt-1">
                        <MapPin size={11} /> {[tp.city, dState(tp)].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    {/* Rating + timings row */}
                    {(tp.rating != null || tp.timings) && (
                      <div className="flex items-center justify-between mb-3">
                        {tp.rating != null ? (
                          <div className="flex items-center gap-1">
                            <Star size={13} className="text-saffron fill-saffron" />
                            <span className="text-sm font-bold text-maroon">{tp.rating}</span>
                            {tp.reviews ? (
                              <span className="text-xs text-brown/40">
                                ({tp.reviews >= 1000 ? `${(tp.reviews / 1000).toFixed(1)}k` : tp.reviews})
                              </span>
                            ) : null}
                          </div>
                        ) : <span />}
                        {tp.timings && (
                          <span className="flex items-center gap-1 text-xs text-brown/60 font-medium">
                            <Clock size={11} className="text-saffron" /> {tp.timings}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-brown/65 leading-relaxed mb-3 line-clamp-2">
                      {dDesc(tp)}
                    </p>

                    {/* Highlights pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {dHighlights(tp).slice(0, 3).map((h) => (
                        <span key={h} className="rounded-full bg-saffron/10 border border-saffron/20 px-2.5 py-0.5 text-[11px] font-semibold text-saffron">
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-gold-glow hover:-translate-y-0.5">
                      View Temple & Book Pooja <ChevronRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Temple Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />

          {/* Panel */}
          <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-ivory shadow-2xl animate-fadeIn">

            {/* Hero image */}
            <div className="relative aspect-video overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
              <FitImage src={templeImg(selected)} alt={selected.name} loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/90 via-maroon-deep/40 to-transparent" />
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-saffron via-gold to-saffron" />

              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/60 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Name overlay */}
              <div className="absolute bottom-0 inset-x-0 p-5">
                <span className="rounded-full bg-gold/90 px-3 py-1 text-[11px] font-bold text-maroon mb-2 inline-block">
                  {dDeity(selected)}{selected.established ? ` • Est. ${selected.established}` : ""}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-white drop-shadow-md">
                  {dName(selected)}
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-cream/80 mt-1">
                  <MapPin size={13} /> {[selected.city, dState(selected)].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Rating + timings */}
              <div className="flex flex-wrap items-center gap-4">
                {selected.rating != null && (
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < Math.floor(selected.rating!) ? "text-saffron fill-saffron" : "text-gold/25"} />
                    ))}
                    <span className="text-sm font-bold text-maroon ml-1">{selected.rating}</span>
                    {selected.reviews ? <span className="text-xs text-brown/40">({selected.reviews.toLocaleString("en-IN")} reviews)</span> : null}
                  </div>
                )}
                {selected.timings && (
                  <span className="flex items-center gap-1.5 text-sm text-brown/60 font-medium">
                    <Clock size={13} className="text-saffron" /> {selected.timings}
                  </span>
                )}
                {selected.best_time && (
                  <span className="flex items-center gap-1.5 text-sm text-brown/60 font-medium">
                    🌤️ Best time: {selected.best_time}
                  </span>
                )}
              </div>

              {/* Description */}
              {dDesc(selected) && (
                <p className="text-sm text-brown/75 leading-relaxed">
                  {dDesc(selected)}
                </p>
              )}

              {/* Highlights */}
              {dHighlights(selected).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-maroon uppercase tracking-wider mb-2.5">✦ Famous For</p>
                  <div className="flex flex-wrap gap-2">
                    {dHighlights(selected).map((h) => (
                      <span key={h} className="rounded-full bg-saffron/10 border border-saffron/25 px-3 py-1.5 text-xs font-semibold text-saffron">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Main CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  to="/puja"
                  onClick={() => setSelected(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-3.5 text-sm font-bold text-white shadow-md hover:shadow-gold-glow hover:-translate-y-0.5 transition-all"
                >
                  🪔 Book a Pooja at This Temple
                </Link>
                <Link
                  to="/chadhava"
                  onClick={() => setSelected(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-gold/50 py-3.5 text-sm font-bold text-maroon hover:bg-gold/10 transition-all"
                >
                  🌺 Offer Chadhava
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Temples;
