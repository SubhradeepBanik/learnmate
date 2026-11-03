import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";

export default function TeacherDashboard() {
  const { t } = useLanguage();

  return (
    <>
      <Hero title={`👨‍🏫 ${t("teacher.welcome")}`}>
        <p>{t("teacher.sub")}</p>
      </Hero>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric label={t("teacher.students")} value="0" />
        <Metric label={t("teacher.materials")} value="0" />
        <Metric label={t("teacher.quizzes")} value="0" />
      </div>
    </>
  );
}