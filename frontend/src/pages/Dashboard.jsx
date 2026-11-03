import Card from "../components/Card";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <>
      <Hero title={t("dash.welcome")}>
        <p>{t("dash.sub1")}</p>
        <p>{t("dash.sub2")}</p>
      </Hero>

      <h2 className="mb-3 text-xl font-bold">📊 {t("dash.overview")}</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label={`📄 ${t("dash.materials")}`} value="0" />
        <Metric label={`📝 ${t("dash.quizzes")}`} value="0" />
        <Metric label={`🎯 ${t("dash.avg")}`} value="0%" />
        <Metric label={`🔥 ${t("dash.streak")}`} value={`0 ${t("dash.days")}`} />
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold">🚀 {t("dash.explore")}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card to="/student/tutor" icon="🤖" title={t("nav.tutor")}>
          {t("dash.cardTutor")}
        </Card>
        <Card to="/student/ask-pdf" icon="📄" title={t("nav.askPdf")}>
          {t("dash.cardPdf")}
        </Card>
        <Card to="/student/quiz" icon="📝" title={t("nav.quiz")}>
          {t("dash.cardQuiz")}
        </Card>
        <Card to="/student/materials" icon="📚" title={t("nav.materials")}>
          {t("dash.cardMaterials")}
        </Card>
        <Card to="/student/flashcards" icon="🗂️" title={t("nav.flashcards")}>
          {t("dash.cardFlash")}
        </Card>
        <Card to="/student/revision" icon="📅" title={t("nav.revision")}>
          {t("dash.cardRevision")}
        </Card>
      </div>

      <h2 className="mb-2 mt-8 text-xl font-bold">📈 {t("dash.progress")}</h2>
      <div className="h-3 w-full rounded-full bg-brand-line">
        <div className="h-3 w-0 rounded-full bg-brand" />
      </div>
      <p className="mt-2 text-sm text-slate-500">{t("dash.progressHint")}</p>
    </>
  );
}
