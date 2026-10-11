import { useState } from "react";
import { Bell, CalendarDays, Check, Loader2, MessageCircle, Smartphone, Video } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { DiyaIcon } from "@/components/icons";

/** "App coming soon" with a waitlist that saves the number as a lead
    (source app_waitlist), so the admin can message people at launch. */
const AppDownload = () => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  const features = [
    { icon: DiyaIcon, label: t("app_f1") },
    { icon: Video, label: t("app_f2") },
    { icon: MessageCircle, label: t("app_f3") },
    { icon: CalendarDays, label: t("app_f4") },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) return setState("error");
    setState("saving");
    try {
      await supabase.from("leads").insert({ name: "App waitlist", phone, source: "app_waitlist" });
    } catch {
      // A failed save is not worth an error screen here.
    }
    setState("done");
  };

  return (
    <section className="border-t border-line py-12 md:py-16">
      <div className="container">
        <div className="grid gap-6 rounded-2xl border border-line bg-surface p-5 md:grid-cols-[1.2fr_1fr] md:items-center md:p-10">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1 text-xs font-semibold text-maroon">
              <Smartphone size={14} /> {t("app_badge")} · {t("app_coming")}
            </p>
            <h2 className="mt-3 text-xl font-bold text-ink md:text-2xl">{t("app_title")}</h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-muted">{t("app_desc")}</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Icon size={18} strokeWidth={1.75} className="shrink-0 text-saffron-dark" /> {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-surface-muted p-4 md:p-5">
            {state === "done" ? (
              <p className="flex items-start gap-2 text-[15px] font-medium text-ink">
                <Check size={20} className="shrink-0 text-success" /> {t("app_notify_done")}
              </p>
            ) : (
              <form onSubmit={submit} noValidate>
                <label htmlFor="app-phone" className="text-sm font-semibold text-ink">
                  {t("lead_phone")}
                </label>
                <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-input bg-surface px-3 focus-within:border-saffron">
                    <span className="text-[15px] font-semibold text-ink-soft">+91</span>
                    <input
                      id="app-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""));
                        if (state === "error") setState("idle");
                      }}
                      placeholder={t("app_ph_phone")}
                      className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-soft/70"
                    />
                  </div>
                  <button type="submit" disabled={state === "saving"} className="btn-secondary">
                    {state === "saving" ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />} {t("app_notify")}
                  </button>
                </div>
                {state === "error" && <p className="mt-1.5 text-[13px] font-medium text-destructive">{t("app_notify_err")}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
