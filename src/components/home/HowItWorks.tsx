import { Search, FileText, Flame, Video } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const steps = [
  { Icon: Search, title: "Choose Your Service", desc: "Browse pujas, chadhava, or book a pandit consultation" },
  { Icon: FileText, title: "Share Your Sankalp", desc: "Enter your name, gotra & intention for the ritual" },
  { Icon: Flame, title: "Pandits Perform", desc: "Verified pandits conduct the ritual with full Vedic procedure" },
  { Icon: Video, title: "Receive Blessings", desc: "Ritual video, prasad delivery & digital certificate" },
];

const HowItWorks = () => (
  <section className="bg-cream py-16">
    <div className="container">
      <SectionHeading title="Connect with the Divine in 4 Simple Steps" />

      <div className="relative mt-10 grid gap-10 md:grid-cols-4 md:gap-4">
        {/* Dashed connector */}
        <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-gold md:block" style={{ marginInline: "12.5%" }} />

        {steps.map((s, i) => (
          <div key={s.title} className="relative flex flex-col items-center text-center">
            <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-saffron font-display text-2xl text-white ring-4 ring-gold ring-offset-2 ring-offset-cream">
              {i + 1}
            </div>
            <s.Icon size={28} className="mt-4 text-saffron" />
            <h3 className="mt-2 font-display text-base text-maroon">{s.title}</h3>
            <p className="mt-1 max-w-[14rem] text-sm text-brown/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
