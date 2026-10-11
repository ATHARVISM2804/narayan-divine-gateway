import { BriefcaseBusiness, Check, Hash, HeartHandshake, Home, MessageCircle, Phone, ScrollText, Stethoscope } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { trackContact } from "@/lib/metaPixel";
import ListingHeader from "@/components/shared/ListingHeader";
import SectionHeading from "@/components/SectionHeading";

/** "Talk to a Pandit": what you can ask, how it works, and two ways to reach us.
    There is no online booking for consultations; WhatsApp is the front door. */
const Astrology = () => {
  const { t } = useLanguage();
  usePageTitle(`${t("ast_hero")} | Narayan Kripa`);

  const topics = [
    { Icon: ScrollText, title: t("ast_s1"), desc: t("ast_s1_desc") },
    { Icon: HeartHandshake, title: t("ast_s2"), desc: t("ast_s2_desc") },
    { Icon: BriefcaseBusiness, title: t("ast_s3"), desc: t("ast_s3_desc") },
    { Icon: Home, title: t("ast_s4"), desc: t("ast_s4_desc") },
    { Icon: Hash, title: t("ast_s5"), desc: t("ast_s5_desc") },
    { Icon: Stethoscope, title: t("ast_s6"), desc: t("ast_s6_desc") },
  ];
  const steps = [
    { title: t("ast_step1"), desc: t("ast_step1_desc") },
    { title: t("ast_step2"), desc: t("ast_step2_desc") },
    { title: t("ast_step3"), desc: t("ast_step3_desc") },
  ];
  const promises = [t("ast_trust1"), t("ast_trust2"), t("ast_trust3"), t("ast_trust4")];
  const ask = (topic?: string) => whatsappLink(`${t("ast_wa_msg")} ${topic ?? ""}`.trim());

  const Actions = () => (
    <div className="grid gap-3 sm:flex">
      <a href={ask()} target="_blank" rel="noopener noreferrer" onClick={() => trackContact("whatsapp_pandit")} className="btn-primary">
        <MessageCircle size={18} /> {t("ast_cta_btn")}
      </a>
      <a href="tel:+919286345941" onClick={() => trackContact("call_pandit")} className="btn-secondary">
        <Phone size={18} /> {t("ast_call")}
      </a>
    </div>
  );

  const Promises = ({ className }: { className: string }) => (
    <>
      <ul className={className}>
        {promises.map((p) => (
          <li key={p} className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Check size={16} strokeWidth={2.5} className="shrink-0 text-success" /> {p}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-ink-soft">{t("ast_no_card")}</p>
    </>
  );

  return (
    <main>
      <ListingHeader
        title={t("ast_hero")}
        subtitle={t("ast_hero_sub")}
        crumb={t("ast_breadcrumb")}
        aside={
          <div className="w-[440px]">
            <Actions />
            <Promises className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2" />
          </div>
        }
      />

      {/* Laptops show these in the header (above). */}
      <section className="py-8 md:py-12 lg:hidden">
        <div className="container">
          <Actions />
          <Promises className="mt-5 flex flex-wrap gap-x-5 gap-y-2" />
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted/60 py-10 md:py-14">
        <div className="container">
          <SectionHeading title={t("ast_section_title")} subtitle={t("ast_section_sub")} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map(({ Icon, title, desc }) => (
              <li key={title}>
                <a
                  href={ask(title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackContact("whatsapp_pandit_topic")}
                  className="flex h-full gap-4 rounded-xl border border-line bg-surface p-4 transition-[border-color,box-shadow,transform] duration-200 hover:border-saffron/40 md:p-5 lg:hover:-translate-y-0.5 lg:hover:shadow-raised"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron-soft text-saffron-dark">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block text-base font-semibold text-ink">{title}</span>
                    <span className="mt-0.5 block text-sm text-ink-muted">{desc}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-saffron-dark">
                      <MessageCircle size={14} /> {t("ast_consult")}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line py-10 md:py-14">
        <div className="container max-w-3xl lg:grid lg:max-w-[1400px] lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <SectionHeading title={t("ast_how_it_works")} />
            <ol className="relative space-y-5 border-l border-dashed border-saffron/40 pl-7">
              {steps.map((s, i) => (
                <li key={s.title} className="relative">
                  <span className="tabular absolute -left-[42px] top-0 grid h-7 w-7 place-items-center rounded-full bg-saffron text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-base font-semibold text-ink">{s.title}</p>
                  <p className="mt-1 text-[15px] text-ink-muted">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-8 rounded-xl border border-line bg-surface p-5 lg:mt-0 lg:rounded-2xl lg:bg-surface-muted/60 lg:p-8">
            <h2 className="text-lg font-bold text-ink lg:text-2xl">{t("ast_cta_title")}</h2>
            <p className="mb-4 mt-1 text-[15px] text-ink-muted">{t("ast_cta_sub")}</p>
            <Actions />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Astrology;
