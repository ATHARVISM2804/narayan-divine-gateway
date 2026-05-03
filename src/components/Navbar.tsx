import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/context/CartContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/puja", label: "Puja" },
  { to: "/chadhava", label: "Chadhava" },
  { to: "/astrology", label: "Astrology" },
  { to: "/temples", label: "Temples" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-cream/95 backdrop-blur shadow-md" : "bg-cream/85 backdrop-blur-sm"
      }`}
    >
      {/* Top sacred ribbon */}
      <div className="hidden md:block bg-gradient-to-r from-maroon via-maroon-deep to-maroon text-gold/90 text-[11px]">
        <div className="container flex h-7 items-center justify-between font-serif italic tracking-wide">
          <span>ॐ  सर्वे भवन्तु सुखिनः  •  May all beings be happy</span>
          <span className="hidden lg:inline">📞 +91 92863 45941  •  🕐 Mon–Sat, 9 AM – 7 PM IST</span>
        </div>
      </div>

      <nav className="container flex h-16 items-center justify-between md:h-20">

        <Logo />

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
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

        <div className="hidden items-center gap-3 md:flex">
          {/* Cart icon */}
          <NavLink
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-gold text-maroon transition-colors hover:bg-gold/20"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-saffron text-[10px] font-bold text-white shadow-sm animate-scaleIn">
                {totalItems}
              </span>
            )}
          </NavLink>
          <NavLink to="/contact" className="rounded-full border border-gold px-5 py-2 text-sm font-medium text-maroon transition-colors hover:bg-gold/20">
            Login
          </NavLink>
          <NavLink to="/temples" className="rounded-full bg-saffron px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-maroon hover:shadow-lg">
            Book Now
          </NavLink>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            className="md:hidden rounded-md p-2 text-maroon"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-gold/40 bg-cream animate-fadeIn">
          <ul className="container flex flex-col gap-1 py-4">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-3 text-base ${
                      isActive ? "bg-saffron/10 text-saffron font-semibold" : "text-brown hover:bg-gold/10"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="mt-2 flex gap-3 px-3">
              <NavLink to="/contact" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-gold px-4 py-2 text-sm text-maroon text-center">Login</NavLink>
              <NavLink to="/puja" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-saffron px-4 py-2 text-sm font-semibold text-white text-center">Book Now</NavLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
