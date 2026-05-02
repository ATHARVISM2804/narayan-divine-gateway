import { Check, Menu, Search, Phone, Flame, Flower2, ShoppingBag, Sparkles, Calendar, BookOpen, ChevronRight } from "lucide-react";

const features = [
  "Daily Puja & Aarti Reminders",
  "Live Temple Darshan",
  "Instant Pandit Chat",
  "Personalized Panchang",
];

const storeButtons = [
  {
    name: "App Store",
    icon: (
      <svg viewBox="0 0 384 512" className="h-6 w-6" fill="currentColor">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
    ),
  },
  {
    name: "Google Play",
    icon: (
      <svg viewBox="0 0 512 512" className="h-5 w-5" fill="currentColor">
        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
      </svg>
    ),
  },
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

        <div className="mt-6 flex flex-wrap gap-3">
          {storeButtons.map((s) => (
            <div key={s.name} className="relative">
              <button disabled className="flex items-center gap-3 rounded-xl bg-maroon-deep/80 px-5 py-3 text-cream opacity-60">
                {s.icon}
                <div className="text-left leading-tight">
                  <p className="text-[10px] opacity-80">Get it on</p>
                  <p className="text-sm font-semibold">{s.name}</p>
                </div>
              </button>
              <span className="absolute -top-2 right-1 rounded-full bg-saffron px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Custom Phone Mockup */}
      <div className="relative grid place-items-center bg-gradient-to-br from-saffron via-saffron to-maroon p-8 md:p-12 overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        
        {/* Phone Frame */}
        <div className="relative z-10 mx-auto w-[250px] sm:w-[280px] rounded-[2.5rem] sm:rounded-[3rem] border-[8px] sm:border-[10px] border-[#1a1a1a] bg-white shadow-2xl overflow-hidden aspect-[1/2.15] flex flex-col">
          {/* Top Notch / Dynamic Island area */}
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
            <div className="w-1/3 h-5 bg-[#1a1a1a] rounded-b-xl"></div>
          </div>
          
          {/* Screen Content */}
          <div className="flex-1 w-full bg-gray-50 flex flex-col overflow-hidden pb-[70px] pt-7">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm shrink-0">
              <Menu size={20} className="text-gray-700" />
              <div className="flex items-center gap-2">
                 <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-maroon to-saffron flex items-center justify-center shadow-sm">
                   <Flower2 size={16} className="text-white" />
                 </div>
                 <span className="font-display font-bold text-maroon text-base tracking-tight leading-none pt-1">
                   Narayan Kripa
                 </span>
              </div>
              <div className="flex items-center gap-3">
                <Search size={18} className="text-gray-500" />
                <div className="border border-gray-200 rounded-full px-2 py-1 flex items-center gap-1.5 shadow-sm bg-white">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
                  <span className="text-[10px] font-bold text-gray-700">₹1.9K</span>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 hide-scrollbar">
              
              {/* Pandits Row */}
              <div className="flex gap-4 overflow-hidden px-1">
                {["Divya", "Avenue", "Shrinidhi", "Devesh"].map((name, i) => (
                  <div key={name} className="flex flex-col items-center gap-1 shrink-0 relative">
                     <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-rose-400">
                       <div className="w-full h-full rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt={name} className="w-full h-full object-cover" />
                       </div>
                     </div>
                     <div className="absolute bottom-4 bg-[#e82569] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full z-10 border border-white whitespace-nowrap">
                       ● Astro Live
                     </div>
                     <span className="text-[11px] font-medium text-gray-800 mt-1">{name}</span>
                  </div>
                ))}
              </div>

              {/* Banner */}
              <div className="w-full h-36 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 overflow-hidden relative shadow-sm border border-emerald-900/10">
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:8px_8px]"></div>
                 <div className="relative z-10 p-4 h-full flex flex-col justify-center w-3/5">
                   <span className="text-[9px] font-bold text-emerald-900 bg-green-400 px-2 py-0.5 rounded-full w-fit mb-2">
                     Upcoming Puja
                   </span>
                   <h3 className="text-white font-bold text-sm leading-tight mb-1">
                     Baglamukhi Laxmi Prapti Puja
                   </h3>
                   <button className="mt-2 bg-white text-emerald-800 text-[9px] font-bold px-3 py-1.5 rounded-full w-fit shadow-sm">
                     05 DECEMBER
                   </button>
                 </div>
                 {/* Decorative Right Side (Mock image) */}
                 <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-orange-300 to-saffron mask-image:linear-gradient(to_left,black,transparent)">
                   <div className="w-full h-full opacity-60 mix-blend-overlay flex items-center justify-end pr-2">
                     <Sparkles size={60} className="text-white" />
                   </div>
                 </div>
              </div>

              {/* Daily Predictions */}
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2.5">Daily Predictions</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {icon: <Sparkles size={20}/>, label: "Daily Darshan", c: "bg-orange-50/80 border-orange-200 text-orange-600"},
                    {icon: <BookOpen size={20}/>, label: "Horoscope", c: "bg-emerald-50/80 border-emerald-200 text-emerald-600"},
                    {icon: <Calendar size={20}/>, label: "Daily Panchang", c: "bg-pink-50/80 border-pink-200 text-pink-600"}
                  ].map((item, i) => (
                    <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${item.c}`}>
                      <div className="mb-2 opacity-80">{item.icon}</div>
                      <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Consultations */}
              <div className="pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-sm text-gray-900">Recent Consultations</h4>
                  <span className="text-[10px] text-gray-500 font-medium cursor-pointer">View all</span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3">
                   <img src="https://i.pravatar.cc/100?img=11" className="w-11 h-11 rounded-full bg-gray-200 border border-gray-100" />
                   <div className="flex-1">
                     <p className="text-xs font-bold text-gray-900">Astro Surresha</p>
                     <p className="text-[9px] text-gray-500 mt-0.5">09 Oct 2024, 04:45 PM</p>
                   </div>
                   <button className="bg-[#e82569] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-[#d4195a] transition-colors">
                     Connect Again
                   </button>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Nav */}
          <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 flex justify-around items-center pt-2 pb-5 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
             {[
               {icon: <Phone size={22} strokeWidth={2} />, l: "Astro", active: true},
               {icon: <Flame size={22} strokeWidth={2} />, l: "Puja"},
               {icon: <Flower2 size={22} strokeWidth={2} />, l: "Chadhava"},
               {icon: <ShoppingBag size={22} strokeWidth={2} />, l: "Mall"}
             ].map(nav => (
               <div key={nav.l} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${nav.active ? "text-[#e82569]" : "text-gray-400 hover:text-gray-600"}`}>
                 {nav.icon}
                 <span className={`text-[9px] ${nav.active ? "font-bold" : "font-medium"}`}>{nav.l}</span>
               </div>
             ))}
          </div>

        </div>
      </div>
    </div>
  </section>
);

export default AppDownload;
