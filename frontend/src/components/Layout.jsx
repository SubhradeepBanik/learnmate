import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { STUDENT_NAV, TEACHER_NAV } from "../config/navigation";
import { NavIcon } from "./Icons";
import BackendStatus from "./BackendStatus";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "as", label: "অসমীয়া" },
];

export default function Layout() {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const role = pathname.startsWith("/teacher") ? "teacher" : "student";
  const items = role === "teacher" ? TEACHER_NAV : STUDENT_NAV;
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : (role === "teacher" ? "T" : "S");

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-brand-hero">
      {/* ── Mobile top bar ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-line bg-white px-4 py-3 shadow-sm md:hidden">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="LearnMate" className="h-8 w-auto object-contain" />
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-brand-tint border border-brand-line p-2 text-brand text-sm font-semibold transition hover:bg-brand hover:text-white"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{ backgroundColor: '#ffffff', borderRight: '1px solid #DCEBE1' }}
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-brand-line">
          <img
            src="/logo.png"
            alt="LearnMate"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* User chip */}
        <div className="px-4 py-3 border-b border-brand-line">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-tint border border-brand/20 font-black text-sm text-brand flex items-center justify-center flex-shrink-0">
                {avatarLetter}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-brand-head truncate leading-tight">
                  {user?.name || (role === "teacher" ? "Dr. Debajit Sharma" : "Student Name")}
                </div>
                <div className="text-[10px] text-brand-muted capitalize">
                  {role === "teacher" ? "Faculty" : "Student"} · DU
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="text-brand-muted hover:text-brand p-1.5 rounded-lg hover:bg-brand-tint transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="px-4 py-3 border-b border-brand-line">
          <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2">Language</div>
          <div className="flex gap-1.5 bg-brand-hero p-1 rounded-xl border border-brand-line">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                  lang === code ? "bg-brand text-white shadow-sm" : "text-brand-muted hover:text-brand"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Portal */}
        <div className="px-4 py-3 border-b border-brand-line">
          <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2">Portal</div>
          <select
            value={role}
            onChange={(e) => { navigate(`/${e.target.value}`); setOpen(false); }}
            className="w-full rounded-xl border border-brand-line bg-brand-hero px-3 py-2 text-sm text-brand-head font-medium focus:outline-none focus:border-brand"
          >
            <option value="student">{t("role.student")}</option>
            <option value="teacher">{t("role.teacher")}</option>
          </select>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-3">
          <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest px-2 mb-2">
            {t("sidebar.navigation")}
          </div>
          <nav className="space-y-0.5">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand text-white shadow-sm"
                      : "text-brand-head hover:bg-brand-tint hover:text-brand"
                  }`
                }
              >
                <NavIcon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                <span>{t(item.key)}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-brand-line space-y-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-line bg-brand-hero py-2 text-xs font-semibold text-brand-head hover:bg-brand-tint hover:border-brand/30 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t("auth.signOut")}
          </button>
          <BackendStatus />
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="md:ml-64 min-h-screen">
        <div className="mx-auto max-w-5xl p-5 md:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
