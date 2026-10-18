import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { trackContact } from "@/lib/metaPixel";
import ListingHeader from "@/components/shared/ListingHeader";
import SectionHeading from "@/components/SectionHeading";
import FaqList from "@/components/shared/FaqList";

const Contact = () => {
  const { t } = useLanguage();
  usePageTitle(`${t("ct_hero")} | Narayan Kripa`);

  const faqs = [1, 2, 3, 4, 5].map((n) => ({ question: t(`ct_faq_q${n}`), answer: t(`ct_faq_a${n}`) }));
  const quick = [
    { Icon: MessageCircle, title: "WhatsApp", value: t("ct_phone_text"), href: whatsappLink(t("wa_msg_book")), external: true, track: "whatsapp_contact" },
    { Icon: Phone, title: t("ct_phone_title"), value: t("ct_phone_text"), href: "tel:+919286345941", external: false, track: "call_contact" },
    { Icon: Mail, title: t("ct_email_title"), value: t("ct_email_text"), href: `mailto:${t("ct_email_text")}`, external: false, track: "email_contact" },
  ];

  return (
    <main>
      <ListingHeader title={t("ct_hero")} subtitle={t("ct_hero_sub")} crumb={t("ct_breadcrumb")} />

      <section className="py-8 md:py-12">
        <div className="container">
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {quick.map(({ Icon, title, value, href, external, track }) => (
              <li key={title}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => trackContact(track)}
                  className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-[border-color,box-shadow,transform] duration-200 hover:border-saffron/40 lg:p-5 lg:hover:-translate-y-0.5 lg:hover:shadow-raised"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-saffron-soft text-saffron-dark">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-ink-soft">{title}</span>
                    <span className="block truncate text-[15px] font-semibold text-ink">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            <li className="flex items-center gap-1.5">
              <Clock size={15} /> {t("ct_hours_text")}
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin size={15} /> {t("ct_address_text")}
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm font-semibold text-ink">{t("ct_follow")}</span>
            {[
              { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/1GoNEZKNVK/?mibextid=wwXIfr" },
              { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/narayankripa.in?igsh=aHBjd2QybnBpemdi" },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-muted hover:text-ink"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted/60 py-10 md:py-14">
        {/* Laptops: heading and a WhatsApp nudge on the left, the questions on the right. */}
        <div className="container max-w-3xl lg:grid lg:max-w-[1400px] lg:grid-cols-[1fr_1.6fr] lg:gap-12">
          <div>
            <SectionHeading title={t("ct_faq_title")} className="lg:mb-3" />
            <p className="hidden text-[15px] leading-relaxed text-ink-muted lg:block">{t("about_contact_d")}</p>
            <a
              href={whatsappLink(t("wa_msg_book"))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContact("whatsapp_contact")}
              className="btn-primary mt-5 hidden lg:inline-flex"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          </div>
          <FaqList faqs={faqs} firstOpen />
        </div>
      </section>
    </main>
  );
};

export default Contact;
