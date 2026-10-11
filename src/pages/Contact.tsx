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
          <ul className="grid gap-3 md:grid-cols-3">
            {quick.map(({ Icon, title, value, href, external, track }) => (
              <li key={title}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => trackContact(track)}
                  className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-saffron/40"
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
              { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/18S8PGfHQ8/?mibextid=wwXIfr" },
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
        <div className="container max-w-3xl">
          <SectionHeading title={t("ct_faq_title")} />
          <FaqList faqs={faqs} firstOpen />
        </div>
      </section>
    </main>
  );
};

export default Contact;
