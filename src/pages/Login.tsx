import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { Flame, Eye, EyeOff, Loader2, User, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Login = () => {
  usePageTitle("Login — Narayan Kripa");
  const nav = useNavigate();
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "signup") {
      if (!form.name.trim()) { setError(t("co_err_name")); setLoading(false); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
      const { error: err } = await signUp(form.email, form.password, form.name, form.phone);
      setLoading(false);
      if (err) { setError(err); return; }
      setSuccess("Account created! Please check your email to verify, then login.");
      setMode("login");
    } else {
      const { error: err } = await signIn(form.email, form.password);
      setLoading(false);
      if (err) {
        setError(err === "Invalid login credentials" ? "Invalid email or password" : err);
        return;
      }
      nav("/my-orders");
    }
  };

  return (
    <main className="min-h-[70vh] bg-background flex items-center justify-center py-16">
      <svg viewBox="0 0 200 200" className="pointer-events-none fixed -left-24 -bottom-24 h-[30rem] w-[30rem] text-gold/5" fill="none" stroke="currentColor" strokeWidth="0.4">
        <circle cx="100" cy="100" r="95" /><circle cx="100" cy="100" r="70" /><circle cx="100" cy="100" r="45" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="100" y1="5" x2="100" y2="195" transform={`rotate(${i * 15} 100 100)`} />
        ))}
      </svg>

      <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-3 sm:mx-4 rounded-3xl border border-gold/40 bg-ivory/95 p-6 sm:p-8 shadow-2xl backdrop-blur md:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-saffron to-maroon shadow-lg">
            <Flame size={28} className="text-gold" />
          </div>
          <h1 className="font-display text-2xl text-maroon">
            {mode === "login" ? t("login_welcome") : t("login_create")}
          </h1>
          <p className="mt-1 font-serif italic text-sm text-brown/60">
            {mode === "login" ? t("login_sub") : t("login_signup_sub")}
          </p>
        </div>

        {error && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fadeIn">{error}</div>}
        {success && <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 animate-fadeIn">{success}</div>}

        <div className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                <User size={12} /> {t("login_name")}
              </label>
              <input type="text" value={form.name} onChange={set("name")} placeholder={t("login_ph_name")}
                className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm text-brown outline-none transition-all focus:border-saffron focus:ring-2 focus:ring-saffron/20" />
            </div>
          )}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
              <Mail size={12} /> {t("login_email")}
            </label>
            <input type="email" required value={form.email} onChange={set("email")} placeholder={t("login_ph_email")}
              className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm text-brown outline-none transition-all focus:border-saffron focus:ring-2 focus:ring-saffron/20" />
          </div>
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-maroon">
                <Phone size={12} /> {t("co_phone")}
              </label>
              <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 XXXXX XXXXX"
                className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 text-sm text-brown outline-none transition-all focus:border-saffron focus:ring-2 focus:ring-saffron/20" />
            </div>
          )}
          <div>
            <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-maroon block">{t("login_password")}</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} required value={form.password} onChange={set("password")} placeholder="••••••••"
                className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 pr-11 text-sm text-brown outline-none transition-all focus:border-saffron focus:ring-2 focus:ring-saffron/20" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 hover:text-saffron transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-maroon py-3.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <><Loader2 size={18} className="animate-spin" /> {mode === "login" ? t("login_signing") : t("login_creating")}</> : mode === "login" ? t("login_signin") : t("login_signup")}
        </button>

        <div className="mt-5 text-center text-sm text-brown/60">
          {mode === "login" ? (
            <>{t("login_no_account")} <button type="button" onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} className="font-semibold text-saffron hover:text-maroon transition-colors">{t("login_signup_link")}</button></>
          ) : (
            <>{t("login_has_account")} <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className="font-semibold text-saffron hover:text-maroon transition-colors">{t("login_signin_link")}</button></>
          )}
        </div>

        <Link to="/" className="mt-4 block text-center text-xs text-brown/50 hover:text-saffron transition-colors">
          {t("login_back")}
        </Link>
      </form>
    </main>
  );
};

export default Login;
