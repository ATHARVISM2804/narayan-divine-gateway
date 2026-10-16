import { useState } from "react";
import { ArrowLeft, ChevronsRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMetaTrackingContext, newMetaEventId, trackLead } from "@/lib/metaPixel";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface Props {
  pujaName: string;
  packageLabel: string;
  price: number;
  onConfirm: (name: string, phone: string) => void;
  /** Shows the ← arrow back to the package step. */
  onBack?: () => void;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className={className}><path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.908 1.885 7.054L2 30l7.144-1.87A14.034 14.034 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.6a11.62 11.62 0 0 1-5.923-1.62l-.425-.252-4.24 1.11 1.132-4.134-.277-.446A11.563 11.563 0 0 1 4.4 16.003c0-6.4 5.203-11.6 11.603-11.6s11.598 5.2 11.598 11.6-5.198 11.597-11.598 11.597zm6.36-8.68c-.348-.174-2.063-1.018-2.383-1.133-.32-.116-.552-.174-.786.174-.233.348-.902 1.133-1.107 1.366-.203.232-.407.26-.755.086-.348-.174-1.47-.543-2.8-1.727-1.034-.922-1.73-2.06-1.934-2.407-.203-.348-.022-.535.152-.707.157-.155.348-.406.523-.61.174-.202.232-.347.348-.578.116-.232.058-.435-.03-.61-.086-.173-.785-1.892-1.075-2.59-.284-.682-.573-.59-.785-.6l-.67-.012c-.232 0-.61.087-.928.435-.32.347-1.22 1.192-1.22 2.91s1.25 3.378 1.422 3.61c.174.232 2.46 3.757 5.96 5.27.834.36 1.483.575 1.99.736.836.267 1.598.23 2.2.14.672-.1 2.063-.843 2.353-1.658.29-.812.29-1.51.203-1.658-.087-.145-.32-.23-.67-.406z" /></svg>
);

/** A returning visitor's details, saved after their first lead. */
const savedLead = (): { name: string; phone: string } => {
  try {
    const v = JSON.parse(localStorage.getItem("nk_lead") || "null");
    return { name: typeof v?.name === "string" ? v.name : "", phone: typeof v?.phone === "string" ? v.phone : "" };
  } catch {
    return { name: "", phone: "" };
  }
};

/** "Fill your details" step of the booking popup, laid out like Sri Mandir's:
    WhatsApp number + name before checkout. Saves the lead (and sends Meta a Lead event) but never blocks the
    booking if saving fails. */
const LeadForm = ({ pujaName, packageLabel, price, onConfirm, onBack }: Props) => {
  const { t } = useLanguage();
  const [initial] = useState(savedLead);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [error, setError] = useState<"name" | "phone" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!/^\d{10}$/.test(phone.trim())) return setError("phone");
    if (!name.trim()) return setError("name");
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

    try {
      localStorage.setItem("nk_lead", JSON.stringify({ name: name.trim(), phone: phone.trim() }));
    } catch {
      // Private mode: the next visit just starts with empty fields.
    }
    trackLead({ name: `${pujaName} (${packageLabel})`, value: price, eventId });

    setLoading(false);
    onConfirm(name.trim(), phone.trim());
  };

  const phoneOk = /^\d{10}$/.test(phone.trim());
  const ready = phoneOk && name.trim().length > 0;
  const steps = [t("step_details"), t("step_review"), t("step_payment")];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
    >
      {/* Phones show where this step sits in the booking, like Sri Mandir. */}
      <ol className="flex items-center gap-1.5 bg-surface-muted px-4 py-2.5 text-[12px] font-medium text-ink-soft md:hidden">
        {steps.map((label, i) => (
          <li key={label} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <ChevronsRight size={14} className="shrink-0 text-ink-soft/70" />}
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px]",
                i === 0 ? "border-saffron-dark text-saffron-dark" : "border-ink-soft/50",
              )}
            >
              {i + 1}
            </span>
            <span className={cn("leading-tight", i === 0 && "font-semibold text-saffron-dark")}>{label}</span>
          </li>
        ))}
      </ol>

      <div className="flex items-center gap-1.5 border-b border-line px-3 py-3 md:px-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={t("lead_back")}
            title={t("lead_back")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className={cn("text-lg font-bold leading-snug text-ink", !onBack && "pl-2")}>{t("lead_details_title")}</h2>
      </div>

      <div className="px-4 pb-6 pt-4 md:px-5">
        <label className="block text-[15px] font-bold text-ink" htmlFor="lead-phone">
          {t("lead_phone_title")}
        </label>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{t("lead_phone_help")}</p>
        <div
          className={cn(
            "relative mt-4 flex items-center gap-2.5 rounded-[10px] border-2 bg-surface px-3 transition-colors focus-within:border-saffron",
            error === "phone" ? "border-destructive" : "border-input",
          )}
        >
          <span className="absolute -top-2.5 left-2.5 bg-surface px-1 text-[11px] font-medium text-ink-soft">{t("lead_phone_float")}</span>
          <WhatsAppIcon className="h-5 w-5 shrink-0 fill-[#25D366]" />
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
            aria-invalid={error === "phone"}
            className="h-12 min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none"
          />
        </div>
        {error === "phone" && <p className="mt-1.5 text-[13px] font-medium text-destructive">{t("lead_err_phone")}</p>}

        <label className="mt-6 block text-[15px] font-bold text-ink" htmlFor="lead-name">
          {t("lead_name_title")}
        </label>
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
          aria-invalid={error === "name"}
          className={cn(
            "mt-2.5 h-12 w-full rounded-[10px] border bg-surface px-3 text-[15px] font-medium text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-saffron",
            error === "name" ? "border-destructive" : "border-input",
          )}
        />
        {error === "name" && <p className="mt-1.5 text-[13px] font-medium text-destructive">{t("lead_err_name")}</p>}

        {/* Grey until both fields are filled, then saffron, like Sri Mandir's Next. */}
        <button
          type="submit"
          disabled={!ready || loading}
          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-saffron text-[16px] font-semibold text-white transition-colors hover:bg-saffron-dark disabled:cursor-not-allowed disabled:bg-ink-soft/40"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> {t("lead_saving")}
            </>
          ) : (
            t("lead_next")
          )}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;
