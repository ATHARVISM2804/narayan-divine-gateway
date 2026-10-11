import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLanguage } from "@/context/LanguageContext";
import { whatsappLink } from "@/lib/whatsapp";
import { TempleIcon } from "@/components/icons";

const NotFound = () => {
  const { t } = useLanguage();
  usePageTitle(`${t("nf_subtitle")} | Narayan Kripa`);

  return (
    <main className="container flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-muted text-maroon">
        <TempleIcon size={28} />
      </span>
      <p className="mt-4 text-sm font-semibold text-ink-soft">{t("nf_title")}</p>
      <h1 className="mt-1 text-[22px] font-bold text-ink md:text-[28px]">{t("nf_subtitle")}</h1>
      <p className="mt-2 text-[15px] text-ink-muted">{t("nf_desc")}</p>
      <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link to="/puja" className="btn-primary">
          {t("btn_explore_puja")} <ArrowRight size={18} />
        </Link>
        <a href={whatsappLink(t("wa_msg_book"))} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          <MessageCircle size={18} /> {t("book_whatsapp")}
        </a>
      </div>
      <Link to="/" className="mt-4 text-sm font-medium text-ink-soft hover:text-ink">
        {t("nf_back")}
      </Link>
    </main>
  );
};

export default NotFound;
