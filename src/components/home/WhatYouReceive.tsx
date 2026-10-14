import { Link } from "react-router-dom";
import { ChevronRight, Play } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SITE_RATING, roundedCount } from "@/lib/proof";
import { PrasadBoxIcon } from "@/components/icons";
import { Highlight } from "@/components/ui/typography";
import panditImg from "@/assets/receive/pandit.webp";
import templeImg from "@/assets/receive/temple.webp";

const WA_PATH =
  "M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.908 1.885 7.054L2 30l7.144-1.87A14.034 14.034 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.6a11.62 11.62 0 0 1-5.923-1.62l-.425-.252-4.24 1.11 1.132-4.134-.277-.446A11.563 11.563 0 0 1 4.4 16.003c0-6.4 5.203-11.6 11.603-11.6s11.598 5.2 11.598 11.6-5.198 11.597-11.598 11.597zm6.36-8.68c-.348-.174-2.063-1.018-2.383-1.133-.32-.116-.552-.174-.786.174-.233.348-.902 1.133-1.107 1.366-.203.232-.407.26-.755.086-.348-.174-1.47-.543-2.8-1.727-1.034-.922-1.73-2.06-1.934-2.407-.203-.348-.022-.535.152-.707.157-.155.348-.406.523-.61.174-.202.232-.347.348-.578.116-.232.058-.435-.03-.61-.086-.173-.785-1.892-1.075-2.59-.284-.682-.573-.59-.785-.6l-.67-.012c-.232 0-.61.087-.928.435-.32.347-1.22 1.192-1.22 2.91s1.25 3.378 1.422 3.61c.174.232 2.46 3.757 5.96 5.27.834.36 1.483.575 1.99.736.836.267 1.598.23 2.2.14.672-.1 2.063-.843 2.353-1.658.29-.812.29-1.51.203-1.658-.087-.145-.32-.23-.67-.406z";

const tile = "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg xs:h-20 xs:w-20";

const Photo = ({ src }: { src: string }) => (
  <span className={tile}>
    <img src={src} alt="" width={80} height={80} loading="lazy" decoding="async" className="h-full w-full object-cover" />
  </span>
);

/** A tiny WhatsApp chat on a phone: the pooja video arriving. */
const PhoneMock = () => (
  <span className={`${tile} grid place-items-center bg-[#E7F7EE]`}>
    <span className="flex h-14 w-9 flex-col xs:h-[70px] xs:w-11 overflow-hidden rounded-md border-2 border-ink/80 bg-white shadow-sm">
      <span className="h-2.5 shrink-0 bg-[#128C7E]" />
      <span className="flex flex-1 flex-col justify-end gap-1 bg-[#ECE5DD] p-1">
        <span className="h-1.5 w-6 rounded-sm bg-white" />
        <span className="grid h-6 w-full place-items-center rounded-sm bg-gradient-to-br from-saffron to-maroon">
          <Play size={10} className="fill-white text-white" />
        </span>
      </span>
    </span>
  </span>
);

const STAR = "M0 -5 1.5 -1.6 5.2 -1.5 2.3 0.9 3.2 4.6 0 2.5 -3.2 4.6 -2.3 0.9 -5.2 -1.5 -1.5 -1.6Z";

/** Three devotees under three stars, for the rating card. */
const DevoteesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
    <path d={STAR} transform="translate(18 12)" />
    <path d={STAR} transform="translate(32 8) scale(1.15)" />
    <path d={STAR} transform="translate(46 12)" />
    <g opacity="0.55">
      <circle cx="16" cy="32" r="5.5" />
      <path d="M5 54c0-7 4.9-12 11-12s11 5 11 12z" />
      <circle cx="48" cy="32" r="5.5" />
      <path d="M37 54c0-7 4.9-12 11-12s11 5 11 12z" />
    </g>
    <circle cx="32" cy="29" r="7" />
    <path d="M18 56c0-8.8 6.3-15 14-15s14 6.2 14 15z" />
  </svg>
);

const IconTile =({ children, className }: { children: React.ReactNode; className: string }) => (
  <span className={`${tile} grid place-items-center ${className}`}>{children}</span>
);

/** "What you will receive" cards and the rating card, in the style devotees know from other pooja sites. */
const WhatYouReceive = ({ devotees, onReviewsClick }: { devotees: number | null; onReviewsClick?: () => void }) => {
  const { t } = useLanguage();
  const cards = [
    { visual: <Photo src={panditImg} />, title: t("home_rcv_1_t"), desc: t("home_rcv_1_d") },
    { visual: <PhoneMock />, title: t("home_rcv_2_t"), desc: t("home_rcv_2_d") },
    { visual: <Photo src={templeImg} />, title: t("home_rcv_3_t"), desc: t("home_rcv_3_d") },
    {
      visual: <IconTile className="bg-saffron-soft text-saffron-dark"><PrasadBoxIcon size={38} /></IconTile>,
      title: t("home_rcv_4_t"),
      desc: t("home_rcv_4_d"),
    },
    {
      visual: (
        <IconTile className="bg-[#E7F7EE]">
          <svg viewBox="0 0 32 32" className="h-9 w-9 fill-[#25D366]" aria-hidden="true"><path d={WA_PATH} /></svg>
        </IconTile>
      ),
      title: t("home_rcv_5_t"),
      desc: t("home_rcv_5_d"),
    },
  ];

  const ratingBody = (
    <>
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-saffron-soft text-saffron xs:h-[72px] xs:w-[72px] sm:h-20 sm:w-20" aria-hidden="true">
        <DevoteesIcon className="h-11 w-11 xs:h-14 xs:w-14 sm:h-16 sm:w-16" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold leading-snug text-ink xs:text-lg md:text-xl">
          <span className="tabular text-saffron-dark">{SITE_RATING.avg.toFixed(1)}★</span> {t("home_rating_title")}
        </span>
        {devotees && (
          <span className="mt-0.5 block text-sm leading-snug text-ink-muted md:text-[15px]">
            <Highlight>{roundedCount(devotees)}</Highlight> {t("home_rating_line_post")}
          </span>
        )}
        <span className="mt-1 block text-sm text-ink-soft">
          {roundedCount(SITE_RATING.count)} {t("pd_rating_label")}
        </span>
      </span>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border xs:h-11 xs:w-11 border-line bg-surface text-saffron-dark shadow-sm transition-transform group-hover:translate-x-0.5" aria-hidden="true">
        <ChevronRight size={22} />
      </span>
    </>
  );
  const ratingClass =
    "group flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 text-left xs:p-4 shadow-card transition-colors hover:border-saffron/50 sm:gap-4 md:p-5";

  return (
    <section className="border-t border-line bg-gradient-to-b from-saffron-soft/80 to-surface py-10 md:py-14">
      <div className="container space-y-4 md:space-y-5">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-6">
          <h2 className="mb-4 flex items-center gap-3 text-[15px] font-bold uppercase tracking-wider text-saffron-dark md:text-base">
            {t("home_rcv_title")}
            <span className="h-px flex-1 bg-gradient-to-r from-saffron/40 to-transparent" aria-hidden="true" />
          </h2>
          {/* Phones/tablets: swipe, the next card peeks in. Laptops: all five in a row. */}
          <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide md:-mx-6 md:scroll-px-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0">
            {cards.map((c) => (
              <li
                key={c.title}
                className="flex w-[88%] shrink-0 snap-start xs:w-[85%] items-start gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm sm:w-[48%] md:w-[42%] lg:w-auto lg:flex-col"
              >
                {c.visual}
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold leading-snug text-ink">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{c.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {onReviewsClick ? (
          <button type="button" onClick={onReviewsClick} className={ratingClass}>{ratingBody}</button>
        ) : (
          <Link to="/puja" aria-label={`${SITE_RATING.avg.toFixed(1)}★ ${t("home_rating_title")}. ${t("home_rating_cta")}`} className={ratingClass}>
            {ratingBody}
          </Link>
        )}
      </div>
    </section>
  );
};

export default WhatYouReceive;
