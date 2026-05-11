import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCart } from "@/context/CartContext";
import { supabase, type Puja } from "@/lib/supabase";
import { Calendar, ShoppingCart, Check, Loader2, Shield, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

// Package tier images
import pkgSingle from "@/assets/pkg-single.png";
import pkgCouple from "@/assets/pkg-couple.png";
import pkgFamily4 from "@/assets/pkg-family4.png";
import pkgFamily6 from "@/assets/pkg-family6.png";

/** Maps a tier label to the corresponding package image */
const getTierImage = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("6") || l.includes("joint")) return pkgFamily6;
  if (l.includes("4") || l.includes("family")) return pkgFamily4;
  if (l.includes("couple") || l.includes("2")) return pkgCouple;
  return pkgSingle;
};

/** Parse date strings like "13 May", "25 May 2026", etc. → Date at end of that day */
const parsePujaDate = (dateStr: string): Date => {
  const year = new Date().getFullYear();
  // Try adding current year if no year present
  const hasYear = /\d{4}/.test(dateStr);
  const fullStr = hasYear ? dateStr : `${dateStr} ${year}`;
  const d = new Date(`${fullStr} 23:59:59`);
  // If date already passed this year, try next year
  if (isNaN(d.getTime()) || d < new Date()) {
    const next = new Date(`${dateStr} ${year + 1} 23:59:59`);
    return isNaN(next.getTime()) ? d : next;
  }
  return d;
};

const getTimeLeft = (target: Date) => {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
};

const PujaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { addItem } = useCart();
  const { t, lang } = useLanguage();

  const [puja, setPuja] = useState<Puja | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<{ label: string; price: number } | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0, expired: false });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  usePageTitle(puja ? `${puja.name} — Narayan Kripa` : "Loading…");

  useEffect(() => {
    if (!id) return;
    supabase
      .from("pujas")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .single()
      .then(({ data, error }) => {
        if (error || !data) { nav("/puja", { replace: true }); return; }
        setPuja(data as Puja);
        setLoading(false);
      });
  }, [id, nav]);

  // Start countdown when puja loads
  useEffect(() => {
    if (!puja?.date) return;
    const target = parsePujaDate(puja.date);
    setTimeLeft(getTimeLeft(target));
    timerRef.current = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [puja?.date]);

  const handleAdd = (goToCheckout = false) => {
    if (!puja || !selectedTier) return;
    const itemId = `puja-${puja.id}-${selectedTier.label}`;
    addItem({
      id: itemId,
      name: `${puja.name} (${selectedTier.label})`,
      description: `${puja.date} • ${puja.location}`,
      price: selectedTier.price,
      category: "puja",
      image: puja.image_url || undefined,
    });
    setAddedId(itemId);
    if (goToCheckout) {
      toast.success("Proceeding to payment…");
      nav("/checkout");
    } else {
      toast.success(`${puja.name} (${selectedTier.label}) added to cart!`);
      setTimeout(() => setAddedId(null), 1500);
    }
  };

  if (loading) return (
    <main className="min-h-[60vh] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-saffron" />
        <p className="text-brown/60 font-serif italic">Loading puja details…</p>
      </div>
    </main>
  );

  if (!puja) return null;

  const displayName = (lang === 'hi' && puja.name_hi) ? puja.name_hi : puja.name;
  const displayLocation = (lang === 'hi' && puja.location_hi) ? puja.location_hi : puja.location;
  const displayBenefit = (lang === 'hi' && puja.benefit_hi) ? puja.benefit_hi : puja.benefit;
  const minPrice = Math.min(...(puja.prices || []).map((t) => t.price));

  return (
    <main className="bg-background min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-maroon via-maroon-deep to-maroon">
        {puja.image_url && (
          <img src={puja.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/60 via-maroon-deep/80 to-maroon" />

        <div className="container relative py-10 md:py-14">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Image */}
            <div className="w-full md:w-[420px] lg:w-[480px] shrink-0 rounded-2xl overflow-hidden border-2 border-gold/30 shadow-2xl">
              {puja.image_url ? (
                <img src={puja.image_url} alt={puja.name} className="w-full h-72 md:h-96 object-cover" />
              ) : (
                <div className="w-full h-72 md:h-96 bg-gradient-to-br from-sacred/30 to-gold/20 grid place-items-center">
                  <span className="text-7xl drop-shadow-lg">🪔</span>
                </div>
              )}
            </div>

            {/* Title + Info */}
            <div className="flex-1">
              <h1 className="font-body text-2xl md:text-3xl font-bold text-gold leading-snug">{displayName}</h1>

              <div className="mt-4 flex flex-col gap-2">
                <span className="flex items-center gap-2 text-cream/90 text-base font-semibold">
                  <Calendar size={16} className="text-gold" /> {puja.date}
                </span>
                <span className="flex items-center gap-2 text-cream/90 text-base font-semibold">
                  <span className="text-lg leading-none">🛕</span> {displayLocation}
                </span>
              </div>

              {/* ── Countdown Timer ── */}
              <div className="mt-5">
                {timeLeft.expired ? (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-red-900/40 border border-red-500/30 px-4 py-2.5">
                  <span className="text-red-300 font-bold text-sm">{t("timer_expired")}</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-cream/60 text-xs font-semibold uppercase tracking-wider mb-2">
                      {t("timer_label")}
                    </p>
                    <div className="flex items-center gap-2">
                      {[
                        { val: timeLeft.days,  label: t("timer_days")  },
                        { val: timeLeft.hours, label: t("timer_hours") },
                        { val: timeLeft.mins,  label: t("timer_mins")  },
                        { val: timeLeft.secs,  label: t("timer_secs")  },
                      ].map(({ val, label }, i) => (
                        <div key={label} className="flex items-center gap-2">
                          <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[52px] border ${
                            timeLeft.days === 0
                              ? "bg-red-900/50 border-red-500/40"
                              : "bg-maroon-deep/60 border-gold/20"
                          }`}>
                            <span className={`font-bold text-xl leading-none tabular-nums ${
                              timeLeft.days === 0 ? "text-red-300" : "text-gold"
                            }`}>
                              {String(val).padStart(2, "0")}
                            </span>
                            <span className="text-[10px] font-semibold text-cream/50 mt-0.5">{label}</span>
                          </div>
                          {i < 3 && <span className="text-gold/60 font-bold text-lg mb-3">:</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {displayBenefit && (
                <div className="mt-4 rounded-xl bg-white/10 border border-gold/30 px-4 py-3">
                  <p className="text-base font-bold text-gold leading-snug">✦ {displayBenefit}</p>
                </div>
              )}

              <div className="mt-6 flex items-end gap-2">
                <span className="text-cream/60 text-sm">Starting from</span>
                <span className="font-sans text-3xl font-bold text-gold">
                  ₹{minPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Trust badges — visible in hero on desktop */}
              <div className="mt-6 hidden md:flex flex-wrap gap-2">
                {[
                  { icon: "🪔", text: "Authentic Rituals" },
                  { icon: "📦", text: "Prasad Delivery" },
                  { icon: "🔒", text: "Secure Payment" },
                ].map(b => (
                  <span key={b.text} className="flex items-center gap-1.5 rounded-full bg-white/10 border border-gold/20 px-3 py-1.5 text-xs font-semibold text-cream/80">
                    {b.icon} {b.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Package Selection ── */}
      <section className="bg-cream border-b border-gold/20 py-10">
        <div className="container">
          <h2 className="font-body text-xl md:text-2xl font-bold text-maroon mb-1 flex items-center gap-2">
            {t("select_package")}
          </h2>
          <p className="text-sm text-brown/60 font-semibold mb-6">{t("select_package_sub")}</p>

          {/* Package Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(puja.prices || []).map((tier) => {
              const isSelected = selectedTier?.label === tier.label;
              const itemId = `puja-${puja.id}-${tier.label}`;
              const justAdded = addedId === itemId;
              return (
                <button
                  key={tier.label}
                  onClick={() => setSelectedTier(isSelected ? null : tier)}
                  className={`relative group rounded-2xl overflow-hidden border-2 text-left transition-all duration-300 shadow-soft hover:-translate-y-1 hover:shadow-lg ${
                    isSelected
                      ? "border-saffron shadow-lg -translate-y-1"
                      : justAdded
                      ? "border-green-500"
                      : "border-gold/30 hover:border-saffron/60"
                  }`}
                >
                  {/* Card Image */}
                  <div className="relative h-36 md:h-44 overflow-hidden bg-gradient-to-br from-saffron/20 via-gold/15 to-maroon/10">
                    <img
                      src={getTierImage(tier.label)}
                      alt={tier.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Selected checkmark overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-saffron/20" />
                    )}
                    {/* Selected badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-saffron flex items-center justify-center shadow-md">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                    {justAdded && !isSelected && (
                      <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className={`p-3 md:p-4 transition-colors ${isSelected ? "bg-saffron/5" : "bg-ivory"}`}>
                    <p className="font-bold text-maroon text-sm md:text-base leading-snug">{tier.label}</p>
                    <p className={`font-bold text-lg md:text-xl mt-1 ${isSelected ? "text-saffron" : "text-saffron"}`}>
                      ₹{tier.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons — appear when a package is selected */}
          {selectedTier && (
            <div className="mt-6 rounded-2xl border-2 border-saffron/30 bg-ivory p-5 shadow-soft animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-brown/60 font-semibold">{t("selected_package")}</p>
                  <p className="font-bold text-maroon text-lg mt-0.5">{selectedTier.label}</p>
                  <p className="font-bold text-saffron text-2xl">₹{selectedTier.price.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:shrink-0">
                  <button
                    onClick={() => handleAdd(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon px-6 py-4 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5"
                  >
                    {t("btn_buy_now")} <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => handleAdd(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-gold/50 bg-cream px-6 py-4 text-[14px] font-bold text-maroon transition-all hover:bg-gold/10 hover:border-saffron"
                  >
                    <ShoppingCart size={16} className="text-saffron" /> {t("btn_add_cart")}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-brown/40 font-serif italic">{t("secure_pay")}</p>
            </div>
          )}

          {!selectedTier && (
            <p className="mt-5 text-center text-sm text-brown/50 font-semibold">{t("tap_to_select")}</p>
          )}
        </div>
      </section>

      {/* ── Content — What You Get + How It Works ── */}
      <div className="container py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {/* Trust badges */}
          <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-3">
            {[
              { icon: "🪔", text: t("trust_rituals") },
              { icon: "🧑‍🦳", text: t("trust_pandits") },
              { icon: "📦", text: t("trust_prasad_del") },
              { icon: "📞", text: t("trust_support") },
            ].map((b) => (
              <span key={b.text} className="flex items-center gap-2 rounded-xl bg-ivory border border-gold/30 px-4 py-2.5 text-sm font-semibold text-maroon shadow-soft">
                <span className="text-lg">{b.icon}</span> {b.text}
              </span>
            ))}
          </div>

          {/* What You Receive */}
          <div className="md:col-span-1 xl:col-span-2 rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
            <h2 className="font-body text-xl font-bold text-maroon mb-4 flex items-center gap-2">
              <Shield size={18} className="text-saffron" /> {t("what_receive")}
            </h2>
            <ul className="space-y-3">
              {[t("rcv1"), t("rcv2"), t("rcv3"), t("rcv4"), t("rcv5")].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium text-brown/80">
                  <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* How It Works */}
          <div className="rounded-2xl border border-gold/40 bg-ivory p-6 shadow-soft">
            <h2 className="font-body text-xl font-bold text-maroon mb-4">{t("how_works")}</h2>
            <div className="flex flex-col gap-5">
              {[
                { step: "1", title: t("step1t"), desc: t("step1d") },
                { step: "2", title: t("step2t"), desc: t("step2d") },
                { step: "3", title: t("step3t"), desc: t("step3d") },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-white font-bold text-sm shadow-md">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-bold text-maroon text-sm">{s.title}</p>
                    <p className="text-xs text-brown/60 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </main>
  );
};

export default PujaDetail;
