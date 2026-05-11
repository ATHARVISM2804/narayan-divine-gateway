import { Link } from "react-router-dom";
import { Youtube, Instagram, Phone, MessageCircle, Facebook } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  const companyLinks = [
    { label: "About Us", to: "/contact" },
    { label: t("nav_contact"), to: "/contact" },
  ];

  const serviceLinks = [
    { label: t("nav_puja"), to: "/puja" },
    { label: t("nav_chadhava"), to: "/chadhava" },
    { label: t("nav_astrology"), to: "/astrology" },
    { label: t("nav_temples"), to: "/temples" },
  ];

  const socialLinks = [
    { Icon: Youtube, label: "YouTube", href: "#" },
    { Icon: Instagram, label: "Instagram", href: "#" },
    { Icon: Phone, label: "Phone", href: "tel:+919286345941" },
    { Icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/919286345941" },
    { Icon: Facebook, label: "Facebook", href: "#" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* ── Main footer — warm saffron gradient like Sri Mandir ── */}
      <div className="bg-gradient-to-b from-[#D4891A] via-[#C07818] to-[#A86510] text-white">
        <div className="container grid gap-10 py-14 md:grid-cols-4">

          {/* Col 1 — Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712834/favicon-removebg-preview_kx4s41.png"
                alt="Narayan Kripa Logo"
                className="h-12 w-auto object-contain"
              />
              <span className="font-display text-xl text-white drop-shadow-sm">Narayan Kripa</span>
            </div>
            <p className="text-sm text-white/85 leading-relaxed">
              Narayan Kripa has brought religious services to the masses in India by connecting devotees, pandits and temples. Partnering with over 50 renowned temples, we provide exclusive pujas and offerings performed by expert pandits and share videos of the completed puja rituals.
            </p>
          </div>

          {/* Col 2 — Company */}
          <div>
            <h4 className="mb-4 font-display text-lg text-white">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-white/85 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Our Services */}
          <div>
            <h4 className="mb-4 font-display text-lg text-white">Our Services</h4>
            <ul className="space-y-2.5 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/85 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Our Address */}
          <div>
            <h4 className="mb-4 font-display text-lg text-white">Our Address</h4>
            <div className="text-sm text-white/85 leading-relaxed space-y-1">
              <p>Narayan Kripa Spiritual Services</p>
              <p>Lanka, Varanasi,</p>
              <p>Uttar Pradesh - 221005</p>
            </div>
            <div className="mt-4 text-sm text-white/85 space-y-1">
              <p>📧 Asknarayankripa@gmail.com</p>
              <p>📞 +91 92863 45941</p>
            </div>

            {/* Social Icons */}
            <div className="mt-5 flex gap-2.5">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white transition-all hover:bg-white hover:text-[#C07818] hover:scale-110"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar — darker shade ── */}
      <div className="bg-[#8B5512] text-white/80">
        <div className="container flex flex-col items-center justify-between gap-3 py-4 md:flex-row">

          {/* Trust badges */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span className="text-lg">🇮🇳</span> Digital India
            </span>
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span className="text-lg">🏅</span> ISO Certified
            </span>
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span className="text-lg">💳</span> Razorpay Trusted
            </span>
          </div>

          {/* Policy links + Copyright */}
          <div className="flex flex-col items-center gap-1.5 md:items-end">
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">{t("footer_privacy")}</Link>
              <span className="text-white/40">·</span>
              <Link to="/terms" className="hover:text-white transition-colors">{t("footer_terms")}</Link>
              <span className="text-white/40">·</span>
              <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
              <span className="text-white/40">·</span>
              <Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link>
              <span className="text-white/40">·</span>
              <Link to="/grievance" className="hover:text-white transition-colors">{t("footer_grievance")}</Link>
            </div>
            <p className="text-[11px] text-white/50">© {new Date().getFullYear()} Narayan Kripa. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
