import { useState } from "react";
import { X, Check, ChevronRight, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Puja } from "@/lib/supabase";

import pkgSingle from "@/assets/pkg-single.png";
import pkgCouple from "@/assets/pkg-couple.png";
import pkgFamily4 from "@/assets/pkg-family4.png";
import pkgFamily6 from "@/assets/pkg-family6.png";

const getTierImage = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("6") || l.includes("joint")) return pkgFamily6;
  if (l.includes("4") || l.includes("family")) return pkgFamily4;
  if (l.includes("couple") || l.includes("2")) return pkgCouple;
  return pkgSingle;
};

const getPersonCount = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("6") || l.includes("joint")) return "6 Person";
  if (l.includes("4") || l.includes("family")) return "4 Person";
  if (l.includes("couple") || l.includes("2")) return "2 Person";
  return "1 Person";
};

interface Props {
  puja: Puja;
  onClose: () => void;
}

const PujaPackageModal = ({ puja, onClose }: Props) => {
  const { t, lang } = useLanguage();
  const { addItem } = useCart();
  const nav = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const includes = (lang === "hi" && puja.includes_hi?.length) ? puja.includes_hi : puja.includes;
  const fallbackIncludes = [t("rcv1"), t("rcv2"), t("rcv3"), t("rcv4"), t("rcv5")];
  const displayIncludes = includes?.length ? includes : fallbackIncludes;
  const selectedTier = (puja.prices || [])[selectedIdx];

  const handleProceed = () => {
    if (!selectedTier) return;
    addItem({
      id: `puja-${puja.id}-${selectedTier.label}`,
      name: `${puja.name} (${selectedTier.label})`,
      description: `${puja.date} • ${puja.location}`,
      price: selectedTier.price,
      category: "puja",
      image: puja.image_url || undefined,
    });
    toast.success("Proceeding to payment…");
    nav("/checkout");
    onClose();
  };

  const handleAddCart = () => {
    if (!selectedTier) return;
    addItem({
      id: `puja-${puja.id}-${selectedTier.label}`,
      name: `${puja.name} (${selectedTier.label})`,
      description: `${puja.date} • ${puja.location}`,
      price: selectedTier.price,
      category: "puja",
      image: puja.image_url || undefined,
    });
    toast.success(`${selectedTier.label} added to cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ivory rounded-t-2xl sm:rounded-2xl shadow-2xl animate-fadeIn mx-0 sm:mx-4">
        {/* Close */}
        <button onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-cream border border-gold/30 text-brown/50 hover:text-maroon hover:bg-gold/10 transition-colors">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gold/20">
          <h3 className="font-body text-lg font-bold text-maroon pr-8">{t("pd_includes")}</h3>
        </div>

        {/* Includes list */}
        <div className="px-5 py-4 space-y-2.5 border-b border-gold/20">
          {displayIncludes.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium text-brown/80 leading-snug">{item}</p>
            </div>
          ))}
        </div>

        {/* Package selection */}
        <div className="px-5 py-4">
          <h4 className="font-body text-sm font-bold text-maroon mb-3">{t("pd_packages")}</h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(puja.prices || []).map((tier, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button key={tier.label} onClick={() => setSelectedIdx(idx)}
                  className={`relative rounded-xl border-2 p-2.5 text-center transition-all ${
                    isSelected
                      ? "border-saffron bg-saffron/5 shadow-md"
                      : "border-gold/30 bg-cream hover:border-saffron/50"
                  }`}>
                  {/* Radio indicator */}
                  <div className={`absolute top-2 right-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? "border-saffron bg-saffron" : "border-gold/40 bg-white"
                  }`}>
                    {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>

                  {/* Person badge */}
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${
                    isSelected ? "bg-saffron text-white" : "bg-gold/15 text-maroon"
                  }`}>
                    {getPersonCount(tier.label)}
                  </span>

                  {/* Image */}
                  <div className="h-12 w-12 mx-auto mb-1.5">
                    <img src={getTierImage(tier.label)} alt={tier.label} className="h-full w-full object-contain opacity-80" />
                  </div>

                  {/* Label */}
                  <p className="text-[11px] font-bold text-maroon leading-tight">{tier.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust badges */}
        <div className="px-5 pb-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { icon: "🔒", text: t("trust_secure") },
              { icon: "🪔", text: t("trust_rituals") },
              { icon: "📦", text: t("trust_prasad_del") },
            ].map(b => (
              <span key={b.text} className="flex items-center gap-1 text-[10px] font-semibold text-brown/50">
                {b.icon} {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* Sticky bottom bar */}
        {selectedTier && (
          <div className="sticky bottom-0 bg-gradient-to-r from-maroon to-maroon-deep px-5 py-3.5 flex items-center gap-3 rounded-b-2xl">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gold text-xl leading-tight">₹{selectedTier.price.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-cream/70 font-semibold truncate">{selectedTier.label}</p>
            </div>
            <button onClick={handleAddCart}
              className="shrink-0 grid h-10 w-10 place-items-center rounded-xl border border-gold/30 bg-white/10 text-gold hover:bg-white/20 transition-colors">
              <ShoppingCart size={16} />
            </button>
            <button onClick={handleProceed}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-saffron to-gold px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-gold-glow hover:-translate-y-0.5">
              {t("btn_buy_now")} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PujaPackageModal;
