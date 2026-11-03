import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { STUDENT_NAV, TEACHER_NAV } from "../config/navigation";
import BackendStatus from "./BackendStatus";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "as", label: "অসমীয়া" },
];

export default function Layout() {
  const { lang, setLang, t } = useLanguage();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // TEMPORARY: role comes from the URL. Real login replaces this in the next step.
  const role = pathname.startsWith("/teacher") ? "teacher" : "student";
  const items = role === "teacher" ? TEACHER_NAV : STUDENT_NAV;

  return (
    <div className="min-h-screen">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-line bg-white px-4 py-3 md:hidden">
        <span className="text-lg font-bold text-brand">📚 {t("app.name")}</span>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-brand px-3 py-1.5 text-white"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-brand-line bg-brand-tint p-4 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-brand">📚 {t("app.name")}</h1>
          <p className="text-xs tracking-widest text-slate-400">
            LEARN • PRACTICE • GROW
          </p>
        </div>

        {/* Language switch */}
        <div className="mb-4">
          <div className="mb-1 text-xs font-semibold text-slate-500">
            🌐 {t("sidebar.language")}
          </div>
          <div className="flex gap-2">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  lang === code
                    ? "bg-brand text-white"
                    : "bg-white text-slate-700 hover:bg-brand-hero"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Temporary role switch */}
        <div className="mb-4">
          <div className="mb-1 text-xs font-semibold text-slate-500">
            👤 {t("sidebar.role")}
          </div>
          <select
            value={role}
            onChange={(e) => {
              navigate(`/${e.target.value}`);
              setOpen(false);
            }}
            className="w-full rounded-lg border border-brand-line bg-white px-3 py-2 text-sm"
          >
            <option value="student">{t("role.student")}</option>
            <option value="teacher">{t("role.teacher")}</option>
          </select>
        </div>

        <div className="mb-1 text-xs font-semibold uppercase text-slate-500">
          {t("sidebar.navigation")}
        </div>
        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-slate-700 hover:bg-brand-hero"
                }`
              }
            >
              {item.icon} {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-brand-line pt-3">
          <BackendStatus />
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64">
        <div className="mx-auto max-w-5xl p-5 md:p-8">
          <p className="mb-6 text-sm text-slate-500">{t("app.tagline")}</p>
          <Outlet />
        </div>
      </main>
    </div>
  );
}