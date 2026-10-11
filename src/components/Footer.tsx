import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Facebook, Instagram, Lock, Mail, MapPin, MessageCircle, Phone, Video } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { hasBookingBar } from "@/lib/stickyBars";
import { PrasadBoxIcon } from "@/components/icons";

const Footer = React.memo(() => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const links = [
    { to: "/puja", label: t("nav_puja") },
    { to: "/chadhava", label: t("nav_chadhava") },
    { to: "/temples", label: t("nav_temples") },
    { to: "/astrology", label: t("nav_astrology") },
    { to: "/about", label: t("footer_about") },
    { to: "/my-orders", label: t("nav_my_orders") },
    { to: "/contact", label: t("nav_contact") },
  ];
  const policies = [
    { to: "/privacy-policy", label: t("footer_privacy") },
    { to: "/terms", label: t("footer_terms") },
    { to: "/refund-policy", label: t("footer_refund_policy") },
    { to: "/shipping-policy", label: t("footer_shipping_policy") },
    { to: "/grievance", label: t("footer_grievance") },
  ];
  const social = [
    { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/18S8PGfHQ8/?mibextid=wwXIfr" },
    { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/narayankripa.in?igsh=aHBjd2QybnBpemdi" },
  ];
  const promises = [
    { Icon: Lock, label: t("footer_secure_payments") },
    { Icon: Video, label: t("home_trust_video") },
    { Icon: PrasadBoxIcon, label: t("footer_prasad_delivery") },
  ];

  return (
    <footer className="bg-maroon-deep text-white/75">
      <div className="border-b border-white/10">
        <ul className="container flex flex-wrap gap-x-6 gap-y-2 py-4">
          {promises.map(({ Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/85">
              <Icon size={16} strokeWidth={1.75} className="text-gold-light" /> {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="container grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-bold text-white">Narayan Kripa</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed">{t("footer_description")}</p>
          <div className="mt-4 flex gap-2">
            {social.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label={t("footer_quick_links")}>
          <p className="text-sm font-semibold text-white">{t("footer_quick_links")}</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold text-white">{t("footer_get_in_touch")}</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <a href={whatsappLink(t("wa_msg_book"))} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                <MessageCircle size={16} className="shrink-0" /> WhatsApp: {t("ct_phone_text")}
              </a>
            </li>
            <li>
              <a href="tel:+919286345941" className="flex items-center gap-2 hover:text-white">
                <Phone size={16} className="shrink-0" /> {t("ct_phone_text")}
              </a>
            </li>
            <li>
              <a href={`mailto:${t("ct_email_text")}`} className="flex items-center gap-2 break-all hover:text-white">
                <Mail size={16} className="shrink-0" /> {t("ct_email_text")}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" /> {t("ct_address_text")}
            </li>
            <li className="text-white/60">{t("ct_hours_text")}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-5 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>{t("footer_copyright")}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {policies.map((p) => (
              <li key={p.to}>
                <Link to={p.to} className="hover:text-white">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Room for the fixed booking/cart bars so they never cover the last links. */}
      <div className={hasBookingBar(pathname) ? "h-20" : "h-20 lg:h-0"} aria-hidden="true" />
    </footer>
  );
});

export default Footer;
