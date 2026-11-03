import { useLanguage } from "../context/LanguageContext";

export default function ComingSoon({ titleKey }) {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">{t(titleKey)}</h2>
      <div className="rounded-xl border border-brand-line bg-brand-tint p-6">
        <p className="font-semibold">🚧 {t("soon.title")}</p>
        <p className="mt-1 text-sm text-slate-600">{t("soon.body")}</p>
      </div>
    </div>
  );
}