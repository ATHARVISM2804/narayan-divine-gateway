import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { showsCartBar } from "@/lib/stickyBars";
import { formatInr } from "@/components/ui/typography";

/** Floating cart summary on phones. Hidden on cart/checkout pages and on
    detail pages, which have their own booking bar. */
const MobileCartBar = React.memo(() => {
  const { totalItems, totalPrice } = useCart();
  const { t } = useLanguage();
  const { pathname } = useLocation();

  if (!showsCartBar(pathname, totalItems)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-raised lg:hidden safe-bottom">
      <Link to="/cart" className="container flex items-center justify-between gap-3 py-2.5">
        <span className="flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-surface-muted text-maroon">
            <ShoppingCart size={18} />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-saffron text-xs font-bold text-white" aria-hidden="true">
              {totalItems}
            </span>
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">
              {totalItems} {totalItems === 1 ? t("mcb_item") : t("mcb_items")} {t("mcb_in_cart")}
            </span>
            <span className="tabular block text-sm font-bold text-saffron-dark">{formatInr(totalPrice)}</span>
          </span>
        </span>
        <span className="btn-primary min-h-[44px] px-5">
          {t("mcb_view_cart")} <ArrowRight size={16} />
        </span>
      </Link>
    </div>
  );
});

export default MobileCartBar;
