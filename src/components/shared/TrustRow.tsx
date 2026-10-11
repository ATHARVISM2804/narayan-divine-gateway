import { Lock, Video, BadgeIndianRupee, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

/** The four promises shown next to prices and pay buttons. */
const TrustRow = ({ className }: { className?: string }) => {
  const { t } = useLanguage();
  const items = [
    { icon: Lock, label: t("trust_secure") },
    { icon: Video, label: t("trust_video") },
    { icon: BadgeIndianRupee, label: t("trust_no_hidden") },
    { icon: MessageCircle, label: t("trust_support") },
  ];
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:flex-wrap sm:gap-x-6", className)}>
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
          <Icon size={16} strokeWidth={1.75} className="shrink-0 text-success" /> {label}
        </li>
      ))}
    </ul>
  );
};

export default TrustRow;
