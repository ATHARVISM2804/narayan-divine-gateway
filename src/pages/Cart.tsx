import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import StorageImage from "@/components/StorageImage";
import ListingHeader from "@/components/shared/ListingHeader";
import StickyActionBar from "@/components/shared/StickyActionBar";
import TrustRow from "@/components/shared/TrustRow";
import { TempleIcon } from "@/components/icons";
import { formatInr } from "@/components/ui/typography";

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { t } = useLanguage();
  const nav = useNavigate();
  usePageTitle(`${t("cart_title")} | Narayan Kripa`);

  if (items.length === 0) {
    return (
      <main className="container flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-muted text-maroon">
          <ShoppingBag size={26} strokeWidth={1.75} />
        </span>
        <h1 className="mt-4 text-[22px] font-bold text-ink">{t("cart_empty_title")}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t("cart_empty_sub")}</p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link to="/puja" className="btn-primary">
            {t("btn_explore_puja")} <ArrowRight size={18} />
          </Link>
          <Link to="/chadhava" className="btn-secondary">
            {t("btn_view_chadhava")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-24 lg:pb-0">
      <ListingHeader title={t("cart_title")} subtitle={t("cart_subtitle")} />

      <div className="container py-6 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <div>
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 p-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                    {item.image ? (
                      <StorageImage src={item.image} width={80} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-ink-soft">
                        <TempleIcon size={22} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-semibold leading-snug text-ink">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {item.description && <p className="mt-0.5 line-clamp-1 text-[13px] text-ink-soft">{item.description}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex h-9 items-center overflow-hidden rounded-[10px] border border-line">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="grid h-full w-9 place-items-center text-ink hover:bg-surface-muted"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="tabular w-7 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid h-full w-9 place-items-center text-ink hover:bg-surface-muted"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="tabular text-base font-bold text-ink">{formatInr(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <Link to="/puja" className="text-sm font-semibold text-saffron-dark hover:underline">
                + {t("cart_continue")}
              </Link>
              <button onClick={clearCart} className="text-sm font-medium text-ink-soft hover:text-destructive">
                {t("cart_clear")}
              </button>
            </div>
          </div>

          <aside className="h-fit rounded-xl border border-line bg-surface p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-ink">{t("cart_order_summary")}</h2>
            <ul className="mt-4 space-y-2.5 border-b border-line pb-4 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="min-w-0 flex-1 truncate text-ink-muted">
                    {item.name} <span className="text-ink-soft">x {item.quantity}</span>
                  </span>
                  <span className="tabular shrink-0 font-medium text-ink">{formatInr(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-base font-semibold text-ink">{t("cart_total")}</span>
              <span className="tabular text-2xl font-bold text-saffron-dark">{formatInr(totalPrice)}</span>
            </div>
            <Link to="/checkout" className="btn-primary mt-5 hidden w-full lg:flex">
              {t("btn_proceed_checkout")} <ArrowRight size={18} />
            </Link>
            <TrustRow className="mt-5 border-t border-line pt-4" />
          </aside>
        </div>
      </div>

      <StickyActionBar
        className="lg:hidden"
        title={formatInr(totalPrice)}
        subtitle={`${totalItems} ${totalItems === 1 ? t("mcb_item") : t("mcb_items")}`}
        cta={t("btn_continue")}
        onClick={() => nav("/checkout")}
      />
    </main>
  );
};

export default Cart;
