import { useState, useEffect } from "react";
import Card from "../components/Card";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import { INITIAL_MATERIALS, INITIAL_QUIZZES } from "../data/mockData";

export default function Dashboard() {
  const { t } = useLanguage();

  // Dynamic metrics from localStorage
  const [stats, setStats] = useState({
    materialsCount: 6,
    quizzesTaken: 2,
    avgScore: 90,
    streakDays: 4,
    progressPercent: 65,
  });

  useEffect(() => {
    try {
      const savedMats = JSON.parse(localStorage.getItem("learnmate_materials") || "null") || INITIAL_MATERIALS;
      const savedResults = JSON.parse(localStorage.getItem("learnmate_quiz_results") || "null") || [
        { score: 80 },
        { score: 100 },
      ];
      const savedCards = JSON.parse(localStorage.getItem("learnmate_flashcards") || "[]");

      const totalTaken = savedResults.length;
      const avg = totalTaken > 0
        ? Math.round(savedResults.reduce((acc, r) => acc + r.score, 0) / totalTaken)
        : 0;

      const progress = Math.min(100, Math.round(((totalTaken + savedCards.filter(c => c.mastered).length) / 10) * 100) || 60);

      setStats({
        materialsCount: savedMats.length,
        quizzesTaken: totalTaken,
        avgScore: avg,
        streakDays: 4,
        progressPercent: progress,
      });
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      <Hero title={t("dash.welcome")}>
        <p>{t("dash.sub1")}</p>
        <p>{t("dash.sub2")}</p>
      </Hero>

      <h2 className="mb-3 text-xl font-bold">📊 {t("dash.overview")}</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label={`📄 ${t("dash.materials")}`} value={stats.materialsCount} />
        <Metric label={`📝 ${t("dash.quizzes")}`} value={stats.quizzesTaken} />
        <Metric label={`🎯 ${t("dash.avg")}`} value={`${stats.avgScore}%`} />
        <Metric label={`🔥 ${t("dash.streak")}`} value={`${stats.streakDays} ${t("dash.days")}`} />
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold">🚀 {t("dash.explore")}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card icon="🤖" title={t("nav.tutor")} to="/student/tutor">
          {t("dash.cardTutor")}
        </Card>
        <Card icon="📄" title={t("nav.askPdf")} to="/student/ask-pdf">
          {t("dash.cardPdf")}
        </Card>
        <Card icon="📚" title={t("nav.materials")} to="/student/materials">
          {t("dash.cardMaterials")}
        </Card>
        <Card icon="📝" title={t("nav.quiz")} to="/student/quiz">
          {t("dash.cardQuiz")}
        </Card>
        <Card icon="🗂️" title={t("nav.flashcards")} to="/student/flashcards">
          {t("dash.cardFlash")}
        </Card>
        <Card icon="📅" title={t("nav.revision")} to="/student/revision">
          {t("dash.cardRevision")}
        </Card>
      </div>

      <h2 className="mb-2 mt-8 text-xl font-bold">📈 {t("dash.progress")}</h2>
      <div className="h-3 w-full rounded-full bg-brand-line overflow-hidden">
        <div
          className="h-3 rounded-full bg-brand transition-all duration-700"
          style={{ width: `${stats.progressPercent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        You have achieved {stats.progressPercent}% of your weekly study milestones! Keep going!
      </p>
    </>
  );
}
