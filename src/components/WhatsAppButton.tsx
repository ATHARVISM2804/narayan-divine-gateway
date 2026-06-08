import { useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLocation } from "react-router-dom";

const WA_NUMBER = "919286345941"; // +91 prefix
const CART_BAR_HIDDEN_PATHS = ["/checkout", "/order-success", "/cart"];

const WhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const { totalItems } = useCart();
  const { pathname } = useLocation();

  const cartBarVisible =
    totalItems > 0 &&
    !CART_BAR_HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "🙏 Jai Shri Ram! I need help with a Puja / Chadhava booking on Narayan Kripa."
  )}`;

  return (
    <div className={`fixed right-4 z-50 flex flex-col items-end gap-2 sm:bottom-8 sm:right-6 ${cartBarVisible ? "bottom-24" : "bottom-6"}`}>

      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="relative flex items-start gap-2 rounded-2xl bg-white border border-green-200 shadow-xl px-4 py-3 max-w-[220px] animate-fadeIn">
          {/* Close */}
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={10} />
          </button>

          {/* Avatar */}
          <div className="shrink-0 h-8 w-8 rounded-full bg-green-500 grid place-items-center text-white text-sm font-bold shadow-sm">
            NK
          </div>

          <div>
            <p className="text-[12px] font-bold text-gray-800 leading-tight">Narayan Kripa</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Hi! 🙏 How can we help you today?</p>
            <span className="inline-block mt-1.5 text-[10px] bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded-full border border-green-200">
              Typically replies instantly
            </span>
          </div>

          {/* Triangle pointer */}
          <div className="absolute -bottom-2 right-8 h-3 w-3 rotate-45 bg-white border-r border-b border-green-200" />
        </div>
      )}

      {/* WhatsApp FAB */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onClick={() => setShowTooltip(false)}
        className="relative flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)" }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-400 opacity-40 animate-ping" />

        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="h-9 w-9 fill-white relative z-10"
          aria-hidden="true"
        >
          <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.908 1.885 7.054L2 30l7.144-1.87A14.034 14.034 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.6a11.62 11.62 0 0 1-5.923-1.62l-.425-.252-4.24 1.11 1.132-4.134-.277-.446A11.563 11.563 0 0 1 4.4 16.003c0-6.4 5.203-11.6 11.603-11.6s11.598 5.2 11.598 11.6-5.198 11.597-11.598 11.597zm6.36-8.68c-.348-.174-2.063-1.018-2.383-1.133-.32-.116-.552-.174-.786.174-.233.348-.902 1.133-1.107 1.366-.203.232-.407.26-.755.086-.348-.174-1.47-.543-2.8-1.727-1.034-.922-1.73-2.06-1.934-2.407-.203-.348-.022-.535.152-.707.157-.155.348-.406.523-.61.174-.202.232-.347.348-.578.116-.232.058-.435-.03-.61-.086-.173-.785-1.892-1.075-2.59-.284-.682-.573-.59-.785-.6l-.67-.012c-.232 0-.61.087-.928.435-.32.347-1.22 1.192-1.22 2.91s1.25 3.378 1.422 3.61c.174.232 2.46 3.757 5.96 5.27.834.36 1.483.575 1.99.736.836.267 1.598.23 2.2.14.672-.1 2.063-.843 2.353-1.658.29-.812.29-1.51.203-1.658-.087-.145-.32-.23-.67-.406z" />
        </svg>
      </a>
    </div>
  );
};

export default WhatsAppButton;
