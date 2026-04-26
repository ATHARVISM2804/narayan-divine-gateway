import { Check, Bell, Star } from "lucide-react";

const features = [
  "Daily Puja & Aarti Reminders",
  "Live Temple Darshan",
  "Instant Pandit Chat",
  "Personalized Panchang",
];

const AppDownload = () => (
  <section className="overflow-hidden">
    <div className="grid md:grid-cols-2">
      {/* Left */}
      <div className="bg-cream p-8 md:p-12 lg:p-16">
        <span className="inline-block rounded-full bg-gold/30 px-3 py-1 text-xs font-medium text-maroon">📱 Mobile App</span>
        <h2 className="mt-3 font-display text-3xl text-maroon md:text-4xl">Narayan Kripa App</h2>
        <h3 className="font-serif text-xl italic text-gold">Coming Soon</h3>
        <p className="mt-4 max-w-md text-brown/70">
          Daily puja reminders, live darshan, instant pandit consultation, panchang & more — right in your pocket.
        </p>

        <ul className="mt-6 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-brown">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gold/30 text-saffron">
                <Check size={14} />
              </span>
              {f}
            </li>
          ))}
        </ul>

        <form className="mt-6 flex max-w-md flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-full border border-gold bg-ivory px-4 py-2.5 text-sm text-brown outline-none focus:border-saffron"
          />
          <button className="rounded-full bg-saffron px-6 py-2.5 text-sm font-semibold text-white hover:bg-maroon transition-colors">
            Notify Me
          </button>
        </form>

        <div className="mt-6 flex gap-3">
          {["App Store", "Google Play"].map((s) => (
            <div key={s} className="relative">
              <button disabled className="flex items-center gap-2 rounded-xl bg-maroon-deep/80 px-5 py-3 text-cream opacity-60">
                <span className="text-2xl">{s === "App Store" ? "" : "▶"}</span>
                <div className="text-left">
                  <p className="text-[10px] opacity-80">Get it on</p>
                  <p className="text-sm font-semibold">{s}</p>
                </div>
              </button>
              <span className="absolute -top-2 right-1 rounded-full bg-saffron px-2 py-0.5 text-[9px] font-bold text-white">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="relative grid place-items-center bg-gradient-to-br from-saffron via-saffron to-maroon p-12">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative">
          <div className="mx-auto w-56 rounded-[2.5rem] border-2 border-gold bg-maroon-deep p-2 shadow-2xl">
            <div className="overflow-hidden rounded-[1.75rem] bg-cream">
              <div className="h-24 bg-gradient-to-br from-maroon to-maroon-deep p-3 text-cream">
                <p className="text-[10px] opacity-80">Today's Darshan</p>
                <p className="font-display">Kashi Vishwanath</p>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {["🪔", "🌺", "📿", "🛕"].map((e, i) => (
                  <div key={i} className="grid aspect-square place-items-center rounded-lg bg-ivory text-2xl border border-gold/40">{e}</div>
                ))}
              </div>
              <div className="flex justify-around border-t border-gold/40 px-3 py-2 text-xl">
                <span>🏠</span><span>🔔</span><span>📿</span><span>👤</span>
              </div>
            </div>
          </div>
          <div className="absolute -left-8 top-10 flex items-center gap-2 rounded-xl bg-white p-3 shadow-lg animate-float">
            <Bell size={16} className="text-saffron" />
            <p className="text-xs font-semibold text-maroon">Your Puja starts<br/>in 30 mins</p>
          </div>
          <div className="absolute -right-6 bottom-12 flex items-center gap-2 rounded-xl bg-gold p-3 shadow-lg animate-float [animation-delay:1s]">
            <Star size={16} fill="hsl(var(--maroon))" className="text-maroon" />
            <p className="text-xs font-semibold text-maroon">4.8 App Rating</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AppDownload;
