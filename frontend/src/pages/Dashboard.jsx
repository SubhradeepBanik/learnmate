import { useState, useEffect } from "react";
import Card from "../components/Card";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { INITIAL_MATERIALS } from "../data/mockData";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

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
        { score: 80 }, { score: 100 },
      ];
      const savedCards = JSON.parse(localStorage.getItem("learnmate_flashcards") || "[]");
      const totalTaken = savedResults.length;
      const avg = totalTaken > 0
        ? Math.round(savedResults.reduce((acc, r) => acc + r.score, 0) / totalTaken)
        : 0;
      const progress = Math.min(100, Math.round(
        ((totalTaken + savedCards.filter(c => c.mastered).length) / 10) * 100
      ) || 60);
      setStats({ materialsCount: savedMats.length, quizzesTaken: totalTaken, avgScore: avg, streakDays: 4, progressPercent: progress });
    } catch { /* ignore */ }
  }, []);

  const firstName = user?.name ? user.name.split(" ")[0] : "Student";

  return (
    <div className="space-y-8 page-enter">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-brand p-6 md:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-brand-tint/80 text-sm font-semibold mb-1">Welcome back,</p>
          <h1 className="text-2xl md:text-3xl font-black mb-2 text-white">{firstName}!</h1>
          <p className="text-brand-tint/70 text-sm max-w-lg">{t("dash.sub1")}</p>
          <p className="text-brand-tint/50 text-xs mt-1">{t("dash.sub2")}</p>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-base font-black text-brand-head mb-4">{t("dash.overview")}</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric label={t("dash.materials")} value={stats.materialsCount} />
          <Metric label={t("dash.quizzes")} value={stats.quizzesTaken} />
          <Metric label={t("dash.avg")} value={`${stats.avgScore}%`} />
          <Metric label={t("dash.streak")} value={`${stats.streakDays} ${t("dash.days")}`} />
        </div>
      </div>

      {/* Feature cards */}
      <div>
        <h2 className="text-base font-black text-brand-head mb-4">{t("dash.explore")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card icon="tutor" title={t("nav.tutor")} to="/student/tutor">{t("dash.cardTutor")}</Card>
          <Card icon="askPdf" title={t("nav.askPdf")} to="/student/ask-pdf">{t("dash.cardPdf")}</Card>
          <Card icon="materials" title={t("nav.materials")} to="/student/materials">{t("dash.cardMaterials")}</Card>
          <Card icon="quiz" title={t("nav.quiz")} to="/student/quiz">{t("dash.cardQuiz")}</Card>
          <Card icon="flashcards" title={t("nav.flashcards")} to="/student/flashcards">{t("dash.cardFlash")}</Card>
          <Card icon="revision" title={t("nav.revision")} to="/student/revision">{t("dash.cardRevision")}</Card>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-2xl bg-white border border-brand-line p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-brand-head">{t("dash.progress")}</h2>
          <span className="text-sm font-bold text-brand">{stats.progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-brand-tint overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-brand transition-all duration-700"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
        <p className="mt-2.5 text-xs text-brand-muted">
          You've achieved {stats.progressPercent}% of your weekly study milestones. Keep going!
        </p>
      </div>
    </div>
  );
}
