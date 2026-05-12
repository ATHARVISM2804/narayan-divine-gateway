import { Link } from "react-router-dom";
import { Youtube, Instagram, Phone, MessageCircle, Facebook, MapPin, Mail, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  const companyLinks = [
    { label: t("footer_about"), to: "/contact" },
    { label: t("nav_contact"), to: "/contact" },
    { label: t("nav_my_orders"), to: "/my-orders" },
  ];

  const serviceLinks = [
    { label: t("nav_puja"), to: "/puja" },
    { label: t("nav_chadhava"), to: "/chadhava" },
    { label: t("nav_astrology"), to: "/astrology" },
    { label: t("nav_temples"), to: "/temples" },
  ];

  const socialLinks = [
    { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/18S8PGfHQ8/?mibextid=wwXIfr" },
    { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/narayankripa.in?igsh=aHBjd2QybnBpemdi" },
    { Icon: Youtube, label: "YouTube", href: "https://www.youtube.com" },
    { Icon: Phone, label: "Phone", href: "tel:+919286345941" },
    { Icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/919286345941" },
  ];

  return (
    <footer className="relative overflow-hidden">

      {/* ── Ornate gold divider at top ── */}
      <div className="relative h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-maroon-deep px-4">
          <Sparkles size={14} className="text-gold" />
        </div>
      </div>

      {/* ── Main footer — dark maroon-deep matching the site hero sections ── */}
      <div className="relative bg-gradient-to-b from-maroon-deep via-[#1F0B0B] to-[#150808]">

        {/* Mandala watermark */}
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 text-gold/[0.04]"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
        >
          <circle cx="100" cy="100" r="95" />
          <circle cx="100" cy="100" r="70" />
          <circle cx="100" cy="100" r="45" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1="100" y1="5" x2="100" y2="195" transform={`rotate(${i * 15} 100 100)`} />
          ))}
        </svg>

        <div className="container relative z-10 grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4 lg:gap-14">

          {/* Col 1 — Brand */}
          <div className="md:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712834/favicon-removebg-preview_kx4s41.png"
                alt="Narayan Kripa Logo"
                className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(201,168,76,0.3)]"
              />
              <span className="font-display text-xl text-gold drop-shadow-sm">Narayan Kripa</span>
            </div>
            <p className="text-sm text-cream/70 leading-relaxed">
              {t("footer_description")}
            </p>

            {/* Sanskrit tagline */}
            <p className="mt-4 font-serif italic text-sm text-gold/50 tracking-wide">
              ॐ सर्वे भवन्तु सुखिनः
            </p>
          </div>

          {/* Col 2 — Company */}
          <div>
            <h4 className="mb-5 font-display text-base text-gold tracking-wide">{t("footer_company")}</h4>
            <div className="mb-3 h-px w-10 bg-gradient-to-r from-gold/50 to-transparent" />
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-cream/65 hover:text-gold transition-colors duration-200 flex items-center gap-2 py-1.5"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold/40 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Our Services */}
          <div>
            <h4 className="mb-5 font-display text-base text-gold tracking-wide">{t("footer_our_services")}</h4>
            <div className="mb-3 h-px w-10 bg-gradient-to-r from-gold/50 to-transparent" />
            <ul className="space-y-3 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-cream/65 hover:text-gold transition-colors duration-200 flex items-center gap-2 py-1.5"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold/40 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Get in Touch */}
          <div>
            <h4 className="mb-5 font-display text-base text-gold tracking-wide">{t("footer_get_in_touch")}</h4>
            <div className="mb-3 h-px w-10 bg-gradient-to-r from-gold/50 to-transparent" />

            <div className="space-y-3 text-sm text-cream/65">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-gold/60 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Sector 66, Gurugram,<br />
                  Haryana, India
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-gold/60 shrink-0" />
                <a href="mailto:Asknarayankripa@gmail.com" className="hover:text-gold transition-colors py-1 block">
                  Asknarayankripa@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-gold/60 shrink-0" />
                <a href="tel:+919286345941" className="hover:text-gold transition-colors py-1 block">
                  +91 92863 45941
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-6 flex gap-2.5">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-11 w-11 place-items-center rounded-full border border-gold/20 bg-gold/[0.06] text-cream/70 transition-all duration-300 hover:bg-gold hover:text-maroon-deep hover:scale-110 hover:border-gold hover:shadow-[0_0_12px_rgba(201,168,76,0.3)]"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="bg-[#0D0505] border-t border-gold/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-4 md:flex-row">

          {/* Trust badges */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-xs font-semibold text-cream/50 flex items-center gap-1.5">
              <span className="text-base">🔒</span> {t("footer_secure_payments")}
            </span>
            <span className="text-cream/20">|</span>
            <span className="text-xs font-semibold text-cream/50 flex items-center gap-1.5">
              <span className="text-base">💳</span> {t("footer_razorpay_trusted")}
            </span>
            <span className="text-cream/20">|</span>
            <span className="text-xs font-semibold text-cream/50 flex items-center gap-1.5">
              <span className="text-base">📦</span> {t("footer_prasad_delivery")}
            </span>
          </div>

          {/* Policy links + Copyright */}
          <div className="flex flex-col items-center gap-1.5 md:items-end">
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-cream/45">
              <Link to="/privacy-policy" className="hover:text-gold transition-colors py-2">Privacy Policy</Link>
              <span className="text-cream/20 py-2">·</span>
              <Link to="/terms" className="hover:text-gold transition-colors py-2">Terms & Conditions</Link>
              <span className="text-cream/20 py-2">·</span>
              <Link to="/refund-policy" className="hover:text-gold transition-colors py-2">Refund Policy</Link>
              <span className="text-cream/20 py-2">·</span>
              <Link to="/shipping-policy" className="hover:text-gold transition-colors py-2">Shipping Policy</Link>
              <span className="text-cream/20 py-2">·</span>
              <Link to="/grievance" className="hover:text-gold transition-colors py-2">Grievance</Link>
            </div>
            <p className="text-[11px] text-cream/30">{t("footer_copyright")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
