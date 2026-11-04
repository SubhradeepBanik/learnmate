import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { STUDENT_NAV, TEACHER_NAV } from "../config/navigation";
import { NavIcon } from "./Icons";
import GlassBubbles from "./GlassBubbles";
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
    <div className="min-h-screen relative overflow-hidden bg-[#F5F7F2]">
      {/* ── Background Blurred Green Waves & Interactive Glass Bubbles ── */}
      <GlassBubbles />

      {/* ── Mobile top bar ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#1B4332]/30 bg-[#143D2B] px-4 py-2.5 shadow-md md:hidden">
        <div className="rounded-xl bg-[#F4F7F2] border border-[#A3BFA8]/50 px-3 py-1 shadow-sm flex items-center justify-center">
          <img src="/logo.png" alt="LearnMate" className="h-6 w-auto object-contain max-w-[130px]" />
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-[#1B4332] border border-[#A3BFA8]/30 p-2 text-[#F4F7F2] text-sm font-semibold transition-all hover:bg-[#A3BFA8] hover:text-[#143D2B] active:scale-95"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {open && (
        <div className="fixed inset-0 z-30 bg-[#143D2B]/60 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar (Forest Green & Sage Redesign) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-gradient-to-b from-[#143D2B] to-[#1B4332] text-[#F4F7F2] border-r border-[#A3BFA8]/20 shadow-xl transition-transform duration-300 ease-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header with high-contrast subtle container */}
        <div className="px-4 py-4 border-b border-[#A3BFA8]/15 flex items-center justify-between">
          <div className="rounded-2xl bg-[#F4F7F2] border border-[#A3BFA8]/50 px-3.5 py-1.5 shadow-md flex items-center justify-center transition-transform hover:scale-[1.02]">
            <img
              src="/logo.png"
              alt="LearnMate"
              className="h-8 w-auto object-contain max-w-[160px]"
            />
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-[#A3BFA8] hover:text-[#F4F7F2] p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* User profile card */}
        <div className="px-4 py-3 border-b border-[#A3BFA8]/15">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-[#A3BFA8]/15">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#A3BFA8] font-black text-sm text-[#143D2B] flex items-center justify-center flex-shrink-0 shadow-sm">
                {avatarLetter}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#F4F7F2] truncate leading-tight">
                  {user?.name || (role === "teacher" ? "Dr. Debajit Sharma" : "Student Name")}
                </div>
                <div className="text-[10px] font-medium text-[#C4D8CC] capitalize">
                  {role === "teacher" ? "Faculty" : "Student"} · Dibrugarh Univ.
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="text-[#C4D8CC] hover:text-[#F4F7F2] hover:bg-white/10 p-1.5 rounded-lg transition flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Language selector */}
        <div className="px-4 py-2.5 border-b border-[#A3BFA8]/15">
          <div className="text-[10px] font-bold text-[#A3BFA8] uppercase tracking-wider mb-1.5">
            {t("sidebar.language")}
          </div>
          <div className="flex gap-1.5 bg-[#143D2B]/80 p-1 rounded-xl border border-[#A3BFA8]/20">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all duration-200 ${
                  lang === code
                    ? "bg-[#A3BFA8] text-[#143D2B] shadow-sm font-extrabold"
                    : "text-[#C4D8CC] hover:text-[#F4F7F2] hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Portal switcher */}
        <div className="px-4 py-2.5 border-b border-[#A3BFA8]/15">
          <div className="text-[10px] font-bold text-[#A3BFA8] uppercase tracking-wider mb-1.5">
            Portal
          </div>
          <select
            value={role}
            onChange={(e) => { navigate(`/${e.target.value}`); setOpen(false); }}
            className="w-full rounded-xl border border-[#A3BFA8]/30 bg-[#143D2B]/80 px-3 py-1.5 text-xs text-[#F4F7F2] font-semibold focus:outline-none focus:border-[#A3BFA8] transition cursor-pointer"
          >
            <option value="student" className="bg-[#143D2B] text-white">{t("role.student")}</option>
            <option value="teacher" className="bg-[#143D2B] text-white">{t("role.teacher")}</option>
          </select>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-3 overflow-y-auto">
          <div className="text-[10px] font-bold text-[#A3BFA8] uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
            <span>{t("sidebar.navigation")}</span>
          </div>
          <nav className="space-y-1">
            {items.map((item) => {
              const isAskPdf = item.key === "nav.askPdf";
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 transform hover:scale-[1.02] hover:font-bold ${
                      isActive
                        ? "bg-gradient-to-r from-[#A3BFA8] to-[#DDE8DC] text-[#143D2B] font-extrabold shadow-md shadow-[#143D2B]/40"
                        : isAskPdf
                        ? "text-[#F4F7F2] bg-[#A3BFA8]/15 border border-[#A3BFA8]/35 hover:bg-[#A3BFA8]/25 hover:text-white"
                        : "text-[#C4D8CC] hover:bg-white/10 hover:text-[#F4F7F2]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <NavIcon
                          name={item.icon}
                          className={`w-4 h-4 flex-shrink-0 transition-transform ${
                            isActive ? "text-[#143D2B]" : isAskPdf ? "text-[#A3BFA8]" : "text-[#A3BFA8]/80"
                          }`}
                        />
                        <span className="truncate">{t(item.key)}</span>
                      </div>
                      {isAskPdf && !isActive && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#A3BFA8] text-[#143D2B]">
                          AI
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#A3BFA8]/15 space-y-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#A3BFA8]/20 bg-white/5 py-2 text-xs font-bold text-[#C4D8CC] hover:bg-[#A3BFA8] hover:text-[#143D2B] hover:border-[#A3BFA8] transition-all duration-200 active:scale-95"
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
      <main className="md:ml-64 min-h-screen relative z-10">
        <div className="mx-auto max-w-5xl p-4 sm:p-6 md:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
