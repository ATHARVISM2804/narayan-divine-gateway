import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { supabase } from "@/lib/supabase";
import { Package, LogOut, ShoppingBag, Eye, X, User } from "lucide-react";

interface Order {
  id: string;
  razorpay_payment_id: string | null;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: string;
  items: any[];
  created_at: string;
}

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

const MyOrders = () => {
  usePageTitle("My Orders — Narayan Kripa");
  const { user, loading: authLoading, signOut } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      nav("/login");
    }
  }, [user, authLoading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*")
      .eq("customer_email", user.email)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as Order[]);
        setLoading(false);
      });
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    nav("/");
  };

  if (authLoading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-saffron" />
      </main>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Devotee";

  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon via-maroon-deep to-maroon py-10">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold/70 text-sm font-serif italic">🙏 Namaste</p>
              <h1 className="font-display text-3xl text-gold md:text-4xl">{userName}</h1>
              <p className="mt-1 text-cream/70 text-sm">{user.email}</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-sm text-gold hover:bg-gold/10 transition-colors">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <h2 className="font-display text-2xl text-maroon mb-6 flex items-center gap-2">
          <Package size={22} className="text-saffron" /> My Orders
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-gold/10 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-gold/30 bg-ivory p-16 text-center">
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-gold/10">
              <ShoppingBag size={36} className="text-gold/50" />
            </div>
            <h3 className="font-display text-xl text-maroon">No orders yet</h3>
            <p className="mt-2 text-sm text-brown/60">Your puja and chadhava orders will appear here</p>
            <Link to="/puja" className="mt-6 inline-block rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors">
              Browse Pujas
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gold/30 bg-ivory p-5 shadow-soft transition-all hover:border-gold/60">
                {/* Icon */}
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-saffron/20 to-gold/20 text-2xl">
                  {o.status === "paid" ? "🪔" : o.status === "pending" ? "⏳" : "❌"}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColors[o.status] || "bg-gray-100 text-gray-500"}`}>
                      {o.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-brown/50">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-brown/70 mt-1 truncate">
                    {(o.items || []).map((item: any) => item.name).join(", ")}
                  </p>
                </div>
                {/* Price + View */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-saffron text-lg">₹{(o.amount / 100).toLocaleString("en-IN")}</span>
                  <button onClick={() => setDetail(o)} className="grid h-9 w-9 place-items-center rounded-lg bg-gold/15 text-maroon hover:bg-gold/30 transition-colors">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-ivory shadow-2xl p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg text-maroon">Order Details</h3>
              <button onClick={() => setDetail(null)} className="text-brown/50 hover:text-maroon"><X size={20} /></button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-brown/50 uppercase">Status</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColors[detail.status]}`}>{detail.status}</span>
                </div>
                <div>
                  <p className="text-[11px] text-brown/50 uppercase">Amount</p>
                  <p className="font-bold text-saffron">₹{(detail.amount / 100).toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="border-t border-gold/20 pt-3">
                <p className="text-[11px] text-brown/50 uppercase mb-1">Date</p>
                <p className="text-brown/70">{new Date(detail.created_at).toLocaleString("en-IN")}</p>
              </div>

              {detail.razorpay_payment_id && (
                <div className="border-t border-gold/20 pt-3">
                  <p className="text-[11px] text-brown/50 uppercase mb-1">Payment ID</p>
                  <p className="font-mono text-xs text-brown/60">{detail.razorpay_payment_id}</p>
                </div>
              )}

              <div className="border-t border-gold/20 pt-3">
                <p className="text-[11px] text-brown/50 uppercase mb-2">Items</p>
                {(detail.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-gold/10 last:border-0">
                    <span className="text-maroon">{item.name} <span className="text-brown/40">×{item.quantity}</span></span>
                    <span className="font-semibold text-saffron">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gold/20 pt-3 text-center">
                {detail.status === "paid" && (
                  <div className="rounded-xl bg-green-50 border border-green-200 p-3">
                    <p className="text-sm text-green-700 font-medium">✅ Payment confirmed</p>
                    <p className="text-xs text-green-600 mt-1">Your prasad will be delivered soon</p>
                  </div>
                )}
                {detail.status === "pending" && (
                  <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3">
                    <p className="text-sm text-yellow-700 font-medium">⏳ Payment pending</p>
                    <p className="text-xs text-yellow-600 mt-1">Please contact support if you've already paid</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MyOrders;
