import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";

const Cart = () => {
  usePageTitle("Your Cart — Narayan Kripa");
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] bg-background flex items-center justify-center">
        <div className="text-center px-4 py-20">
          <div className="mx-auto mb-6 grid h-28 w-28 place-items-center rounded-full bg-gold/20">
            <ShoppingBag size={48} className="text-saffron" />
          </div>
          <h1 className="font-display text-3xl text-maroon md:text-4xl">{t("cart_empty_title")}</h1>
          <p className="mt-3 font-serif italic text-brown/70 max-w-md mx-auto">
            {t("cart_empty_sub")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/puja"
              className="rounded-full bg-saffron px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-maroon hover:shadow-lg">
              {t("btn_explore_puja")}
            </Link>
            <Link to="/chadhava"
              className="rounded-full border-2 border-gold px-7 py-3 text-sm font-semibold text-maroon transition-all hover:bg-gold hover:shadow-lg">
              {t("btn_view_chadhava")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon via-maroon-deep to-maroon py-10">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-2 text-gold/80 hover:text-gold text-sm mb-3 transition-colors">
            <ArrowLeft size={14} /> {t("cart_continue")}
          </Link>
          <h1 className="font-display text-3xl text-gold md:text-4xl flex items-center gap-3">
            <ShoppingCart size={32} /> {t("cart_title")}
          </h1>
          <p className="mt-1 font-serif italic text-cream/70">{t("cart_subtitle")}</p>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items list */}
          <div className="space-y-4">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[1fr_120px_140px_48px] gap-4 items-center px-5 py-3 rounded-xl bg-gold/10 border border-gold/30 text-xs font-bold uppercase tracking-widest text-maroon">
              <span>{t("cart_item")}</span>
              <span className="text-center">{t("cart_qty")}</span>
              <span className="text-right">{t("cart_subtotal")}</span>
              <span></span>
            </div>

            {items.map((item) => (
              <div key={item.id}
                className="group relative flex flex-col md:grid md:grid-cols-[1fr_120px_140px_48px] gap-4 md:items-center rounded-2xl border border-gold/40 bg-ivory p-4 md:p-5 shadow-soft transition-all hover:border-saffron/50 hover:shadow-md">
                <button onClick={() => removeItem(item.id)}
                  className="absolute right-4 top-4 md:static md:col-start-4 grid h-8 w-8 place-items-center rounded-full bg-cream/80 md:bg-transparent text-brown/40 transition-all hover:bg-red-50 hover:text-red-500 z-10 shadow-sm md:shadow-none"
                  aria-label="Remove item">
                  <Trash2 size={16} />
                </button>

                <div className="flex items-start md:items-center gap-4 pr-10 md:pr-0">
                  {item.image ? (
                    <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-xl border border-gold/30">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="grid h-16 w-16 md:h-20 md:w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-saffron/20 to-gold/30 text-2xl md:text-3xl">
                      {item.category === "puja" ? "🪔" : "🌺"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-[15px] md:text-base text-maroon leading-tight pr-2">{item.name}</h3>
                    <p className="mt-1 text-[11px] md:text-xs text-brown/60 line-clamp-2">{item.description}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-maroon">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:contents pt-3 md:pt-0 border-t border-gold/20 md:border-0 mt-1 md:mt-0">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-1 rounded-full border border-gold/50 bg-cream shadow-inner">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-maroon transition-colors hover:bg-gold/30"
                        aria-label="Decrease quantity"><Minus size={14} /></button>
                      <span className="w-6 text-center text-sm font-bold text-maroon">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-maroon transition-colors hover:bg-gold/30"
                        aria-label="Increase quantity"><Plus size={14} /></button>
                    </div>
                  </div>
                  <p className="text-right font-sans text-lg font-bold text-saffron md:col-start-3">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <button onClick={clearCart}
                className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100 hover:text-red-700 hover:shadow">
                <Trash2 size={14} /> {t("cart_clear")}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit sticky top-32 rounded-2xl border border-gold/60 bg-gradient-to-b from-ivory to-cream p-6 shadow-lg relative overflow-hidden">
            <h2 className="font-display text-2xl text-maroon mb-6 flex items-center gap-2">
              <ShoppingBag size={20} className="text-gold" /> {t("cart_order_summary")}
            </h2>

            <div className="space-y-4 border-b border-gold/30 pb-6 relative z-10">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-[13px]">
                  <span className="text-brown/90 truncate pr-4 flex-1">
                    {item.name} <span className="text-brown/50 ml-1">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-maroon whitespace-nowrap shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 mb-8 relative z-10">
              <span className="font-display text-xl text-maroon">{t("cart_total")}</span>
              <span className="font-sans text-3xl font-bold text-saffron">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <Link to="/checkout"
              className="relative block w-full overflow-hidden rounded-full bg-gradient-to-r from-saffron to-maroon py-4 text-center text-[15px] font-bold text-white shadow-md transition-all hover:shadow-gold-glow hover:-translate-y-0.5 z-10 group">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t("btn_proceed_checkout")} <ArrowLeft size={16} className="rotate-180 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <p className="mt-5 text-center text-[11px] text-brown/60 font-serif italic relative z-10">
              {t("cart_secure")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
