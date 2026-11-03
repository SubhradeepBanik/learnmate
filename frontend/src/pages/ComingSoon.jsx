import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function ComingSoon({ titleKey }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-5">
      <div className="w-20 h-20 rounded-2xl bg-brand-tint border border-brand/10 flex items-center justify-center text-4xl shadow-sm">
        🌱
      </div>
      <div>
        <h2 className="text-xl font-black text-brand-head">{t(titleKey) || "Coming Soon"}</h2>
        <p className="text-sm text-brand-muted mt-2 max-w-xs mx-auto">
          We're working on something great. This feature will be available soon!
        </p>
      </div>
      <Link
        to="/student"
        className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark transition-all duration-200 hover:shadow-md active:scale-95"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
