import { useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, XCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/*
 * Order popup → Payment. Lets the admin record a payment taken on a call (UPI / cash /
 * bank transfer), undo it, or cancel a duplicate / dropped order. All changes go through
 * the admin-order-action edge function, which first asks Razorpay whether the customer
 * already paid online, keeps an audit trail and reports the sale to Meta.
 */

export interface PaymentPanelOrder {
  id: string;
  status: string;
  amount: number; // paise
  created_at: string;
  paid_at?: string | null;
  payment_method?: string | null;
  manual_payment?: Record<string, unknown> | null;
  razorpay_payment_id?: string | null;
}

interface Props {
  order: PaymentPanelOrder;
  /** A paid order from the same customer for the same puja, if this one is a retry. */
  duplicateOf: { id: string; paid_at?: string | null; created_at: string } | null;
  onUpdated: (patch: Partial<PaymentPanelOrder>) => void;
}

const METHOD_LABELS: Record<string, string> = {
  razorpay: "Razorpay (online)", upi: "UPI (direct)", cash: "Cash", bank_transfer: "Bank transfer", other: "Other",
};
const ref8 = (id: string) => id.slice(0, 8).toUpperCase();
const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
const when = (iso?: unknown) => (typeof iso === "string" && iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

/** datetime-local value for "now" in the admin's local time. */
const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

async function callAction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-order-action", { body });
  if (error) {
    let message = "Something went wrong";
    try { message = (await (error as { context?: Response }).context?.json())?.error || message; } catch { /* keep default */ }
    throw new Error(message);
  }
  return data as { order: PaymentPanelOrder; via: string; message?: string };
}

const fieldCls = "w-full rounded-lg border border-gold/40 bg-cream px-2.5 py-1.5 text-xs font-semibold text-maroon outline-none focus:border-saffron";
const labelCls = "text-[10px] font-bold uppercase tracking-wide text-brown/50";

const OrderPaymentPanel = ({ order, duplicateOf, onUpdated }: Props) => {
  const [mode, setMode] = useState<"idle" | "pay" | "cancel">("idle");
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState("upi");
  const [amount, setAmount] = useState(String(order.amount / 100));
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(localNow());
  const [note, setNote] = useState("");
  const [reason, setReason] = useState(duplicateOf ? `Duplicate — customer paid in order ${ref8(duplicateOf.id)}` : "");
  const [dupConfirmed, setDupConfirmed] = useState(false);

  const mp = (order.manual_payment ?? {}) as Record<string, unknown>;
  const isManualPaid = order.status === "paid" && !!order.payment_method && order.payment_method !== "razorpay" && !order.razorpay_payment_id;
  const canPay = ["pending", "failed", "cancelled"].includes(order.status);
  const canCancel = ["pending", "failed"].includes(order.status);

  const run = async (body: Record<string, unknown>, success: string) => {
    setBusy(true);
    try {
      const res = await callAction({ order_id: order.id, ...body });
      onUpdated(res.order);
      toast.success(res.message || success);
      setMode("idle");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the order");
    }
    setBusy(false);
  };

  const submitPaid = () => {
    if (duplicateOf && !dupConfirmed) { toast.error("Tick the box to confirm this is a separate booking"); return; }
    if (!(Number(amount) > 0)) { toast.error("Enter the amount received"); return; }
    if ((method === "upi" || method === "bank_transfer") && !reference.trim()) {
      toast.error("Enter the UPI / bank transaction reference (UTR)"); return;
    }
    run({
      action: "mark_paid", method, amount_received: Number(amount), reference, note,
      paid_at: paidAt ? new Date(paidAt).toISOString() : undefined,
    }, "Marked as paid");
  };

  const undo = () => {
    if (!window.confirm("Undo this manual payment and move the order back to Pending?\n\nNote: a sale already reported to Meta ads cannot be withdrawn.")) return;
    run({ action: "undo_paid" }, "Moved back to Pending");
  };

  return (
    <div className="border-t border-gold/20 pt-3 space-y-2.5">
      <p className="text-[11px] text-brown/50 uppercase flex items-center gap-1.5"><Wallet size={12} /> Payment</p>

      {/* Duplicate warning */}
      {duplicateOf && order.status !== "paid" && (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <p>
            This customer already <b>paid</b> for this puja in order <b>{ref8(duplicateOf.id)}</b>
            {duplicateOf.paid_at ? ` (${when(duplicateOf.paid_at)})` : ""}. This one is most likely an earlier attempt —
            cancel it rather than following up or marking it paid.
          </p>
        </div>
      )}

      {/* Current state */}
      {order.status === "paid" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-2.5 text-xs text-green-800 space-y-0.5">
          <p className="flex items-center gap-1.5 font-bold"><CheckCircle2 size={13} /> Paid via {METHOD_LABELS[order.payment_method || "razorpay"] || order.payment_method}</p>
          {isManualPaid && (
            <>
              {typeof mp.reference === "string" && mp.reference && <p>Reference: <span className="font-mono">{mp.reference}</span></p>}
              {typeof mp.amount_received === "number" && <p>Received: {rupees(mp.amount_received)}{typeof mp.original_amount === "number" && mp.original_amount !== mp.amount_received ? ` (order was ${rupees(mp.original_amount)})` : ""}</p>}
              {typeof mp.note === "string" && mp.note && <p>Note: {mp.note}</p>}
              <p className="text-green-700/70">Marked {when(mp.marked_at)}{typeof mp.marked_by === "string" ? ` by ${mp.marked_by}` : ""}</p>
            </>
          )}
        </div>
      )}
      {order.status === "cancelled" && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-700">
          <p className="flex items-center gap-1.5 font-bold"><XCircle size={13} /> Cancelled {when(mp.cancelled_at)}</p>
          {typeof mp.cancel_reason === "string" && <p className="mt-0.5">{mp.cancel_reason}</p>}
        </div>
      )}

      {/* Actions */}
      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          {canPay && (
            <button onClick={() => setMode("pay")} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700">
              <CheckCircle2 size={13} /> Mark as paid
            </button>
          )}
          {canCancel && (
            <button onClick={() => setMode("cancel")} className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">
              <XCircle size={13} /> {duplicateOf ? "Cancel duplicate" : "Cancel order"}
            </button>
          )}
          {order.status === "cancelled" && (
            <button onClick={() => run({ action: "reopen" }, "Reopened as Pending")} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-gold/40 bg-cream px-3 py-1.5 text-xs font-bold text-maroon hover:bg-gold/20 disabled:opacity-50">
              <RotateCcw size={13} /> Reopen
            </button>
          )}
          {isManualPaid && (
            <button onClick={undo} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              <RotateCcw size={13} /> Undo manual payment
            </button>
          )}
        </div>
      )}

      {/* Mark as paid form */}
      {mode === "pay" && (
        <div className="space-y-2 rounded-xl border border-gold/30 bg-ivory p-3">
          <p className="text-xs text-brown/60">Record a payment taken outside the website. Razorpay is checked first — if the customer already paid online, that payment is used.</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-0.5"><span className={labelCls}>Paid by</span>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={fieldCls}>
                <option value="upi">UPI (direct)</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="space-y-0.5"><span className={labelCls}>Amount received (₹)</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className={fieldCls} />
            </label>
            <label className="col-span-2 space-y-0.5"><span className={labelCls}>Transaction ref / UTR {method === "upi" || method === "bank_transfer" ? "*" : "(optional)"}</span>
              <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. 426912345678" className={fieldCls} />
            </label>
            <label className="space-y-0.5"><span className={labelCls}>Paid at</span>
              <input type="datetime-local" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} max={localNow()} className={fieldCls} />
            </label>
            <label className="space-y-0.5"><span className={labelCls}>Note (optional)</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. converted on call" className={fieldCls} />
            </label>
          </div>
          {Number(amount) > 0 && Math.round(Number(amount) * 100) !== order.amount && (
            <p className="text-[11px] text-amber-700">Order total is {rupees(order.amount)}; revenue will record {rupees(Math.round(Number(amount) * 100))}.</p>
          )}
          {duplicateOf && (
            <label className="flex items-start gap-2 text-[11px] text-amber-800">
              <input type="checkbox" checked={dupConfirmed} onChange={(e) => setDupConfirmed(e.target.checked)} className="mt-0.5 accent-saffron" />
              I confirmed with the customer this is a separate, second booking (not the one already paid).
            </label>
          )}
          <div className="flex gap-2">
            <button onClick={submitPaid} disabled={busy} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50">
              {busy ? "Saving…" : "Confirm payment"}
            </button>
            <button onClick={() => setMode("idle")} className="text-xs text-brown/50 hover:text-maroon">Cancel</button>
          </div>
        </div>
      )}

      {/* Cancel form */}
      {mode === "cancel" && (
        <div className="space-y-2 rounded-xl border border-gold/30 bg-ivory p-3">
          <label className="space-y-0.5 block"><span className={labelCls}>Reason</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. customer not interested" className={fieldCls} />
          </label>
          <p className="text-[11px] text-brown/50">Cancelled orders leave the Pending count. If Razorpay ever shows a payment for it, it is marked paid automatically.</p>
          <div className="flex gap-2">
            <button onClick={() => run({ action: "cancel", reason, duplicate_of: duplicateOf?.id }, "Order cancelled")} disabled={busy}
              className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800 disabled:opacity-50">
              {busy ? "Saving…" : "Cancel order"}
            </button>
            <button onClick={() => setMode("idle")} className="text-xs text-brown/50 hover:text-maroon">Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPaymentPanel;
