import { useState } from "react";
import { CheckCircle, Clock, Facebook, Instagram, Loader2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { trackContact } from "@/lib/metaPixel";
import ListingHeader from "@/components/shared/ListingHeader";
import SectionHeading from "@/components/SectionHeading";
import FaqList from "@/components/shared/FaqList";

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";

const Contact = () => {
  const { t } = useLanguage();
  usePageTitle(`${t("ct_hero")} | Narayan Kripa`);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error(t("contact_err_fill"));
      return;
    }
    setSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: "Narayan Kripa Website",
          subject: `Contact: ${form.subject || "General Enquiry"} | ${form.name}`,
          name: form.name,
          email: form.email,
          phone: form.phone || "Not provided",
          message: form.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("contact_success"));
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      } else {
        toast.error(data.message || t("contact_err_generic"));
      }
    } catch {
      toast.error(t("contact_err_network"));
    }
    setSending(false);
  };

  const faqs = [1, 2, 3, 4, 5].map((n) => ({ question: t(`ct_faq_q${n}`), answer: t(`ct_faq_a${n}`) }));
  const quick = [
    { Icon: MessageCircle, title: "WhatsApp", value: t("ct_phone_text"), href: whatsappLink(t("wa_msg_book")), external: true, track: "whatsapp_contact" },
    { Icon: Phone, title: t("ct_phone_title"), value: t("ct_phone_text"), href: "tel:+919286345941", external: false, track: "call_contact" },
    { Icon: Mail, title: t("ct_email_title"), value: t("ct_email_text"), href: `mailto:${t("ct_email_text")}`, external: false, track: "email_contact" },
  ];
  const fields = [
    { name: "name", label: t("ct_name"), type: "text", required: true, autoComplete: "name" },
    { name: "phone", label: t("ct_phone"), type: "tel", required: false, autoComplete: "tel" },
    { name: "email", label: t("ct_email"), type: "email", required: true, autoComplete: "email" },
  ] as const;
  const input = "h-12 w-full rounded-[10px] border border-input bg-surface px-3 text-[15px] text-ink outline-none focus:border-saffron";

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
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted/60 py-10 md:py-14">
        <div className="container grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeading title={t("ct_form_title")} subtitle={t("ct_form_sub")} />
            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-line bg-surface p-4 md:p-6" noValidate>
              {fields.map((f) => (
                <div key={f.name}>
                  <label htmlFor={`ct-${f.name}`} className="mb-1.5 block text-sm font-semibold text-ink">
                    {f.label} {!f.required && <span className="font-normal text-ink-soft">({t("co_optional")})</span>}
                  </label>
                  <input
                    id={`ct-${f.name}`}
                    type={f.type}
                    name={f.name}
                    autoComplete={f.autoComplete}
                    value={form[f.name]}
                    onChange={handleChange}
                    className={input}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="ct-subject" className="mb-1.5 block text-sm font-semibold text-ink">
                  {t("ct_subject")}
                </label>
                <select id="ct-subject" name="subject" value={form.subject} onChange={handleChange} className={input}>
                  <option value="">{t("ct_general")}</option>
                  <option value="Puja Booking">{t("ct_puja_booking")}</option>
                  <option value="Chadhava Support">{t("ct_chadhava_support")}</option>
                  <option value="Pandit Enquiry">{t("ct_pandit")}</option>
                  <option value="Partnership">{t("ct_partnership")}</option>
                </select>
              </div>
              <div>
                <label htmlFor="ct-message" className="mb-1.5 block text-sm font-semibold text-ink">
                  {t("ct_message")}
                </label>
                <textarea
                  id="ct-message"
                  rows={5}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-[10px] border border-input bg-surface px-3 py-2.5 text-[15px] text-ink outline-none focus:border-saffron"
                />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full sm:w-auto">
                {sending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> {t("ct_sending")}
                  </>
                ) : sent ? (
                  <>
                    <CheckCircle size={18} /> {t("ct_sent")}
                  </>
                ) : (
                  t("ct_submit")
                )}
              </button>
            </form>
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
          <div>
            <SectionHeading title={t("ct_faq_title")} />
            <FaqList faqs={faqs} firstOpen />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
