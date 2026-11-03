import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import Card from "../components/Card";
import { useLanguage } from "../context/LanguageContext";
import { INITIAL_MATERIALS, INITIAL_QUIZZES } from "../data/mockData";

export default function TeacherDashboard() {
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    materialsCount: 6,
    quizzesCount: 3,
    studentsCount: 48,
    avgScore: 78,
  });

  useEffect(() => {
    try {
      const savedMats = JSON.parse(localStorage.getItem("learnmate_materials") || "null") || INITIAL_MATERIALS;
      const savedQuizzes = JSON.parse(localStorage.getItem("learnmate_quizzes") || "null") || INITIAL_QUIZZES;
      setStats({
        materialsCount: savedMats.length,
        quizzesCount: savedQuizzes.length,
        studentsCount: 48,
        avgScore: 78,
      });
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      <Hero title={` ${t("teacher.welcome")}`}>
        <p>{t("teacher.sub")}</p>
      </Hero>

      <h2 className="mb-3 text-xl font-bold"> Class Overview (Dibrugarh University • 3rd Sem)</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label={t("teacher.students")} value={stats.studentsCount} />
        <Metric label={t("teacher.materials")} value={stats.materialsCount} />
        <Metric label={t("teacher.quizzes")} value={stats.quizzesCount} />
        <Metric label=" Cohort Average" value={`${stats.avgScore}%`} />
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold"> Faculty Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card icon="" title={t("nav.materials")} to="/teacher/materials">
          Upload, organize, and publish course notes, slide decks, and reference guides for students.
        </Card>
        <Card icon="" title={t("nav.createQuiz")} to="/teacher/create-quiz">
          Create chapter assessments, configure question choices, timers, and publish quizzes.
        </Card>
        <Card icon="" title={t("nav.performance")} to="/teacher/performance">
          Monitor cohort learning velocity, view student quiz scores, and export CSV reports.
        </Card>
        <Card icon="" title={t("nav.teacherProfile")} to="/teacher/profile">
          Update faculty credentials, departmental details, office hours, and research focus.
        </Card>
        <Card icon="" title={t("nav.account")} to="/teacher/account">
          Manage your login password, two-factor authentication, and notification preferences.
        </Card>
      </div>

      <h2 className="mb-2 mt-8 text-xl font-bold"> Departmental Notice</h2>
      <div className="rounded-2xl border border-brand-line bg-brand-tint p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-sm text-brand">Mid-Semester Exam Prep Window</span>
          <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-brand border border-brand-line">
            Notice
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Faculty members are requested to upload revision sheets and practice quizzes before the upcoming examination cycle. Study materials uploaded here are instantly accessible to enrolled B.Tech CSE students.
        </p>
      </div>
    </>
  );
}
