import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function SignIn() {
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin");
  const [selectedRole, setSelectedRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("Computer Science Engineering");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault(); setError("");
    if (!email || !password) { setError("Please fill in both email and password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    const userData = login(email, password, selectedRole, {
      name: fullName || (selectedRole === "teacher" ? "Dr. Debajit Sharma" : "Student Name"),
      department, college: "Dibrugarh University",
    });
    setSuccessMsg(`Welcome, ${userData.name}! Redirecting…`);
    setTimeout(() => navigate(userData.role === "teacher" ? "/teacher" : "/student"), 600);
  };

  const handleQuickDemo = (role) => {
    setError("");
    login(
      role === "teacher" ? "teacher@dibru.ac.in" : "student@example.com",
      "demo123", role,
      { name: role === "teacher" ? "Dr. Debajit Sharma" : "Student Name", department: "Computer Science Engineering", college: "Dibrugarh University" }
    );
    navigate(role === "teacher" ? "/teacher" : "/student");
  };

  const handleGoogleSSO = () => {
    login(
      selectedRole === "teacher" ? "teacher@dibru.ac.in" : "student@dibru.ac.in",
      "sso_token", selectedRole,
      { name: selectedRole === "teacher" ? "Dr. Debajit Sharma (SSO)" : "Student Name (SSO)", department: "Computer Science Engineering", college: "Dibrugarh University" }
    );
    navigate(selectedRole === "teacher" ? "/teacher" : "/student");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => { setIsForgotModalOpen(false); setResetSuccess(false); setResetEmail(""); }, 2500);
  };

  const inputCls = "w-full rounded-xl border border-brand-line bg-brand-hero px-3.5 py-2.5 text-sm text-brand-head placeholder:text-brand-muted/60 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition";

  return (
    <div className="min-h-screen bg-brand-hero flex flex-col justify-between p-4 sm:p-6">
      {/* Top bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="LearnMate" className="h-10 w-auto object-contain" />
        </div>
        {/* Language */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-brand-line shadow-sm">
          {["en", "as"].map((code) => (
            <button key={code} onClick={() => setLang(code)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${lang === code ? "bg-brand text-white shadow-sm" : "text-brand-muted hover:text-brand"}`}>
              {code === "en" ? "English" : "অসমীয়া"}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="my-auto max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg border border-brand-line p-6 sm:p-8 space-y-5">
        {/* Logo */}
        <div className="text-center">
          <img src="/logo.png" alt="LearnMate" className="h-14 w-auto object-contain mx-auto mb-3" />
          <h2 className="text-xl font-black text-brand-head">
            {mode === "signin" ? t("auth.welcomeBack") : t("auth.register")}
          </h2>
          <p className="text-xs text-brand-muted mt-1">
            {mode === "signin" ? t("auth.signInSubtitle") : t("auth.createSubtitle")}
          </p>
        </div>

        {/* Mode switch */}
        <div className="flex bg-brand-hero p-1 rounded-xl border border-brand-line">
          {["signin", "register"].map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${mode === m ? "bg-white text-brand shadow-sm" : "text-brand-muted hover:text-brand"}`}>
              {m === "signin" ? t("auth.signIn") : t("auth.register")}
            </button>
          ))}
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { r: "student", emoji: "🎓", label: t("auth.roleStudent") },
            { r: "teacher", emoji: "👨‍🏫", label: t("auth.roleTeacher") },
          ].map(({ r, emoji, label }) => (
            <button key={r} type="button" onClick={() => setSelectedRole(r)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedRole === r
                  ? "border-brand bg-brand-tint text-brand shadow-sm"
                  : "border-brand-line bg-brand-hero text-brand-head hover:border-brand/40"
              }`}>
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>

        {/* Quick demo */}
        <div className="bg-brand-tint border border-brand-line p-3 rounded-xl space-y-2">
          <div className="text-[11px] font-bold text-brand uppercase tracking-widest text-center">{t("auth.quickDemo")}</div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => handleQuickDemo("student")}
              className="rounded-xl bg-white border border-brand-line px-2.5 py-2 text-xs font-bold text-brand-head hover:bg-brand hover:text-white hover:border-brand transition">
              🎓 Student Demo
            </button>
            <button type="button" onClick={() => handleQuickDemo("teacher")}
              className="rounded-xl bg-white border border-brand-line px-2.5 py-2 text-xs font-bold text-brand-head hover:bg-brand hover:text-white hover:border-brand transition">
              👨‍🏫 Faculty Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl bg-brand-tint border border-brand/20 p-3 text-brand text-xs font-semibold flex items-center gap-2">
            <span>✅</span><span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-brand-head mb-1.5">{t("auth.nameLabel")}</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Arindam Borah" className={inputCls} />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-brand-head mb-1.5">{t("auth.emailLabel")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={selectedRole === "teacher" ? "faculty@dibru.ac.in" : "student@example.com"} className={inputCls} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-brand-head">{t("auth.passwordLabel")}</label>
              {mode === "signin" && (
                <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-[11px] text-brand hover:underline font-semibold">
                  {t("auth.forgotPassword")}
                </button>
              )}
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-2.5 text-brand-muted hover:text-brand-head text-sm transition">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-brand-head mb-1.5">{t("auth.departmentLabel")}</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls}>
                <option>Computer Science Engineering</option>
                <option>Electronics &amp; Communication</option>
                <option>Mechanical Engineering</option>
                <option>Petroleum Technology</option>
              </select>
            </div>
          )}
          {mode === "signin" && (
            <label className="flex items-center gap-2 text-xs text-brand-muted cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-brand-line text-brand focus:ring-brand" />
              {t("auth.rememberMe")}
            </label>
          )}
          <button type="submit"
            className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-dark transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2">
            🚀 {mode === "signin" ? t("auth.signInBtn") : t("auth.registerBtn")}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-brand-line w-full" />
          <span className="bg-white px-3 text-[11px] text-brand-muted uppercase tracking-wider absolute">{t("auth.orContinueWith")}</span>
        </div>

        {/* SSO */}
        <button type="button" onClick={handleGoogleSSO}
          className="w-full rounded-xl border border-brand-line bg-brand-hero py-2.5 px-4 text-xs font-bold text-brand-head hover:bg-brand-tint hover:border-brand/30 transition flex items-center justify-center gap-2">
          <span className="text-base">🎓</span> {t("auth.googleSSO")}
        </button>

        {/* Toggle mode */}
        <div className="text-center text-xs text-brand-muted">
          {mode === "signin" ? (
            <>{t("auth.noAccount")} <button type="button" onClick={() => setMode("register")} className="font-bold text-brand hover:underline ml-1">{t("auth.register")}</button></>
          ) : (
            <>{t("auth.haveAccount")} <button type="button" onClick={() => setMode("signin")} className="font-bold text-brand hover:underline ml-1">{t("auth.signIn")}</button></>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-brand-muted py-3">
        LearnMate · Dibrugarh University Bilingual Learning Platform · © 2026
      </div>

      {/* Forgot password modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-sm w-full bg-white rounded-2xl shadow-2xl p-6 border border-brand-line space-y-4">
            <h3 className="font-black text-base text-brand-head">Reset Your Password</h3>
            <p className="text-xs text-brand-muted">Enter your university email and we'll send an instant reset link.</p>
            {resetSuccess ? (
              <div className="rounded-xl bg-brand-tint border border-brand/20 p-3 text-brand text-xs font-semibold">
                ✅ Password reset link sent to {resetEmail}!
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your registered email…" className={inputCls} />
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setIsForgotModalOpen(false)}
                    className="rounded-xl bg-brand-hero border border-brand-line px-4 py-2 text-xs font-semibold text-brand-head hover:bg-brand-tint transition">Cancel</button>
                  <button type="submit"
                    className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-dark transition">Send Reset Link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
