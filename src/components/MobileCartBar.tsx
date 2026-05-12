import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Floating cart bar shown ONLY on mobile devices (lg:hidden).
 * Hidden on checkout/order-success pages where it would overlap payment UI.
 */
const HIDDEN_PATHS = ["/checkout", "/order-success", "/cart"];

const MobileCartBar = React.memo(() => {
  const { totalItems, totalPrice } = useCart();
  const { t } = useLanguage();
  const { pathname } = useLocation();

  // Hide on checkout-related pages and when cart is empty
  if (totalItems === 0 || HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden animate-fadeIn safe-bottom">
      <div className="mx-3 mb-3 rounded-2xl border border-gold/60 bg-maroon-deep/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.25)] px-4 py-3">
        <Link to="/cart" className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center rounded-full bg-saffron text-white shadow-md">
              <ShoppingCart size={20} />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-maroon shadow-sm" aria-hidden="true">
                {totalItems}
              </span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-cream">
                {totalItems} {totalItems === 1 ? t("mcb_item") : t("mcb_items")} {t("mcb_in_cart")}
              </p>
              <p className="text-xs text-gold font-bold">
                ₹{totalPrice.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-saffron px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-gold hover:text-maroon min-h-[44px] flex items-center">
            {t("mcb_view_cart")}
          </span>
        </Link>
      </div>
    </div>
  );
});

export default MobileCartBar;
