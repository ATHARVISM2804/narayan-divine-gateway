import { useState } from "react";
import { X, ChevronRight, Phone, User, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  pujaName: string;
  packageLabel: string;
  price: number;
  onConfirm: (name: string, phone: string) => void;
  onClose: () => void;
}

const LeadCaptureModal = ({ pujaName, packageLabel, price, onConfirm, onClose }: Props) => {
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim())                    return "Please enter your full name.";
    if (!/^\d{10}$/.test(phone.trim())) return "Enter a valid 10-digit WhatsApp number.";
    return "";
  };

  const handleNext = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);

    // Save lead to Supabase (fire-and-forget — don't block UX if it fails)
    try {
      await supabase.from("leads").insert({
        name:          name.trim(),
        phone:         phone.trim(),
        puja_name:     pujaName,
        package_label: packageLabel,
        price,
        source:        "puja_page",
      });
    } catch (_) {
      // Silently ignore — lead save failure should never block checkout
    }

    // Store in localStorage so checkout form can be pre-filled
    localStorage.setItem("nk_lead", JSON.stringify({ name: name.trim(), phone: phone.trim() }));

    setLoading(false);
    onConfirm(name.trim(), phone.trim());
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-ivory rounded-t-3xl sm:rounded-3xl shadow-2xl animate-fadeIn mx-0 sm:mx-4 overflow-hidden">

        {/* Gold top strip */}
        <div className="h-1 w-full bg-gradient-to-r from-saffron via-gold to-saffron" />

        {/* Close */}
        <button onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-cream border border-gold/30 text-brown/50 hover:text-maroon transition-colors">
          <X size={15} />
        </button>

        <div className="px-6 pt-6 pb-8">
          {/* Header */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-saffron/10 border border-saffron/20 px-3 py-1 mb-3">
              <span className="text-lg">🪔</span>
              <span className="text-xs font-bold text-saffron uppercase tracking-wide">Almost There!</span>
            </div>
            <h2 className="font-body text-xl font-bold text-maroon leading-snug">
              Fill Your Details for Puja
            </h2>
            <p className="text-sm text-brown/60 mt-1 leading-relaxed">
              Puja photos, videos & blessings will be shared on your WhatsApp.
            </p>
          </div>

          {/* Selected package pill */}
          <div className="flex items-center justify-between rounded-xl bg-saffron/8 border border-saffron/20 px-4 py-3 mb-5">
            <div>
              <p className="text-[11px] font-bold text-brown/50 uppercase tracking-wider">Selected Package</p>
              <p className="text-sm font-bold text-maroon mt-0.5">{pujaName} · {packageLabel}</p>
            </div>
            <p className="text-lg font-bold text-saffron">₹{price.toLocaleString("en-IN")}</p>
          </div>

          {/* WhatsApp Number */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-maroon mb-2">
              Enter Your WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-brown/50 mb-2 leading-snug">
              Puja updates, photos & video will be sent on this number.
            </p>
            <div className={`flex items-center gap-2 rounded-xl border-2 bg-cream px-3 py-3 transition-all ${
              error && !phone ? "border-red-400" : "border-gold/40 focus-within:border-saffron"
            }`}>
              {/* WhatsApp icon */}
              <svg viewBox="0 0 32 32" className="h-5 w-5 shrink-0 fill-green-500" aria-hidden="true">
                <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.908 1.885 7.054L2 30l7.144-1.87A14.034 14.034 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.6a11.62 11.62 0 0 1-5.923-1.62l-.425-.252-4.24 1.11 1.132-4.134-.277-.446A11.563 11.563 0 0 1 4.4 16.003c0-6.4 5.203-11.6 11.603-11.6s11.598 5.2 11.598 11.6-5.198 11.597-11.598 11.597zm6.36-8.68c-.348-.174-2.063-1.018-2.383-1.133-.32-.116-.552-.174-.786.174-.233.348-.902 1.133-1.107 1.366-.203.232-.407.26-.755.086-.348-.174-1.47-.543-2.8-1.727-1.034-.922-1.73-2.06-1.934-2.407-.203-.348-.022-.535.152-.707.157-.155.348-.406.523-.61.174-.202.232-.347.348-.578.116-.232.058-.435-.03-.61-.086-.173-.785-1.892-1.075-2.59-.284-.682-.573-.59-.785-.6l-.67-.012c-.232 0-.61.087-.928.435-.32.347-1.22 1.192-1.22 2.91s1.25 3.378 1.422 3.61c.174.232 2.46 3.757 5.96 5.27.834.36 1.483.575 1.99.736.836.267 1.598.23 2.2.14.672-.1 2.063-.843 2.353-1.658.29-.812.29-1.51.203-1.658-.087-.145-.32-.23-.67-.406z"/>
              </svg>
              <span className="text-sm font-bold text-brown/50 shrink-0">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                placeholder="Enter 10-digit number"
                style={{ outline: "none", boxShadow: "none" }}
                className="flex-1 bg-transparent text-sm font-semibold text-maroon outline-none focus:outline-none ring-0 focus:ring-0 appearance-none border-none focus:border-none placeholder:text-brown/30"
              />
              {phone.length === 10 && (
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-maroon mb-2">
              Enter Your Full Name <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center gap-2 rounded-xl border-2 bg-cream px-3 py-3 transition-all ${
              error && !name.trim() ? "border-red-400" : "border-gold/40 focus-within:border-saffron"
            }`}>
              <User size={16} className="text-brown/40 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Your full name"
                style={{ outline: "none", boxShadow: "none" }}
                className="flex-1 bg-transparent text-sm font-semibold text-maroon outline-none focus:outline-none ring-0 focus:ring-0 appearance-none border-none focus:border-none placeholder:text-brown/30"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 font-semibold mb-3 -mt-2">⚠️ {error}</p>
          )}

          {/* Benefits row */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { icon: "📸", text: "Puja Photos" },
              { icon: "🎥", text: "Live Video" },
              { icon: "🙏", text: "Prasad Delivery" },
            ].map((b) => (
              <span key={b.text} className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-[11px] font-semibold text-green-700">
                {b.icon} {b.text} on WhatsApp
              </span>
            ))}
          </div>

          {/* Next CTA */}
          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-4 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Saving…</>
            ) : (
              <>Next — Proceed to Pay <ChevronRight size={18} /></>
            )}
          </button>

          <p className="text-center text-[11px] text-brown/40 mt-3">🔒 Your details are safe & never shared with anyone</p>
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureModal;
