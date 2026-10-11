import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { Eye, EyeOff, Loader2, User, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Login = () => {
  usePageTitle("Login | Narayan Kripa");
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
    <main className="flex min-h-[70vh] items-center justify-center py-10">
      <form onSubmit={handleSubmit} className="mx-4 w-full max-w-md rounded-xl border border-line bg-surface p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-ink">
            {mode === "login" ? t("login_welcome") : t("login_create")}
          </h1>
          <p className="mt-1 text-[15px] text-ink-muted">
            {mode === "login" ? t("login_sub") : t("login_signup_sub")}
          </p>
        </div>

        {error && <div className="mb-5 rounded-[10px] bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
        {success && <div className="mb-5 rounded-[10px] bg-success/10 px-4 py-3 text-sm font-medium text-success">{success}</div>}

        <div className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                <User size={12} /> {t("login_name")}
              </label>
              <input type="text" value={form.name} onChange={set("name")} placeholder={t("login_ph_name")}
                className="h-12 w-full rounded-[10px] border border-input bg-surface px-3 text-[15px] text-ink outline-none focus:border-saffron" />
            </div>
          )}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
              <Mail size={12} /> {t("login_email")}
            </label>
            <input type="email" required value={form.email} onChange={set("email")} placeholder={t("login_ph_email")}
              className="h-12 w-full rounded-[10px] border border-input bg-surface px-3 text-[15px] text-ink outline-none focus:border-saffron" />
          </div>
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                <Phone size={12} /> {t("co_phone")}
              </label>
              <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 XXXXX XXXXX"
                className="h-12 w-full rounded-[10px] border border-input bg-surface px-3 text-[15px] text-ink outline-none focus:border-saffron" />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">{t("login_password")}</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} required value={form.password} onChange={set("password")} placeholder="••••••••"
                className="h-12 w-full rounded-[10px] border border-input bg-surface px-3 pr-11 text-[15px] text-ink outline-none focus:border-saffron" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary mt-6 w-full">
          {loading ? <><Loader2 size={18} className="animate-spin" /> {mode === "login" ? t("login_signing") : t("login_creating")}</> : mode === "login" ? t("login_signin") : t("login_signup")}
        </button>

        <div className="mt-5 text-center text-sm text-ink-muted">
          {mode === "login" ? (
            <>{t("login_no_account")} <button type="button" onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} className="font-semibold text-saffron-dark hover:underline">{t("login_signup_link")}</button></>
          ) : (
            <>{t("login_has_account")} <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className="font-semibold text-saffron-dark hover:underline">{t("login_signin_link")}</button></>
          )}
        </div>

        <Link to="/" className="mt-4 block text-center text-sm text-ink-soft hover:text-ink">
          {t("login_back")}
        </Link>
      </form>
    </main>
  );
};

export default Login;
