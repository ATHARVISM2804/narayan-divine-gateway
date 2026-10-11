import { useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMetaTrackingContext, newMetaEventId, trackLead } from "@/lib/metaPixel";
import { useLanguage } from "@/context/LanguageContext";
import BottomSheet from "@/components/shared/BottomSheet";
import { formatInr } from "@/components/ui/typography";

interface Props {
  pujaName: string;
  packageLabel: string;
  price: number;
  onConfirm: (name: string, phone: string) => void;
  onClose: () => void;
}

/** A returning visitor's details, saved after their first lead. */
const savedLead = (): { name: string; phone: string } => {
  try {
    const v = JSON.parse(localStorage.getItem("nk_lead") || "null");
    return { name: typeof v?.name === "string" ? v.name : "", phone: typeof v?.phone === "string" ? v.phone : "" };
  } catch {
    return { name: "", phone: "" };
  }
};

/** Asks for name + WhatsApp number before checkout. Saves the lead (and sends
    Meta a Lead event) but never blocks the booking if saving fails. */
const LeadCaptureModal = ({ pujaName, packageLabel, price, onConfirm, onClose }: Props) => {
  const { t } = useLanguage();
  const [initial] = useState(savedLead);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [error, setError] = useState<"name" | "phone" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!name.trim()) return setError("name");
    if (!/^\d{10}$/.test(phone.trim())) return setError("phone");
    setError(null);
    setLoading(true);

    const eventId = newMetaEventId("lead");
    const lead = {
      name: name.trim(),
      phone: phone.trim(),
      puja_name: pujaName,
      package_label: packageLabel,
      price,
      source: "puja_page",
    };

    // Save through the server so Meta also gets a server-side Lead; fall back to
    // a direct insert if the function is unavailable.
    try {
      const { error: fnError } = await supabase.functions.invoke("submit-lead", {
        body: { ...lead, event_id: eventId, tracking: getMetaTrackingContext() },
      });
      if (fnError) await supabase.from("leads").insert(lead);
    } catch {
      // A failed lead save must never block checkout.
    }

    localStorage.setItem("nk_lead", JSON.stringify({ name: name.trim(), phone: phone.trim() }));
    trackLead({ name: `${pujaName} (${packageLabel})`, value: price, eventId });

    setLoading(false);
    onConfirm(name.trim(), phone.trim());
  };

  const field =
    "flex items-center gap-2 rounded-[10px] border bg-surface px-3 transition-colors focus-within:border-saffron";

  return (
    <BottomSheet open onClose={onClose} title={t("lead_title")}>
      <form
        className="px-5 pb-6 pt-5 sm:px-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        <h2 className="pr-8 text-lg font-bold text-ink">{t("lead_title")}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t("lead_sub")}</p>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-[10px] bg-surface-muted px-3.5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{pujaName}</p>
            <p className="truncate text-xs text-ink-soft">{packageLabel}</p>
          </div>
          <p className="tabular shrink-0 text-base font-bold text-saffron-dark">{formatInr(price)}</p>
        </div>

        <label className="mt-5 block text-sm font-semibold text-ink" htmlFor="lead-phone">
          {t("lead_phone")}
        </label>
        <div className={`${field} mt-1.5 ${error === "phone" ? "border-destructive" : "border-input"}`}>
          <span className="text-[15px] font-semibold text-ink-soft">+91</span>
          <input
            id="lead-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, ""));
              setError(null);
            }}
            placeholder={t("lead_phone_ph")}
            className="h-12 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-soft/70"
          />
        </div>
        {error === "phone" && <p className="mt-1.5 text-[13px] font-medium text-destructive">{t("lead_err_phone")}</p>}

        <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="lead-name">
          {t("lead_name")}
        </label>
        <div className={`${field} mt-1.5 ${error === "name" ? "border-destructive" : "border-input"}`}>
          <input
            id="lead-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder={t("lead_name_ph")}
            className="h-12 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-soft/70"
          />
        </div>
        {error === "name" && <p className="mt-1.5 text-[13px] font-medium text-destructive">{t("lead_err_name")}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> {t("lead_saving")}
            </>
          ) : (
            <>
              {t("lead_submit")} <ArrowRight size={18} />
            </>
          )}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
          <Lock size={12} /> {t("lead_privacy")}
        </p>
      </form>
    </BottomSheet>
  );
};

export default LeadCaptureModal;
