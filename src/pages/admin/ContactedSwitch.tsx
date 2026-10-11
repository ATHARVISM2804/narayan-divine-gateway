/* "Not contacted / Contacted" switch on a lead or order card. Switching it marks every
   lead and order with the same phone number (see src/lib/contacted.ts). */

const shortDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

interface Props {
  contactedAt: string | null | undefined;
  saving: boolean;
  onToggle: () => void;
  /** When this row is not contacted but an older lead/order of the same number was. */
  numberContactedAt?: string | null;
}

const ContactedSwitch = ({ contactedAt, saving, onToggle, numberContactedAt }: Props) => {
  const on = Boolean(contactedAt);
  return (
    <div className="flex flex-col items-start shrink-0">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={saving}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        title={on ? "Contacted — tap to mark Not contacted" : "Tap after you call or WhatsApp this customer"}
        className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-bold transition-colors disabled:opacity-60 ${
          on ? "border-green-300 bg-green-50 text-green-700" : "border-gold/40 bg-cream text-brown/60 hover:bg-gold/15"
        }`}
      >
        <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-green-500" : "bg-brown/20"}`}>
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"} ${
              saving ? "animate-pulse" : ""
            }`}
          />
        </span>
        {on ? "Contacted" : "Not contacted"}
      </button>
      {on && contactedAt && <span className="mt-0.5 pl-1 text-[10px] text-green-700/80">{shortDateTime(contactedAt)}</span>}
      {!on && numberContactedAt && (
        <span className="mt-0.5 pl-1 text-[10px] text-amber-700">Number contacted {shortDate(numberContactedAt)}</span>
      )}
    </div>
  );
};

export default ContactedSwitch;
