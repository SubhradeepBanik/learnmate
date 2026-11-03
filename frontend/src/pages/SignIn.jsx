import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function SignIn() {
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  // Mode: 'signin' or 'register'
  const [mode, setMode] = useState("signin");
  // Role: 'student' or 'teacher'
  const [selectedRole, setSelectedRole] = useState("student");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("Computer Science Engineering");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Error / Feedback
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const userData = login(email, password, selectedRole, {
      name: fullName || (selectedRole === "teacher" ? "Dr. Debajit Sharma" : "Student Name"),
      department,
      college: "Dibrugarh University",
    });

    setSuccessMsg(`Welcome, ${userData.name}! Redirecting...`);
    setTimeout(() => {
      navigate(userData.role === "teacher" ? "/teacher" : "/student");
    }, 600);
  };

  // Quick Demo Login helper
  const handleQuickDemo = (role) => {
    setError("");
    const demoEmail = role === "teacher" ? "teacher@dibru.ac.in" : "student@example.com";
    const demoName = role === "teacher" ? "Dr. Debajit Sharma" : "Student Name";

    login(demoEmail, "demo123", role, {
      name: demoName,
      department: "Computer Science Engineering",
      college: "Dibrugarh University",
    });

    navigate(role === "teacher" ? "/teacher" : "/student");
  };

  // Google SSO Click
  const handleGoogleSSO = () => {
    const demoEmail = selectedRole === "teacher" ? "teacher@dibru.ac.in" : "student@dibru.ac.in";
    const demoName = selectedRole === "teacher" ? "Dr. Debajit Sharma (Faculty SSO)" : "Student Name (SSO)";

    login(demoEmail, "sso_token", selectedRole, {
      name: demoName,
      department: "Computer Science Engineering",
      college: "Dibrugarh University",
    });

    navigate(selectedRole === "teacher" ? "/teacher" : "/student");
  };

  // Password Reset simulation
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setResetSuccess(false);
      setResetEmail("");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-hero via-white to-brand-tint flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header with Brand and Language switch */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4">
        <Link to="/" className="flex items-center gap-2 text-decoration-none">
          <span className="text-2xl font-bold text-brand">📚 {t("app.name")}</span>
          <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border border-brand-line px-2 py-0.5 rounded-full">
            Dibrugarh University
          </span>
        </Link>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-brand-line shadow-sm">
          <button
            onClick={() => setLang("en")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              lang === "en" ? "bg-brand text-white" : "text-slate-600 hover:text-brand"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang("as")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              lang === "as" ? "bg-brand text-white" : "text-slate-600 hover:text-brand"
            }`}
          >
            অসমীয়া
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="my-auto max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl border border-brand-line p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-brand-head">
            {mode === "signin" ? t("auth.welcomeBack") : t("auth.register")}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === "signin" ? t("auth.signInSubtitle") : t("auth.createSubtitle")}
          </p>
        </div>

        {/* Mode Switch (Sign In / Register) */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === "signin" ? "bg-white text-brand shadow-sm" : "text-slate-600 hover:text-brand"
            }`}
          >
            {t("auth.signIn")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === "register" ? "bg-white text-brand shadow-sm" : "text-slate-600 hover:text-brand"
            }`}
          >
            {t("auth.register")}
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole("student")}
            className={`flex-1 p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              selectedRole === "student"
                ? "border-brand bg-brand-tint text-brand shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span>🎓</span> {t("auth.roleStudent")}
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("teacher")}
            className={`flex-1 p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              selectedRole === "teacher"
                ? "border-brand bg-brand-tint text-brand shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span>👨‍🏫</span> {t("auth.roleTeacher")}
          </button>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="bg-brand-tint/60 border border-brand-line p-3 rounded-2xl space-y-2">
          <div className="text-[11px] font-bold text-brand uppercase tracking-wider text-center">
            {t("auth.quickDemo")}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("student")}
              className="flex-1 rounded-lg bg-white border border-brand-line px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-brand hover:text-white transition text-center shadow-xs"
            >
              🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("teacher")}
              className="flex-1 rounded-lg bg-white border border-brand-line px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-brand hover:text-white transition text-center shadow-xs"
            >
              👨‍🏫 Faculty Demo
            </button>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("auth.nameLabel")}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Arindam Borah"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-brand"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t("auth.emailLabel")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={selectedRole === "teacher" ? "faculty@dibru.ac.in" : "student@example.com"}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {t("auth.passwordLabel")}
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] text-brand hover:underline font-semibold"
                >
                  {t("auth.forgotPassword")}
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs pr-10 focus:outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("auth.departmentLabel")}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
              >
                <option>Computer Science Engineering</option>
                <option>Electronics & Communication</option>
                <option>Mechanical Engineering</option>
                <option>Petroleum Technology</option>
              </select>
            </div>
          )}

          {mode === "signin" && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand focus:ring-brand"
                />
                {t("auth.rememberMe")}
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-3 text-xs font-bold text-white hover:bg-brand-dark transition shadow-md flex items-center justify-center gap-2"
          >
            <span>🚀</span> {mode === "signin" ? t("auth.signInBtn") : t("auth.registerBtn")}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider absolute">
            {t("auth.orContinueWith")}
          </span>
        </div>

        {/* Google / University SSO button */}
        <button
          type="button"
          onClick={handleGoogleSSO}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center justify-center gap-2"
        >
          <span className="text-base">🎓</span>
          <span>{t("auth.googleSSO")}</span>
        </button>

        {/* Toggle Mode Footer */}
        <div className="text-center text-xs text-slate-500 pt-1">
          {mode === "signin" ? (
            <>
              {t("auth.noAccount")}{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="font-bold text-brand hover:underline ml-1"
              >
                {t("auth.register")}
              </button>
            </>
          ) : (
            <>
              {t("auth.haveAccount")}{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-bold text-brand hover:underline ml-1"
              >
                {t("auth.signIn")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-3">
        LearnMate • Dibrugarh University Bilingual Learning Platform • © 2026
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-sm w-full bg-white rounded-2xl shadow-2xl p-6 border border-brand-line space-y-4">
            <h3 className="font-bold text-base text-brand-head">Reset Your Password</h3>
            <p className="text-xs text-slate-500">
              Enter your university email address and we'll send you an instant reset link.
            </p>

            {resetSuccess ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 text-xs font-semibold">
                ✅ Password reset link has been dispatched to {resetEmail}!
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your registered email..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-brand"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
