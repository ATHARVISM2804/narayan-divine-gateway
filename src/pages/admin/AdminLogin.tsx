import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Flame, Eye, EyeOff, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Invalid email or password" : err.message);
    } else {
      nav("/admin");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-maroon-deep via-maroon to-maroon-deep p-4">
      {/* Decorative mandala */}
      <svg viewBox="0 0 200 200" className="pointer-events-none fixed -right-32 -top-32 h-[36rem] w-[36rem] text-gold/10" fill="none" stroke="currentColor" strokeWidth="0.4">
        <circle cx="100" cy="100" r="95" /><circle cx="100" cy="100" r="70" /><circle cx="100" cy="100" r="45" />
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1="100" y1="5" x2="100" y2="195" transform={`rotate(${i * 11.25} 100 100)`} />
        ))}
      </svg>

      <form onSubmit={handleLogin} className="relative w-full max-w-md rounded-3xl border border-gold/40 bg-ivory/95 p-8 shadow-2xl backdrop-blur md:p-10">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-saffron to-maroon shadow-lg">
            <Flame size={28} className="text-gold" />
          </div>
          <h1 className="font-display text-2xl text-maroon">Admin Panel</h1>
          <p className="mt-1 font-serif italic text-sm text-brown/60">Narayan Kripa Management</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fadeIn">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@narayankripa.com"
              className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm text-brown outline-none transition-all focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-maroon">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 pr-11 text-sm text-brown outline-none transition-all focus:border-saffron focus:ring-2 focus:ring-saffron/20"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 hover:text-saffron transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-3.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : "Sign In"}
        </button>

        <a href="/" className="mt-5 block text-center text-xs text-brown/50 hover:text-saffron transition-colors">
          ← Back to website
        </a>
      </form>
    </div>
  );
};

export default AdminLogin;
