/* Admin → New Booking: book a pooja or chadhava for a customer who called or messaged.
   The order is priced and stored exactly like a website order (admin-create-order), then
   either recorded as already paid or sent to the customer as a payment link. */
import { useEffect, useMemo, useState } from "react";
import { supabase, type Chadhava, type Puja } from "@/lib/supabase";
import { bookingDeadline } from "@/lib/countdown";
import { isValidIndianMobile } from "@/lib/phone";
import {
  BLESSING_BOX_PRICE, bookingLines, bookingTotal, memberCountFor, mobileInput, optionLabel, type BookingSelection, type PriceRow, type Tier,
} from "@/lib/manualBooking";
import { buildConfirmationMessage, buildPayLinkMessage, payLink, waLink, type MessageOrder } from "@/lib/orderMessages";
import { CheckCircle2, Copy, Loader2, MessageCircle, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

export interface BookingPrefill {
  name?: string;
  phone?: string;
  pujaId?: string;
  tierLabel?: string;
}

interface Props {
  pujas: Puja[];
  chadhavas: Chadhava[];
  prefill?: BookingPrefill | null;
  onViewOrders: () => void;
}

type Method = "upi" | "cash" | "bank_transfer" | "other";
const METHODS: { key: Method; label: string }[] = [
  { key: "upi", label: "UPI" },
  { key: "cash", label: "Cash" },
  { key: "bank_transfer", label: "Bank transfer" },
  { key: "other", label: "Other" },
];

const inputCls = "w-full rounded-xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-saffron";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon";
const cardCls = "rounded-2xl border border-gold/30 bg-ivory p-4 shadow-soft sm:p-5 space-y-4";
const stepCls = "grid h-8 w-8 place-items-center rounded-lg border border-gold/40 bg-ivory text-lg font-bold text-maroon hover:bg-gold/20";
const chip = (on: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
    on ? "border-saffron bg-saffron text-white" : "border-gold/40 bg-cream text-maroon hover:bg-gold/20"
  }`;

/** datetime-local value for "now" in the admin's local time. */
const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const sortByDeadline = <T extends { date?: string | null; countdown_datetime?: string | null }>(list: T[]) =>
  [...list].sort((a, b) =>
    (bookingDeadline(a.date, a.countdown_datetime)?.getTime() ?? Infinity) - (bookingDeadline(b.date, b.countdown_datetime)?.getTime() ?? Infinity));

const isClosed = (p: { date?: string | null; countdown_datetime?: string | null }) =>
  (bookingDeadline(p.date, p.countdown_datetime)?.getTime() ?? Infinity) < Date.now();

async function invokeCreate(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-create-order", { body });
  if (error) {
    let message = "Could not save the booking. Please try again.";
    try { message = (await (error as { context?: Response }).context?.json())?.error || message; } catch { /* keep default */ }
    throw new Error(message);
  }
  return data as { db_order_id: string; status: string; amount: number; repeated?: boolean };
}

interface PrevCustomer { customer_name: string; customer_email: string | null; customer_address: string | null; puja_details: { gotra?: string; member_names?: string[] } | null }

const ManualBooking = ({ pujas, chadhavas, prefill, onViewOrders }: Props) => {
  /* ── Customer ── */
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState("");
  const [prev, setPrev] = useState<PrevCustomer | null>(null);

  /* ── What to book ── */
  const activePujas = useMemo(() => sortByDeadline(pujas.filter((p) => p.status === "active")), [pujas]);
  const activeChadhavas = useMemo(() => sortByDeadline(chadhavas.filter((c) => c.status === "active")), [chadhavas]);
  const [pujaId, setPujaId] = useState(prefill?.pujaId ?? "");
  const [tierLabel, setTierLabel] = useState(prefill?.tierLabel ?? "");
  const [pujaAddons, setPujaAddons] = useState<PriceRow[]>([]);
  const [addonIds, setAddonIds] = useState<Set<string>>(new Set());
  const [blessingBox, setBlessingBox] = useState(false);
  const [address, setAddress] = useState("");
  const [chadhavaId, setChadhavaId] = useState("");
  const [offerings, setOfferings] = useState<(PriceRow & { qty: number })[]>([]);

  /* ── Sankalp ── */
  const [members, setMembers] = useState<string[]>([]);
  const [gotra, setGotra] = useState("");
  const [gotraUnknown, setGotraUnknown] = useState(false);

  /* ── Amount and payment ── */
  const [changeAmount, setChangeAmount] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountNote, setAmountNote] = useState("");
  const [payMode, setPayMode] = useState<"paid" | "link">("paid");
  const [method, setMethod] = useState<Method>("upi");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(localNow());
  const [payNote, setPayNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<(MessageOrder & { status: string }) | null>(null);

  const puja = activePujas.find((p) => p.id === pujaId) ?? null;
  const tier: Tier | null = puja?.prices?.find((t) => t.label === tierLabel) ?? null;
  const memberCount = tier ? memberCountFor(tier.label) : 0;

  /* The pooja's add-ons, and the chadhava's offerings, for the one chosen. */
  useEffect(() => {
    setPujaAddons([]); setAddonIds(new Set());
    if (!pujaId) return;
    supabase.from("puja_offerings").select("id, name, price").eq("puja_id", pujaId).eq("status", "active").order("sort_order")
      .then(({ data }) => setPujaAddons((data ?? []) as PriceRow[]));
  }, [pujaId]);
  useEffect(() => {
    setOfferings([]);
    if (!chadhavaId) return;
    supabase.from("chadhava_offerings").select("id, name, price").eq("chadhava_id", chadhavaId).eq("status", "active").order("sort_order")
      .then(({ data }) => setOfferings(((data ?? []) as PriceRow[]).map((o) => ({ ...o, qty: 0 }))));
  }, [chadhavaId]);

  /* A package with more people asks for more sankalp names (same rule as Checkout). */
  useEffect(() => {
    setMembers((m) => Array.from({ length: memberCount }, (_, i) => m[i] ?? ""));
  }, [memberCount]);

  /* A returning customer: offer the details from their last order. */
  useEffect(() => {
    setPrev(null);
    if (!isValidIndianMobile(phone)) return;
    let live = true;
    supabase.from("orders").select("customer_name, customer_email, customer_address, puja_details")
      .eq("customer_phone", phone).order("created_at", { ascending: false }).limit(1)
      .then(({ data }) => { if (live && data?.[0]) setPrev(data[0] as PrevCustomer); });
    return () => { live = false; };
  }, [phone]);

  const usePrevious = () => {
    if (!prev) return;
    setName(prev.customer_name || name);
    if (prev.customer_email) setEmail(prev.customer_email);
    if (prev.customer_address) setAddress(prev.customer_address);
    if (prev.puja_details?.gotra) { setGotra(prev.puja_details.gotra); setGotraUnknown(false); }
    const names = prev.puja_details?.member_names ?? [];
    if (names.length) setMembers((m) => m.map((v, i) => v || names[i] || ""));
    toast.success("Filled in from the last booking of this number");
  };

  // Up to 10 of one offering, the same limit as the website.
  const changeQty = (index: number, by: number) =>
    setOfferings((list) => list.map((x, j) => (j === index ? { ...x, qty: Math.min(10, Math.max(0, x.qty + by)) } : x)));

  const selection: BookingSelection = {
    puja: puja && tier ? { id: puja.id, tier, addons: pujaAddons.filter((a) => addonIds.has(a.id)) } : null,
    blessingBox,
    chadhava: chadhavaId ? { offerings } : null,
  };
  const lines = bookingLines(selection);
  const total = bookingTotal(selection);
  const finalAmount = changeAmount && amount !== "" ? Number(amount) : total;

  /* ── Checks before saving (the server checks again) ── */
  const problem = (() => {
    if (!isValidIndianMobile(phone)) return "Enter the customer's 10-digit mobile number.";
    if (!name.trim()) return "Enter the customer's name.";
    if (pujaId && !tier) return "Choose the pooja package.";
    if (lines.length === 0) return "Choose a pooja or at least one chadhava offering.";
    if (selection.puja && !gotraUnknown && !gotra.trim()) return "Enter the gotra, or tick \"Doesn't know\".";
    if (selection.puja && blessingBox && !address.trim()) return "Enter the delivery address for the Blessing Box.";
    if (changeAmount) {
      if (!(finalAmount >= 1)) return "Enter the amount (at least ₹1).";
      if (finalAmount !== total && !amountNote.trim()) return "Say why the amount was changed.";
    }
    if (payMode === "paid" && (method === "upi" || method === "bank_transfer") && !reference.trim()) {
      return "Enter the UPI / bank reference (UTR).";
    }
    return null;
  })();

  const save = async () => {
    if (problem) { toast.error(problem); return; }
    setSaving(true);
    try {
      const memberNames = members.map((m, i) => (i === 0 && !m.trim() ? name.trim() : m.trim())).filter(Boolean);
      const res = await invokeCreate({
        items: lines,
        customer: { name: name.trim(), phone, email: email.trim() || undefined, address: selection.puja && blessingBox ? address.trim() : undefined },
        puja_details: selection.puja ? { member_names: memberNames, gotra: gotraUnknown ? "Kashyap" : gotra.trim() } : undefined,
        amount_override: changeAmount && amount !== "" ? Number(amount) : undefined,
        amount_note: amountNote.trim() || undefined,
        payment: payMode === "paid"
          ? { mode: "paid", method, reference: reference.trim(), paid_at: new Date(paidAt).toISOString(), note: payNote.trim() }
          : { mode: "link" },
      });
      // Read back what was stored (names, dates) for the WhatsApp message.
      const { data } = await supabase.from("orders").select("id, customer_name, customer_phone, amount, items, status")
        .eq("id", res.db_order_id).maybeSingle();
      setDone((data as MessageOrder & { status: string }) ?? {
        id: res.db_order_id, customer_name: name.trim(), customer_phone: phone, amount: res.amount, items: [], status: res.status,
      });
      toast.success(res.repeated ? "This booking was already saved a moment ago" : "Booking saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the booking");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setPhone(""); setName(""); setEmail(""); setPrev(null);
    setPujaId(""); setTierLabel(""); setBlessingBox(false); setAddress(""); setChadhavaId("");
    setMembers([]); setGotra(""); setGotraUnknown(false);
    setChangeAmount(false); setAmount(""); setAmountNote("");
    setPayMode("paid"); setMethod("upi"); setReference(""); setPaidAt(localNow()); setPayNote("");
    setDone(null);
  };

  /* ── Saved: what to do next ── */
  if (done) {
    const paid = done.status === "paid";
    const link = payLink(done.id);
    const message = paid ? buildConfirmationMessage(done) : buildPayLinkMessage(done, link);
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div className={`${cardCls} text-center`}>
          <CheckCircle2 size={40} className="mx-auto text-green-600" />
          <h3 className="font-display text-xl text-maroon">{paid ? "Booking saved as PAID" : "Booking saved, waiting for payment"}</h3>
          <p className="text-sm text-brown/70">
            {done.customer_name} · +91 {done.customer_phone} · ₹{(done.amount / 100).toLocaleString("en-IN")}
            <br />Order ref <span className="font-bold text-maroon">{done.id.slice(0, 8).toUpperCase()}</span>
          </p>
          {!paid && (
            <div className="flex items-center gap-2 rounded-xl border border-gold/40 bg-cream px-3 py-2 text-left">
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-maroon">{link}</span>
              <button
                onClick={() => { void navigator.clipboard?.writeText(link); toast.success("Payment link copied"); }}
                className="flex items-center gap-1 rounded-lg bg-gold/20 px-2.5 py-1.5 text-xs font-bold text-maroon hover:bg-gold/30"
              >
                <Copy size={13} /> Copy
              </button>
            </div>
          )}
          <a
            href={waLink(done.customer_phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-white hover:bg-green-600"
          >
            <MessageCircle size={16} /> {paid ? "Send confirmation on WhatsApp" : "Send payment link on WhatsApp"}
          </a>
          <div className="flex gap-2">
            <button onClick={onViewOrders} className="flex-1 rounded-xl border border-gold/50 px-4 py-2.5 text-sm font-semibold text-maroon hover:bg-gold/10">
              View in Orders
            </button>
            <button onClick={reset} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-saffron px-4 py-2.5 text-sm font-bold text-white hover:bg-maroon">
              <Plus size={15} /> New booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="text-sm text-brown/70">
        For a customer who booked on a call or WhatsApp. It is saved like a website order: it shows in Orders,
        the pandit list and the customer's "My Orders".
      </p>

      {/* 1. Customer */}
      <section className={cardCls}>
        <h3 className="font-display text-lg text-maroon">1. Customer</h3>
        <div>
          <label htmlFor="mb-field-0" className={labelCls}>Mobile number *</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-brown/60">+91</span>
            <input id="mb-field-0"
              value={phone}
              onChange={(e) => setPhone(mobileInput(e.target.value))}
              inputMode="numeric"
              placeholder="10-digit mobile"
              className={inputCls}
            />
          </div>
          {prev && (
            <button onClick={usePrevious} className="mt-2 flex items-center gap-1.5 rounded-lg bg-gold/15 px-3 py-1.5 text-xs font-bold text-maroon hover:bg-gold/25">
              <RotateCcw size={12} /> Booked before as {prev.customer_name}: use those details
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="mb-field-1" className={labelCls}>Name *</label>
            <input id="mb-field-1" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Customer's name" />
          </div>
          <div>
            <label htmlFor="mb-field-2" className={labelCls}>Email (optional)</label>
            <input id="mb-field-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} />
          </div>
        </div>
      </section>

      {/* 2. What to book */}
      <section className={cardCls}>
        <h3 className="font-display text-lg text-maroon">2. What to book</h3>
        <div>
          <label htmlFor="mb-field-3" className={labelCls}>Pooja</label>
          <select id="mb-field-3" value={pujaId} onChange={(e) => { setPujaId(e.target.value); setTierLabel(""); }} className={inputCls}>
            <option value="">No pooja</option>
            {activePujas.map((p) => (
              <option key={p.id} value={p.id}>{optionLabel(p.name, p.date, p.location, isClosed(p) ? "booking closed" : null)}</option>
            ))}
          </select>
        </div>
        {puja && (
          <div className="space-y-3 rounded-xl border border-gold/30 bg-cream/60 p-3">
            <div>
              <p className={labelCls}>Package *</p>
              <div className="flex flex-wrap gap-2">
                {(puja.prices ?? []).map((t) => (
                  <button key={t.label} onClick={() => setTierLabel(t.label)} className={chip(t.label === tierLabel)}>
                    {t.label} · ₹{t.price.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>
            {pujaAddons.length > 0 && (
              <div>
                <p className={labelCls}>Add-ons</p>
                <div className="flex flex-wrap gap-2">
                  {pujaAddons.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAddonIds((s) => { const n = new Set(s); if (n.has(a.id)) n.delete(a.id); else n.add(a.id); return n; })}
                      className={chip(addonIds.has(a.id))}
                    >
                      {a.name} · ₹{a.price.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm font-semibold text-maroon">
              <input type="checkbox" checked={blessingBox} onChange={(e) => setBlessingBox(e.target.checked)} className="h-4 w-4 accent-saffron" />
              Blessing Box (prasad by post) · ₹{BLESSING_BOX_PRICE}
            </label>
            {blessingBox && (
              <div>
                <label htmlFor="mb-field-4" className={labelCls}>Delivery address with pincode *</label>
                <textarea id="mb-field-4" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={inputCls} />
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="mb-field-5" className={labelCls}>Chadhava</label>
          <select id="mb-field-5" value={chadhavaId} onChange={(e) => setChadhavaId(e.target.value)} className={inputCls}>
            <option value="">No chadhava</option>
            {activeChadhavas.map((c) => (
              <option key={c.id} value={c.id}>{optionLabel(c.item, c.temple, c.date, isClosed(c) ? "booking closed" : null)}</option>
            ))}
          </select>
        </div>
        {chadhavaId && (
          <div className="space-y-2 rounded-xl border border-gold/30 bg-cream/60 p-3">
            {offerings.length === 0 && <p className="text-xs text-brown/60">Loading offerings…</p>}
            {offerings.map((o, i) => (
              <div key={o.id} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 text-sm font-semibold text-maroon">{o.name} <span className="text-brown/50">₹{o.price.toLocaleString("en-IN")}</span></span>
                <div className="flex items-center gap-1">
                  <button aria-label={`Fewer ${o.name}`} onClick={() => changeQty(i, -1)} className={stepCls}>−</button>
                  <span className="w-6 text-center text-sm font-bold">{o.qty}</span>
                  <button aria-label={`More ${o.name}`} onClick={() => changeQty(i, 1)} className={stepCls}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Sankalp */}
      {selection.puja && (
        <section className={cardCls}>
          <h3 className="font-display text-lg text-maroon">3. Sankalp details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {members.map((m, i) => (
              <div key={i}>
                <label htmlFor={`mb-member-${i}`} className={labelCls}>Member {i + 1}{i === 0 ? " *" : ""}</label>
                <input id={`mb-member-${i}`}
                  value={m}
                  onChange={(e) => setMembers((list) => list.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder={i === 0 ? name || "Name for the sankalp" : "Name (optional)"}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="mb-field-7" className={labelCls}>Gotra *</label>
            <input id="mb-field-7" value={gotra} disabled={gotraUnknown} onChange={(e) => setGotra(e.target.value)} placeholder="e.g. Kashyap" className={`${inputCls} disabled:opacity-50`} />
            <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-brown/70">
              <input type="checkbox" checked={gotraUnknown} onChange={(e) => setGotraUnknown(e.target.checked)} className="h-4 w-4 accent-saffron" />
              Doesn't know (Kashyap gotra is used, as on the website)
            </label>
          </div>
        </section>
      )}

      {/* 4. Amount and payment */}
      <section className={cardCls}>
        <h3 className="font-display text-lg text-maroon">{selection.puja ? "4" : "3"}. Amount and payment</h3>
        <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-cream px-4 py-3">
          <span className="text-sm font-semibold text-brown/70">Total</span>
          <span className="text-2xl font-bold text-saffron">
            ₹{(Number.isFinite(finalAmount) ? finalAmount : 0).toLocaleString("en-IN")}
            {changeAmount && finalAmount !== total && <span className="ml-2 text-sm font-semibold text-brown/50 line-through">₹{total.toLocaleString("en-IN")}</span>}
          </span>
        </div>
        {!changeAmount ? (
          <button onClick={() => { setChangeAmount(true); setAmount(String(total)); }} className="text-xs font-semibold text-saffron underline">
            Change amount (discount or special price)
          </button>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="mb-field-8" className={labelCls}>Amount charged (₹)</label>
              <input id="mb-field-8" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className={inputCls} />
            </div>
            <div>
              <label htmlFor="mb-field-9" className={labelCls}>Why changed *</label>
              <input id="mb-field-9" value={amountNote} onChange={(e) => setAmountNote(e.target.value)} placeholder="e.g. family discount" className={inputCls} />
            </div>
            <button onClick={() => { setChangeAmount(false); setAmount(""); setAmountNote(""); }} className="flex items-center gap-1 text-xs font-semibold text-red-500">
              <X size={12} /> Use the normal price
            </button>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {([
            { key: "paid", title: "Already paid", desc: "Paid you by UPI, cash or bank" },
            { key: "link", title: "Send payment link", desc: "Customer pays online, it turns PAID by itself" },
          ] as const).map((o) => (
            <button
              key={o.key}
              onClick={() => setPayMode(o.key)}
              className={`rounded-xl border-2 p-3 text-left transition-colors ${payMode === o.key ? "border-saffron bg-saffron/10" : "border-gold/30 bg-cream hover:border-saffron/50"}`}
            >
              <p className="text-sm font-bold text-maroon">{o.title}</p>
              <p className="text-xs text-brown/60">{o.desc}</p>
            </button>
          ))}
        </div>

        {payMode === "paid" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {METHODS.map((m) => <button key={m.key} onClick={() => setMethod(m.key)} className={chip(method === m.key)}>{m.label}</button>)}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="mb-field-10" className={labelCls}>UTR / reference{method === "upi" || method === "bank_transfer" ? " *" : ""}</label>
                <input id="mb-field-10" value={reference} onChange={(e) => setReference(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="mb-field-11" className={labelCls}>Paid at</label>
                <input id="mb-field-11" type="datetime-local" value={paidAt} max={localNow()} onChange={(e) => setPaidAt(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label htmlFor="mb-field-12" className={labelCls}>Note (optional)</label>
              <input id="mb-field-12" value={payNote} onChange={(e) => setPayNote(e.target.value)} className={inputCls} />
            </div>
          </div>
        )}
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-gold/30 bg-cream px-4 py-3 lg:-mx-6 lg:px-6">
        {problem && <p className="mb-2 text-xs font-semibold text-amber-700">{problem}</p>}
        <button
          onClick={save}
          disabled={saving || !!problem}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-saffron px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-maroon disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {payMode === "paid" ? "Save paid booking" : "Save and get payment link"}
          {Number.isFinite(finalAmount) && finalAmount > 0 && ` · ₹${finalAmount.toLocaleString("en-IN")}`}
        </button>
      </div>
    </div>
  );
};

export default ManualBooking;
