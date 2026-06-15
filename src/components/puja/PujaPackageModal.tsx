import { useState } from "react";
import { X, Check, ChevronRight, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Puja } from "@/lib/supabase";
import LeadCaptureModal from "./LeadCaptureModal";

import pkgSingle  from "@/assets/pkg-single.png";
import pkgCouple  from "@/assets/pkg-couple.png";
import pkgFamily4 from "@/assets/pkg-family4.png";
import pkgFamily6 from "@/assets/pkg-family6.png";

const getTierImage = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("6") || l.includes("joint"))  return pkgFamily6;
  if (l.includes("4") || l.includes("family"))  return pkgFamily4;
  if (l.includes("couple") || l.includes("2"))  return pkgCouple;
  return pkgSingle;
};

const getPersonCount = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("6") || l.includes("joint"))  return "6 Person";
  if (l.includes("4") || l.includes("family"))  return "4 Person";
  if (l.includes("couple") || l.includes("2"))  return "2 Person";
  return "1 Person";
};

interface Props {
  puja: Puja;
  onClose: () => void;
}

const PujaPackageModal = ({ puja, onClose }: Props) => {
  const { t, lang } = useLanguage();
  const { addItem }  = useCart();
  const nav          = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showLead,    setShowLead]    = useState(false);

  const includes        = (lang === "hi" && puja.includes_hi?.length) ? puja.includes_hi : puja.includes;
  const fallbackIncludes = [t("rcv1"), t("rcv2"), t("rcv3"), t("rcv4"), t("rcv5")];
  const displayIncludes  = includes?.length ? includes : fallbackIncludes;
  const selectedTier     = (puja.prices || [])[selectedIdx];

  // Step 1: open lead modal
  const handleProceed = () => {
    if (!selectedTier) return;
    setShowLead(true);
  };

  // Step 2: lead captured → add to cart → go to checkout
  const handleLeadConfirm = (_name: string, _phone: string) => {
    if (!selectedTier) return;
    addItem({
      id:          `puja-${puja.id}-${selectedTier.label}`,
      name:        `${puja.name} (${selectedTier.label})`,
      description: `${puja.date} • ${puja.location}`,
      price:       selectedTier.price,
      category:    "puja",
      image:       puja.image_url || undefined,
    });
    toast.success("Proceeding to payment…");
    nav("/checkout");
    onClose();
  };

  const handleAddCart = () => {
    if (!selectedTier) return;
    addItem({
      id:          `puja-${puja.id}-${selectedTier.label}`,
      name:        `${puja.name} (${selectedTier.label})`,
      description: `${puja.date} • ${puja.location}`,
      price:       selectedTier.price,
      category:    "puja",
      image:       puja.image_url || undefined,
    });
    toast.success(`${selectedTier.label} added to cart!`);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal — uses flex column + max-h to fit viewport without scrolling */}
        <div className="relative w-full max-w-2xl bg-ivory rounded-t-2xl sm:rounded-2xl shadow-2xl animate-fadeIn mx-0 sm:mx-4 flex flex-col"
             style={{ maxHeight: 'min(94vh, 100dvh - 16px)' }}>
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-cream border border-gold/30 text-brown/50 hover:text-maroon hover:bg-gold/10 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header — compact */}
          <div className="px-4 pt-4 pb-2.5 sm:px-5 sm:pt-5 sm:pb-4 border-b border-gold/20 shrink-0">
            <h3 className="font-body text-base sm:text-lg font-bold text-maroon pr-8">{t("pd_includes")}</h3>
          </div>

          {/* Includes list — compact horizontal scroll on mobile, vertical on desktop */}
          <div className="px-4 py-2.5 sm:px-5 sm:py-4 border-b border-gold/20 shrink-0">
            {/* Mobile: compact horizontal chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide sm:hidden pb-1">
              {displayIncludes.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-green-50 border border-green-200/60 px-2.5 py-1 text-[11px] font-semibold text-brown/70 shrink-0">
                  <Check size={10} className="text-green-500 shrink-0" /> {item}
                </span>
              ))}
            </div>
            {/* Desktop: vertical list */}
            <div className="hidden sm:block space-y-2">
              {displayIncludes.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] font-medium text-brown/80 leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Package selection — scrollable only if truly needed */}
          <div className="px-4 py-3 sm:px-5 sm:py-4 flex-1 min-h-0 overflow-y-auto">
            <h4 className="font-body text-sm font-bold text-maroon mb-2 sm:mb-3">{t("pd_packages")}</h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {(puja.prices || []).map((tier, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={tier.label}
                    onClick={() => setSelectedIdx(idx)}
                    className={`relative rounded-xl sm:rounded-2xl border-2 overflow-hidden text-center transition-all ${
                      isSelected
                        ? "border-saffron bg-saffron/5 shadow-md -translate-y-0.5"
                        : "border-gold/30 bg-cream hover:border-saffron/50"
                    }`}
                  >
                    {/* Radio indicator */}
                    <div className={`absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                      isSelected ? "border-saffron bg-saffron" : "border-gold/40 bg-white"
                    }`}>
                      {isSelected && <Check size={8} className="text-white sm:hidden" strokeWidth={3} />}
                      {isSelected && <Check size={10} className="text-white hidden sm:block" strokeWidth={3} />}
                    </div>

                    {/* Person badge */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10">
                      <span className={`inline-block text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-saffron text-white" : "bg-black/40 text-white"
                      }`}>
                        {getPersonCount(tier.label)}
                      </span>
                    </div>

                    {/* Image — smaller on mobile */}
                    <div className="h-20 sm:h-32 w-full overflow-hidden">
                      <img
                        src={getTierImage(tier.label)}
                        alt={tier.label}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Label + price — compact on mobile */}
                    <div className={`px-2 py-1.5 sm:px-3 sm:py-2.5 ${isSelected ? "bg-saffron/5" : "bg-cream"}`}>
                      <p className="text-xs sm:text-sm font-bold text-maroon leading-tight">{tier.label}</p>
                      <p className="text-sm sm:text-base font-bold text-saffron mt-0.5">₹{tier.price.toLocaleString("en-IN")}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 justify-center mt-3 sm:mt-4">
              {[
                { icon: "🔒", text: t("trust_secure") },
                { icon: "🪔", text: t("trust_rituals") },
                { icon: "📦", text: t("trust_prasad_del") },
              ].map((b) => (
                <span key={b.text} className="flex items-center gap-1 text-[10px] font-semibold text-brown/50">
                  {b.icon} {b.text}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom bar — always visible, not sticky */}
          {selectedTier && (
            <div className="bg-gradient-to-r from-maroon to-maroon-deep px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3 rounded-b-2xl shrink-0"
                 style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gold text-lg sm:text-xl leading-tight">₹{selectedTier.price.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-cream/70 font-semibold truncate">{selectedTier.label}</p>
              </div>
              <button
                onClick={handleAddCart}
                className="shrink-0 grid h-10 w-10 place-items-center rounded-xl border border-gold/30 bg-white/10 text-gold hover:bg-white/20 transition-colors"
              >
                <ShoppingCart size={16} />
              </button>
              <button
                onClick={handleProceed}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-saffron to-gold px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-gold-glow hover:-translate-y-0.5"
              >
                Proceed Now <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lead Capture Modal */}
      {showLead && selectedTier && (
        <LeadCaptureModal
          pujaName={puja.name}
          packageLabel={selectedTier.label}
          price={selectedTier.price}
          onConfirm={handleLeadConfirm}
          onClose={() => setShowLead(false)}
        />
      )}
    </>
  );
};

export default PujaPackageModal;
