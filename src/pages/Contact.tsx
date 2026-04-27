import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Plus, Minus, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";

const faqs = [
  { q: "How do I book a puja?", a: "Choose a puja from our catalogue, share your sankalp details, and select a date — verified pandits handle the rest." },
  { q: "Will I receive prasad?", a: "Yes — prasad and a blessings certificate are couriered to your registered address after the ritual." },
  { q: "Are the pandits verified?", a: "Every pandit on Narayan Kripa is certified by recognised Vedic institutions and reviewed by our acharya panel." },
  { q: "Can I attend the puja virtually?", a: "Absolutely — most pujas include a live or recorded video so you can witness every step." },
  { q: "What is your refund policy?", a: "Cancellations made 24 hours before the puja are fully refundable. Read full terms on our policy page." },
];

const Contact = () => {
  usePageTitle("Contact Narayan Kripa — Get in Touch");
  const [open, setOpen] = useState<number | null>(0);
  const social = [Facebook, Instagram, Youtube, Twitter];

  return (
    <main>
      <PageHero title="Get in Touch" subtitle="We are here to help you walk the path of devotion" variant="ivory" breadcrumb="Contact" />

      <section className="bg-background py-16">
        <div className="container grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl border border-gold/50 bg-ivory p-8">
            <h2 className="font-display text-3xl text-maroon">Send a Message</h2>
            <p className="mt-1 font-serif italic text-brown/70">We'll respond within 24 hours.</p>
            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              {[
                { label: "Name", type: "text" },
                { label: "Email", type: "email" },
                { label: "Phone", type: "tel" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1 block text-xs font-medium text-maroon">{f.label}</label>
                  <input type={f.type} className="w-full rounded-lg border border-gold bg-cream px-4 py-2.5 text-sm outline-none transition-colors focus:border-saffron" />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-medium text-maroon">Subject</label>
                <select className="w-full rounded-lg border border-gold bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron">
                  <option>General Enquiry</option>
                  <option>Puja Booking</option>
                  <option>Chadhava Support</option>
                  <option>Pandit Consultation</option>
                  <option>Partnership</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-maroon">Message</label>
                <textarea rows={5} className="w-full rounded-lg border border-gold bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron" />
              </div>
              <button className="rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors">
                Submit
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-4">
            {[
              { Icon: MapPin, title: "Address", text: "Narayan Kripa, Lanka, Varanasi 221005, India" },
              { Icon: Phone, title: "Phone", text: "+91 98765 43210" },
              { Icon: Mail, title: "Email", text: "hello@narayankripa.com" },
              { Icon: Clock, title: "Support Hours", text: "Mon–Sat, 9 AM – 7 PM IST" },
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
              <h4 className="font-display text-maroon">Follow Us</h4>
              <div className="mt-3 flex gap-3">
                {social.map((Icon, i) => (
                  <a key={i} href="#" className="grid h-10 w-10 place-items-center rounded-full border border-gold text-saffron hover:bg-saffron hover:text-white transition-colors">
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
          <h2 className="text-center font-display text-3xl text-maroon">Frequently Asked Questions</h2>
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
