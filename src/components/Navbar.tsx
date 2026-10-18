import React, { useEffect, useState, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, LogOut, Package, Phone, MessageCircle, ChevronRight, UserRound } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const PHONE = "+91 92863 45941";

const LangToggle = ({ className }: { className?: string }) => {
  const { lang, setLang } = useLanguage();
  return (
    <div className={cn("flex items-center rounded-full border border-line bg-surface p-0.5", className)}>
      {(["hi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-label={l === "en" ? "Switch to English" : "हिंदी में बदलें"}
          aria-pressed={lang === l}
          className={cn(
            "min-w-[38px] rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            lang === l ? "bg-maroon text-white" : "text-ink-soft hover:text-ink",
          )}
        >
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );
};

const CartLink = ({ count }: { count: number }) => (
  <NavLink
    to="/cart"
    className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted"
    aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
  >
    <ShoppingCart size={20} strokeWidth={1.75} />
    {count > 0 && (
      <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-saffron px-1 text-xs font-bold leading-none text-white" aria-hidden="true">
        {count}
      </span>
    )}
  </NavLink>
);

const Navbar = React.memo(() => {
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: t("nav_home") },
    { to: "/puja", label: t("nav_puja") },
    { to: "/chadhava", label: t("nav_chadhava") },
    { to: "/temples", label: t("nav_temples") },
    { to: "/astrology", label: t("nav_astrology") },
    { to: "/about", label: t("nav_about") },
  ];

  // Close the drawer on navigation, and lock page scroll while it is open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!userMenu) return;
    const close = () => setUserMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenu]);

  const handleLogout = async () => {
    await signOut();
    setUserMenu(false);
    nav("/");
  };

  const closeMenu = useCallback(() => setOpen(false), []);
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || user?.phone || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-background">
      <nav className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-2 py-2 text-[15px] font-medium transition-colors xl:px-3",
                    isActive ? "text-saffron-dark" : "text-ink hover:bg-surface-muted",
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="mr-1 hidden items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink xl:flex">
            <Phone size={16} strokeWidth={1.75} /> {PHONE}
          </a>
          <LangToggle />
          <CartLink count={totalItems} />

          {user ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenu(!userMenu);
                }}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm text-ink transition-colors hover:bg-surface-muted"
                aria-expanded={userMenu}
                aria-haspopup="true"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-maroon text-xs font-semibold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[100px] truncate font-medium min-[1360px]:inline">{userName}</span>
              </button>
              {userMenu && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-card"
                  onClick={(e) => e.stopPropagation()}
                  role="menu"
                >
                  <NavLink
                    to="/my-orders"
                    onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2 border-b border-line px-4 py-3 text-sm text-ink hover:bg-surface-muted"
                    role="menuitem"
                  >
                    <Package size={16} /> {t("nav_my_orders")}
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-surface-muted"
                    role="menuitem"
                  >
                    <LogOut size={16} /> {t("nav_logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/my-orders"
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted"
              aria-label={t("nav_my_orders")}
              title={t("nav_my_orders")}
            >
              <UserRound size={20} strokeWidth={1.75} />
            </NavLink>
          )}

          <NavLink to="/puja" className="btn-primary ml-1 min-h-[40px] px-5 text-sm">
            {t("nav_book_now")}
          </NavLink>
        </div>

        {/* Phone: language, cart, menu */}
        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <LangToggle />
          <CartLink count={totalItems} />
          <button
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-background lg:hidden safe-bottom">
          <ul className="container py-2">
            {[...links, { to: "/my-orders", label: t("nav_my_orders") }, { to: "/contact", label: t("nav_contact") }].map((l) => (
              <li key={l.to} className="border-b border-line last:border-0">
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn("flex min-h-[52px] items-center justify-between text-base font-medium", isActive ? "text-saffron-dark" : "text-ink")
                  }
                >
                  {l.label}
                  <ChevronRight size={18} className="text-ink-soft" />
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="container space-y-3 pb-6 pt-2">
            <NavLink to="/puja" onClick={closeMenu} className="btn-primary w-full">
              {t("nav_book_now")}
            </NavLink>
            <div className="rounded-xl bg-surface-muted p-4">
              <p className="text-sm font-semibold text-ink">{t("nav_help")}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href={whatsappLink(t("wa_msg_book"))} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-[44px] px-3 text-sm">
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="btn-secondary min-h-[44px] px-3 text-sm">
                  <Phone size={16} /> {t("ast_call")}
                </a>
              </div>
            </div>
            {user ? (
              <button onClick={() => { handleLogout(); closeMenu(); }} className="w-full py-2 text-sm font-medium text-ink-soft">
                {t("nav_logout")}
              </button>
            ) : (
              <NavLink to="/login" onClick={closeMenu} className="block w-full py-2 text-center text-sm font-medium text-ink-soft">
                {t("nav_login")}
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
});

export default Navbar;
