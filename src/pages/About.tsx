import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, MessageCircle, Phone, Video } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { MIN_PROOF_COUNT, roundedCount, useSiteStats } from "@/lib/proof";
import ListingHeader from "@/components/shared/ListingHeader";
import SectionHeading from "@/components/SectionHeading";
import { PrasadBoxIcon, SankalpIcon, TempleIcon } from "@/components/icons";
import { Highlight } from "@/components/ui/typography";
import imgDarshan from "@/assets/hero-darshan.jpg";

const About = () => {
  const { t } = useLanguage();
  usePageTitle(`${t("about_title")} | Narayan Kripa`);
  const { data: stats } = useSiteStats();

  const how = [
    { Icon: TempleIcon, title: t("about_how_1_t"), desc: t("about_how_1_d") },
    { Icon: SankalpIcon, title: t("about_how_2_t"), desc: t("about_how_2_d") },
    { Icon: Video, title: t("about_how_3_t"), desc: t("about_how_3_d") },
    { Icon: PrasadBoxIcon, title: t("about_how_4_t"), desc: t("about_how_4_d") },
  ];

  return (
    <main>
      <ListingHeader title={t("about_title")} subtitle={t("about_sub")} crumb={t("nav_about")} />

      <section className="py-10 md:py-14">
        <div className="container grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div>
            <SectionHeading title={t("about_story_t")} className="mb-4" />
            <p className="text-[15px] leading-[1.75] text-ink-muted md:text-base">{t("about_story_p1")}</p>
            <p className="mt-4 text-[15px] leading-[1.75] text-ink-muted md:text-base">{t("about_story_p2")}</p>
            {stats && stats.devotees >= MIN_PROOF_COUNT && (
              <p className="mt-4 text-[15px] text-ink-muted">
                <Highlight>{roundedCount(stats.devotees)} {t("pd_devotees_word")}</Highlight> {t("hero_s1_trust")}
              </p>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-line">
            <img src={imgDarshan} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted/60 py-10 md:py-14">
        <div className="container">
          <SectionHeading title={t("about_how_t")} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {how.map(({ Icon, title, desc }) => (
              <li key={title} className="flex gap-4 rounded-xl border border-line bg-surface p-4 md:p-5 lg:flex-col lg:p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron-soft text-saffron-dark">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/puja" className="btn-primary mt-6">
            {t("btn_explore_puja")} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="border-t border-line py-10 md:py-14">
        {/* Laptops: heading and details on the left, the two buttons on the right. */}
        <div className="container max-w-3xl lg:grid lg:max-w-[1400px] lg:grid-cols-[1fr_440px] lg:items-center lg:gap-x-16">
          <SectionHeading title={t("about_contact_t")} subtitle={t("about_contact_d")} className="lg:mb-4" />
          <div className="grid gap-3 sm:grid-cols-2 lg:row-span-2">
            <a href={whatsappLink(t("wa_msg_book"))} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a href="tel:+919286345941" className="btn-secondary">
              <Phone size={18} /> {t("ct_phone_text")}
            </a>
          </div>
          <ul className="mt-6 space-y-2 text-[15px] text-ink-muted lg:mt-0">
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-ink-soft" /> {t("ct_email_text")}
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-1 shrink-0 text-ink-soft" /> {t("ct_address_text")}
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default About;
