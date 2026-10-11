import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/** Plain page header for listing and info pages: breadcrumb, title, one promise. */
const ListingHeader = ({ title, subtitle, crumb }: { title: string; subtitle?: string; crumb: string }) => {
  const { t } = useLanguage();
  return (
    <header className="border-b border-line bg-surface-muted/60">
      <div className="container py-6 md:py-10">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-ink-soft">
          <Link to="/" className="hover:text-ink">{t("breadcrumb_home")}</Link>
          <ChevronRight size={14} />
          <span className="text-ink">{crumb}</span>
        </nav>
        <h1 className="text-[22px] font-bold text-ink md:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted md:text-base">{subtitle}</p>}
      </div>
    </header>
  );
};

export default ListingHeader;
