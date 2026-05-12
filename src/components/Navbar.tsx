import { useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, LogOut, Package } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const nav = useNavigate();

  const links = [
    { to: "/", label: t("nav_home") },
    { to: "/puja", label: t("nav_puja") },
    { to: "/chadhava", label: t("nav_chadhava") },
    { to: "/astrology", label: t("nav_astrology") },
    { to: "/temples", label: t("nav_temples") },
    { to: "/contact", label: t("nav_contact") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
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

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  /* ── Language toggle pill ── */
  const LangToggle = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex items-center gap-1 rounded-full border border-gold/40 bg-white/10 p-0.5 ${mobile ? "mx-3 mt-2" : ""}`}
      role="radiogroup"
      aria-label="Language selection"
    >
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          role="radio"
          aria-checked={lang === l}
          aria-label={l === "en" ? "Switch to English" : "हिंदी में बदलें"}
          className={`flex items-center justify-center rounded-full px-4 py-2 min-w-[44px] min-h-[44px] text-xs font-bold transition-all ${
            lang === l
              ? "bg-saffron text-white shadow-sm"
              : "text-brown/60 hover:text-maroon"
          }`}
        >
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-cream/95 backdrop-blur shadow-md" : "bg-cream/85 backdrop-blur-sm"
      }`}
    >
      {/* Top sacred ribbon */}
      <div className="hidden lg:block bg-gradient-to-r from-maroon via-maroon-deep to-maroon text-gold/90 text-[11px]">
        <div className="container flex h-7 items-center justify-between font-serif italic tracking-wide">
          <span>ॐ  सर्वे भवन्तु सुखिनः  •  May all beings be happy</span>
          <div className="flex items-center gap-3">
            <span className="hidden xl:inline">📞 +91 92863 45941  •  🕐 Mon–Sat, 9 AM – 7 PM IST</span>
            {/* Language toggle in ribbon */}
            <div className="flex items-center gap-0.5 rounded-full border border-gold/30 bg-white/10 p-0.5">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-label={l === "en" ? "Switch to English" : "हिंदी में बदलें"}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
                    lang === l ? "bg-saffron text-white" : "text-gold/70 hover:text-gold"
                  }`}
                >
                  {l === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className="container flex h-16 items-center justify-between lg:h-20">
        <Logo />

        {/* Desktop nav — visible at lg (1024px+) */}
        <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  isActive
                    ? "font-semibold text-brown border-b-2 border-saffron pb-1 transition-colors"
                    : "text-brown hover:text-saffron transition-colors"
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {/* Cart icon */}
          <NavLink
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-gold text-maroon transition-colors hover:bg-gold/20"
            aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-saffron text-[10px] font-bold text-white shadow-sm animate-scaleIn" aria-hidden="true">
                {totalItems}
              </span>
            )}
          </NavLink>

          {user ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setUserMenu(!userMenu); }}
                className="flex items-center gap-2 rounded-full border border-gold px-3 py-2 text-sm text-maroon hover:bg-gold/20 transition-colors"
                aria-expanded={userMenu}
                aria-haspopup="true"
              >
                <div className="grid h-6 w-6 place-items-center rounded-full bg-saffron text-white text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate font-medium">{userName}</span>
              </button>
              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gold/40 bg-ivory shadow-lg overflow-hidden animate-fadeIn z-50"
                  onClick={(e) => e.stopPropagation()}
                  role="menu"
                >
                  <NavLink to="/my-orders" onClick={() => setUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-maroon hover:bg-gold/10 transition-colors border-b border-gold/20"
                    role="menuitem">
                    <Package size={15} /> {t("nav_my_orders")}
                  </NavLink>
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    role="menuitem">
                    <LogOut size={15} /> {t("nav_logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="rounded-full border border-gold px-5 py-2 text-sm font-medium text-maroon transition-colors hover:bg-gold/20">
              {t("nav_login")}
            </NavLink>
          )}

          <NavLink to="/temples" className="rounded-full bg-saffron px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-maroon hover:shadow-lg">
            {t("nav_book_now")}
          </NavLink>
        </div>

        {/* Mobile: cart + toggle — visible below lg */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile cart icon */}
          <NavLink
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-gold text-maroon transition-colors hover:bg-gold/20"
            aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-saffron text-[10px] font-bold text-white shadow-sm" aria-hidden="true">
                {totalItems}
              </span>
            )}
          </NavLink>

          <button
            className="grid h-11 w-11 place-items-center rounded-lg text-maroon transition-colors hover:bg-gold/10"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-gold/40 bg-cream animate-fadeIn max-h-[calc(100dvh-4rem)] overflow-y-auto safe-bottom">
          <ul className="container flex flex-col gap-1 py-4">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-3.5 text-base min-h-[44px] ${
                      isActive ? "bg-saffron/10 text-saffron font-semibold" : "text-brown hover:bg-gold/10"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}

            {user && (
              <li>
                <NavLink to="/my-orders" onClick={closeMenu}
                  className="block rounded-md px-3 py-3.5 text-base text-brown hover:bg-gold/10 min-h-[44px]">
                  📦 {t("nav_my_orders")}
                </NavLink>
              </li>
            )}

            {/* Mobile language toggle */}
            <li className="px-3 pt-2 pb-1">
              <p className="text-xs text-brown/50 font-semibold mb-2 uppercase tracking-wider">Language / भाषा</p>
              <LangToggle mobile />
            </li>

            <li className="mt-2 flex gap-3 px-3">
              {user ? (
                <>
                  <button onClick={() => { handleLogout(); closeMenu(); }}
                    className="flex-1 rounded-full border border-gold px-4 py-3 text-sm text-maroon text-center min-h-[44px]">{t("nav_logout")}</button>
                  <NavLink to="/puja" onClick={closeMenu}
                    className="flex-1 rounded-full bg-saffron px-4 py-3 text-sm font-semibold text-white text-center min-h-[44px]">{t("nav_book_now")}</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={closeMenu} className="flex-1 rounded-full border border-gold px-4 py-3 text-sm text-maroon text-center min-h-[44px]">{t("nav_login")}</NavLink>
                  <NavLink to="/puja" onClick={closeMenu} className="flex-1 rounded-full bg-saffron px-4 py-3 text-sm font-semibold text-white text-center min-h-[44px]">{t("nav_book_now")}</NavLink>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
