import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Plus, Minus, Facebook, Instagram, Youtube, Twitter, Loader2, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";
import heroContact from "@/assets/hero-contact-page.png";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";

const Contact = () => {
  usePageTitle("Contact Narayan Kripa — Get in Touch");
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in Name, Email and Message");
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
          subject: `Contact: ${form.subject || "General Enquiry"} — ${form.name}`,
          name: form.name,
          email: form.email,
          phone: form.phone || "Not provided",
          message: form.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Message sent successfully! We'll get back to you soon 🙏");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      } else {
        toast.error(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again later.");
    }
    setSending(false);
  };

  const socialLinks = [
    { Icon: Facebook, href: "https://www.facebook.com/share/18S8PGfHQ8/?mibextid=wwXIfr" },
    { Icon: Instagram, href: "https://www.instagram.com/narayankripa.in?igsh=aHBjd2QybnBpemdi" },
    { Icon: Youtube, href: "https://www.youtube.com" },
    { Icon: Twitter, href: "https://x.com" }
  ];

  const faqs = [
    { q: t("ct_faq_q1"), a: t("ct_faq_a1") },
    { q: t("ct_faq_q2"), a: t("ct_faq_a2") },
    { q: t("ct_faq_q3"), a: t("ct_faq_a3") },
    { q: t("ct_faq_q4"), a: t("ct_faq_a4") },
    { q: t("ct_faq_q5"), a: t("ct_faq_a5") },
  ];

  return (
    <main>
      <PageHero title={t("ct_hero")} subtitle={t("ct_hero_sub")} variant="ivory" breadcrumb={t("ct_breadcrumb")} bgImage={heroContact} />

      <section className="bg-background py-16">
        <div className="container grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl border border-gold/50 bg-ivory p-8">
            <h2 className="font-display text-3xl text-maroon">{t("ct_form_title")}</h2>
            <p className="mt-1 font-serif italic text-brown/70">{t("ct_form_sub")}</p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {[
                { label: t("ct_name"), type: "text", name: "name" },
                { label: t("ct_email"), type: "email", name: "email" },
                { label: t("ct_phone"), type: "tel", name: "phone" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="mb-1 block text-xs font-medium text-maroon">{f.label}</label>
                  <input type={f.type} name={f.name} value={form[f.name as keyof typeof form]} onChange={handleChange}
                    className="w-full rounded-lg border border-gold bg-cream px-4 py-2.5 text-sm outline-none transition-colors focus:border-saffron" />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-medium text-maroon">{t("ct_subject")}</label>
                <select name="subject" value={form.subject} onChange={handleChange}
                  className="w-full rounded-lg border border-gold bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron">
                  <option value="">{t("ct_general")}</option>
                  <option value="Puja Booking">{t("ct_puja_booking")}</option>
                  <option value="Chadhava Support">{t("ct_chadhava_support")}</option>
                  <option value="Pandit Enquiry">{t("ct_pandit")}</option>
                  <option value="Partnership">{t("ct_partnership")}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-maroon">{t("ct_message")}</label>
                <textarea rows={5} name="message" value={form.message} onChange={handleChange}
                  className="w-full rounded-lg border border-gold bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" />
              </div>
              <button type="submit" disabled={sending}
                className="flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors disabled:opacity-60">
                {sending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : sent ? <><CheckCircle size={16} /> Sent!</> : t("ct_submit")}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-4">
            {[
              { Icon: MapPin, title: t("ct_address_title"), text: t("ct_address_text") },
              { Icon: Phone, title: t("ct_phone_title"), text: t("ct_phone_text") },
              { Icon: Mail, title: t("ct_email_title"), text: t("ct_email_text") },
              { Icon: Clock, title: t("ct_hours_title"), text: t("ct_hours_text") },
            ].map((c) => (
              <div key={c.title} className="flex gap-4 rounded-2xl border border-gold/40 bg-ivory p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/30 text-saffron">
                  <c.Icon size={20} />
                </div>
                <div>
                  <h4 className="font-display text-maroon">{c.title}</h4>
                  <p className="text-sm text-brown/70">{c.text}</p>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-gold/40 bg-ivory p-5">
              <h4 className="font-display text-maroon">{t("ct_follow")}</h4>
              <div className="mt-3 flex gap-3">
                {socialLinks.map(({ Icon, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-gold text-saffron hover:bg-saffron hover:text-white transition-colors">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream py-16">
        <div className="container max-w-3xl">
          <h2 className="text-center font-display text-3xl text-maroon">{t("ct_faq_title")}</h2>
          <div className="mx-auto my-3 h-px w-20 bg-gold" />
          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gold/40 bg-ivory">
                <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-medium text-maroon">{f.q}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/20 text-saffron">
                    {open === i ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                {open === i && <p className="border-t border-gold/30 px-5 py-4 text-sm text-brown/80 animate-fadeIn">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
