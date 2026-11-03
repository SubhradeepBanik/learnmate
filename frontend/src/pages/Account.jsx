import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import "./Account.css";

export default function Account() {
  const { lang, t } = useLanguage();
  const { pathname } = useLocation();

  const isTeacher = pathname.startsWith("/teacher");
  const roleName = isTeacher ? t("role.teacher") : t("role.student");
  const accountId = isTeacher ? "LM-TEA-2026-008" : "LM-STU-2026-042";
  const userEmail = isTeacher ? "teacher@dibru.ac.in" : "student@example.com";

  // Active tab: 'security', 'notifications', 'privacy'
  const [activeTab, setActiveTab] = useState("security");

  // Toast alert
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "", color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 25, text: "Weak", color: "bg-rose-500" };
    if (score <= 3) return { score: 65, text: "Medium", color: "bg-amber-500" };
    return { score: 100, text: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(passwords.newPass);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwords.current) {
      showToast("Please enter your current password", "error");
      return;
    }
    if (passwords.newPass.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      showToast("New passwords do not match", "error");
      return;
    }

    setPasswords({ current: "", newPass: "", confirmPass: "" });
    showToast("Password updated successfully!", "success");
  };

  // 2FA state
  const [is2faEnabled, setIs2faEnabled] = useState(() => {
    try {
      return localStorage.getItem("learnmate_2fa") === "true";
    } catch {
      return false;
    }
  });
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);

  const toggle2FA = () => {
    if (is2faEnabled) {
      setIs2faEnabled(false);
      localStorage.setItem("learnmate_2fa", "false");
      showToast("Two-Factor Authentication disabled.", "info");
    } else {
      setIs2faModalOpen(true);
    }
  };

  const confirmEnable2FA = () => {
    setIs2faEnabled(true);
    localStorage.setItem("learnmate_2fa", "true");
    setIs2faModalOpen(false);
    showToast("Two-Factor Authentication is now ENABLED!", "success");
  };

  // Active Sessions
  const [sessions, setSessions] = useState([
    {
      id: "sess-1",
      device: "Windows 11 • Google Chrome",
      location: "Dibrugarh, Assam, India",
      ip: "103.28.12.94",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "sess-2",
      device: "Android 14 • LearnMate App",
      location: "Guwahati, Assam, India",
      ip: "117.201.8.12",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
  ]);

  const handleLogoutOthers = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast("Logged out of all other active sessions.", "success");
  };

  // Notification Preferences
  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_notif_prefs");
      return saved
        ? JSON.parse(saved)
        : {
            quizAlerts: true,
            revisionAlerts: true,
            streakAlerts: true,
            soundEffects: true,
            emailUpdates: false,
          };
    } catch {
      return {
        quizAlerts: true,
        revisionAlerts: true,
        streakAlerts: true,
        soundEffects: true,
        emailUpdates: false,
      };
    }
  });

  const handleNotifToggle = (key) => {
    setNotifSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("learnmate_notif_prefs", JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
    showToast("Notification preference saved.", "success");
  };

  // Privacy Visibility
  const [profileVisibility, setProfileVisibility] = useState("classmates");

  // Export Data JSON
  const handleExportData = () => {
    const exportBundle = {
      user: {
        accountId,
        role: roleName,
        email: userEmail,
        institution: "Dibrugarh University",
        exportedAt: new Date().toISOString(),
      },
      flashcards: JSON.parse(localStorage.getItem("learnmate_flashcards") || "[]"),
      notes: JSON.parse(localStorage.getItem("learnmate_notes") || "[]"),
      notificationSettings: notifSettings,
      security: {
        twoFactorEnabled: is2faEnabled,
      },
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LearnMate_Data_${accountId}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Account & Learning data exported successfully!", "success");
  };

  // Danger Zone Actions
  const handleDeactivate = () => {
    if (confirm("Are you sure you want to deactivate your account temporarily? You can reactivate anytime by logging back in.")) {
      showToast("Account deactivated. (Demo mode)", "info");
    }
  };

  const handleDeleteAccount = () => {
    const conf = prompt('To permanently delete your account, type "DELETE":');
    if (conf === "DELETE") {
      localStorage.clear();
      showToast("Account deleted. All local data cleared.", "error");
      setTimeout(() => {
        window.location.href = isTeacher ? "/teacher" : "/student";
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-xl transition-all duration-300 text-sm font-semibold text-white ${
            toast.type === "error"
              ? "bg-rose-600"
              : toast.type === "info"
              ? "bg-sky-600"
              : "bg-emerald-600"
          }`}
        >
          <span>{toast.type === "error" ? "" : ""}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Header */}
      <Hero title={t("account.title")}>
        <p>{t("account.subtitle")}</p>
      </Hero>

      {/* Account Info Card */}
      <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-tint border-2 border-brand text-brand flex items-center justify-center font-bold text-2xl shadow-inner">
            {isTeacher ? "T" : "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-800">{userEmail}</h3>
              <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
                ● {t("account.active")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>
                <strong>{t("account.accountId")}:</strong> {accountId}
              </span>
              <span>•</span>
              <span>
                <strong>{t("account.roleLabel")}:</strong> {roleName}
              </span>
              <span>•</span>
              <span>
                <strong>{t("account.memberSince")}:</strong> October 2026
              </span>
            </div>
          </div>
        </div>

        {/* Connected SSO Badge */}
        <div className="flex items-center gap-2 bg-brand-tint border border-brand-line rounded-xl px-4 py-2 text-xs">
          <span className="text-base"></span>
          <div>
            <div className="font-bold text-brand">{t("account.googleLinked")}</div>
            <div className="text-slate-500">{t("account.connected")} via SSO</div>
          </div>
        </div>
      </div>

      {/* Account Settings Tabs */}
      <div className="flex flex-wrap border-b border-brand-line gap-2 pb-1">
        <button
          onClick={() => setActiveTab("security")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "security"
              ? "bg-brand text-white shadow-md"
              : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
          }`}
        >
          {t("account.tabSecurity")}
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "notifications"
              ? "bg-brand text-white shadow-md"
              : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
          }`}
        >
          {t("account.tabNotifications")}
        </button>

        <button
          onClick={() => setActiveTab("privacy")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "privacy"
              ? "bg-brand text-white shadow-md"
              : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
          }`}
        >
          {t("account.tabPrivacy")}
        </button>
      </div>

      {/* ==================== TAB 1: SECURITY & LOGIN ==================== */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-brand-head mb-1 flex items-center gap-2">
               {t("account.passwordTitle")}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ensure your account uses a secure password with letters, numbers, and symbols.
            </p>

            <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("account.currentPass")}
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {t("account.newPass")}
                  </label>
                  {passwords.newPass && (
                    <span className="text-xs font-semibold text-slate-500">
                      Strength: <span className="font-bold">{strength.text}</span>
                    </span>
                  )}
                </div>
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="••••••••"
                />

                {/* Password strength bar */}
                {passwords.newPass && (
                  <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("account.confirmPass")}
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  value={passwords.confirmPass}
                  onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="rounded border-slate-300 text-brand focus:ring-brand"
                  />
                  Show Passwords
                </label>

                <button
                  type="submit"
                  className="rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-dark transition"
                >
                  {t("account.updatePassBtn")}
                </button>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication (2FA) */}
          <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-brand-head">
                   {t("account.twoFactorTitle")}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    is2faEnabled
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {is2faEnabled ? t("account.twoFactorEnabled") : t("account.twoFactorDisabled")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {t("account.twoFactorDesc")}
              </p>
            </div>

            <button
              onClick={toggle2FA}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm whitespace-nowrap ${
                is2faEnabled
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                  : "bg-brand text-white hover:bg-brand-dark"
              }`}
            >
              {is2faEnabled ? t("account.disable2fa") : t("account.enable2fa")}
            </button>
          </div>

          {/* Active Sessions */}
          <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-head flex items-center gap-2">
                   {t("account.sessionsTitle")}
                </h3>
                <p className="text-xs text-slate-500">{t("account.sessionsDesc")}</p>
              </div>

              {sessions.length > 1 && (
                <button
                  onClick={handleLogoutOthers}
                  className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition whitespace-nowrap self-start sm:self-auto"
                >
                   {t("account.logoutAll")}
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sess.device.includes("Android") ? "" : ""}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                            {t("account.currentDevice")}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {sess.location} • IP: {sess.ip}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    {sess.lastActive}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: NOTIFICATIONS ==================== */}
      {activeTab === "notifications" && (
        <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-brand-head mb-1 flex items-center gap-2">
               {t("account.notifTitle")}
            </h3>
            <p className="text-xs text-slate-500">
              Control what alerts you receive for study reminders, streaks, and updates.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {[
              {
                key: "quizAlerts",
                title: t("account.quizAlerts"),
                desc: "Get notified when new quizzes are posted or assignment deadlines approach.",
                icon: "",
              },
              {
                key: "revisionAlerts",
                title: t("account.revisionAlerts"),
                desc: "Receive smart active-recall alerts when flashcard reviews are due.",
                icon: "",
              },
              {
                key: "streakAlerts",
                title: t("account.streakAlerts"),
                desc: "Daily reminders to keep your learning streak and study habits on track.",
                icon: "",
              },
              {
                key: "soundEffects",
                title: t("account.soundEffects"),
                desc: "Play celebratory sound effects when completing cards or quizzes.",
                icon: "",
              },
              {
                key: "emailUpdates",
                title: t("account.emailUpdates"),
                desc: "Receive a consolidated weekly performance and study summary via email.",
                icon: "",
              },
            ].map(({ key, title, desc, icon }) => (
              <div key={key} className="p-4 flex items-center justify-between gap-4 bg-white">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>

                <label className="account-toggle flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(notifSettings[key])}
                    onChange={() => handleNotifToggle(key)}
                  />
                  <span className="account-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: PRIVACY & DATA ==================== */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          {/* Privacy Level */}
          <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-brand-head mb-1 flex items-center gap-2">
               {t("account.privacyTitle")}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Manage your profile visibility on leaderboards and class study groups.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "public", title: "Public", desc: "Visible across all university batches." },
                { id: "classmates", title: "Classmates Only", desc: "Only students in your department." },
                { id: "private", title: "Private", desc: "Hidden from leaderboards & search." },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    setProfileVisibility(opt.id);
                    showToast(`Visibility set to ${opt.title}`, "success");
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    profileVisibility === opt.id
                      ? "border-brand bg-brand-tint"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800">{opt.title}</span>
                    {profileVisibility === opt.id && <span className="text-brand"></span>}
                  </div>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Export Data */}
          <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-brand-head flex items-center gap-2">
                 {t("account.exportData")}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {t("account.exportDesc")}
              </p>
            </div>

            <button
              onClick={handleExportData}
              className="rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-dark transition whitespace-nowrap flex items-center gap-2"
            >
              <span></span> {t("account.exportData")}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-rose-800 mb-1 flex items-center gap-2">
               {t("account.dangerTitle")}
            </h3>
            <p className="text-xs text-rose-600 mb-4">
              Irreversible account actions. Proceed with caution.
            </p>

            <div className="space-y-4 divide-y divide-rose-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{t("account.deactivate")}</h4>
                  <p className="text-xs text-slate-500">{t("account.deactivateDesc")}</p>
                </div>
                <button
                  onClick={handleDeactivate}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition whitespace-nowrap self-start sm:self-auto"
                >
                  {t("account.deactivate")}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-800">{t("account.delete")}</h4>
                  <p className="text-xs text-rose-600">{t("account.deleteDesc")}</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition whitespace-nowrap self-start sm:self-auto"
                >
                  {t("account.delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2FA SETUP MODAL ==================== */}
      {is2faModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 modal-overlay">
          <div className="modal-content max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 border border-brand-line text-center">
            <span className="text-4xl mb-2 inline-block"></span>
            <h3 className="text-xl font-bold text-brand-head mb-2">
              Set Up Authenticator App
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Scan this verification code with Google Authenticator, Authy, or Microsoft Authenticator:
            </p>

            {/* QR Mockup */}
            <div className="mx-auto w-40 h-40 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-3 mb-4">
              <span className="text-5xl"></span>
              <span className="font-mono text-[10px] text-slate-500 mt-2">
                LM-2FA-AUTH-CODE
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border mb-4">
              Secret Key: <strong className="text-slate-800">LM26 9X7A 4K2M 88VQ</strong>
            </p>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setIs2faModalOpen(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                {t("flash.cancel")}
              </button>
              <button
                onClick={confirmEnable2FA}
                className="rounded-lg bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-dark"
              >
                Verify & Activate 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
