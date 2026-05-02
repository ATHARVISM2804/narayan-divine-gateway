import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const social = [
    { Icon: Facebook, label: "Facebook" },
    { Icon: Instagram, label: "Instagram" },
    { Icon: Youtube, label: "YouTube" },
    { Icon: Twitter, label: "Twitter" },
  ];

  return (
    <footer className="relative bg-maroon-deep text-cream overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent" />
      <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-32 -top-20 h-[28rem] w-[28rem] text-gold/5" fill="none" stroke="currentColor" strokeWidth="0.4" aria-hidden="true">
        <circle cx="100" cy="100" r="95" />
        <circle cx="100" cy="100" r="70" />
        <circle cx="100" cy="100" r="45" />
        {Array.from({ length: 16 }).map((_, k) => (
          <line key={k} x1="100" y1="5" x2="100" y2="195" transform={`rotate(${k * 11.25} 100 100)`} />
        ))}
      </svg>
      {/* Lotus divider */}
      <div className="flex justify-center pt-12">
        <svg width="160" height="24" viewBox="0 0 160 24" fill="none">
          <line x1="0" y1="12" x2="60" y2="12" stroke="hsl(var(--gold))" strokeWidth="0.8" />
          <circle cx="68" cy="12" r="2" fill="hsl(var(--gold))" />
          <path d="M80 4 C 72 12, 72 16, 80 22 C 88 16, 88 12, 80 4 Z" fill="hsl(var(--gold))" />
          <circle cx="80" cy="13" r="1.5" fill="hsl(var(--saffron))" />
          <circle cx="92" cy="12" r="2" fill="hsl(var(--gold))" />
          <line x1="100" y1="12" x2="160" y2="12" stroke="hsl(var(--gold))" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 sm:gap-3">
            <img 
              src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712834/favicon-removebg-preview_kx4s41.png" 
              alt="Narayan Kripa Logo Icon" 
              className="h-14 w-auto object-contain"
            />
            <img 
              src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712826/Screenshot_2026-05-02_143432-removebg-preview_vqcmpo.png" 
              alt="Narayan Kripa Text" 
              className="h-10 w-auto object-contain brightness-0 invert -ml-1"
            />
          </div>
          <p className="font-serif italic text-gold">Where Devotion Meets Tradition</p>
          <div className="mt-5 flex gap-3">
            {social.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-gold text-gold transition-colors hover:bg-gold hover:text-maroon"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg text-gold">Quick Links</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            {["Home", "Puja", "Chadhava", "Astrology", "Temples", "Contact"].map((l) => (
              <li key={l}>
                <Link to={`/${l === "Home" ? "" : l.toLowerCase()}`} className="hover:text-saffron transition-colors">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg text-gold">Services</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            {["Daily Darshan", "Pandit Consultation", "Sacred Store", "Panchang", "Horoscope", "Temple Tours"].map((s) => (
              <li key={s} className="hover:text-saffron transition-colors cursor-pointer">{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg text-gold">Connect</h4>
          <ul className="space-y-3 text-sm text-cream/80">
            <li className="flex items-start gap-2"><Mail size={16} className="mt-0.5 text-gold" /> hello@narayankripa.com</li>
            <li className="flex items-start gap-2"><Phone size={16} className="mt-0.5 text-gold" /> +91 98765 43210</li>
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-gold" /> Varanasi, India</li>
          </ul>
          <button className="mt-5 rounded-full bg-saffron px-5 py-2 text-sm font-semibold text-white hover:bg-gold transition-colors">
            Book a Puja
          </button>
        </div>
      </div>

      <div className="border-t border-gold/30">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream/60 md:flex-row">
          <p>© 2025 Narayan Kripa. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gold">Privacy Policy</a>
            <a href="#" className="hover:text-gold">Terms</a>
            <a href="#" className="hover:text-gold">Grievance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
