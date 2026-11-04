import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Metric from "../components/Metric";
import DashboardAskPdfBar from "../components/DashboardAskPdfBar";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { INITIAL_MATERIALS } from "../data/mockData";

export default function Dashboard() {
  const { lang, setLang, t } = useLanguage();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    materialsCount: 6,
    quizzesTaken: 2,
    avgScore: 90,
    streakDays: 4,
    progressPercent: 68,
  });

  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, text: "Ask 1 question in Ask Your PDF", completed: true },
    { id: 2, text: "Review Data Structures Flashcards", completed: true },
    { id: 3, text: "Take Quiz: Graphs & Tree Traversal", completed: false },
  ]);

  const [recentMaterials, setRecentMaterials] = useState([]);

  useEffect(() => {
    try {
      const savedMats = JSON.parse(localStorage.getItem("learnmate_materials") || "null") || INITIAL_MATERIALS;
      const savedResults = JSON.parse(localStorage.getItem("learnmate_quiz_results") || "null") || [
        { score: 85 }, { score: 95 },
      ];
      const savedCards = JSON.parse(localStorage.getItem("learnmate_flashcards") || "[]");
      const totalTaken = savedResults.length;
      const avg = totalTaken > 0
        ? Math.round(savedResults.reduce((acc, r) => acc + r.score, 0) / totalTaken)
        : 88;
      const progress = Math.min(100, Math.round(
        ((totalTaken + savedCards.filter(c => c.mastered).length + 3) / 10) * 100
      ) || 68);

      setStats({
        materialsCount: savedMats.length,
        quizzesTaken: totalTaken,
        avgScore: avg,
        streakDays: 4,
        progressPercent: progress,
      });

      setRecentMaterials(savedMats.slice(0, 3));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleGoal = (id) => {
    setDailyGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "Student";
  const completedGoalsCount = dailyGoals.filter((g) => g.completed).length;

  return (
    <div className="space-y-7 page-enter">
      {/* ── 1. Welcome Section with Streak & Motivation ── */}
      <div className="rounded-3xl bg-gradient-to-br from-[#143D2B] via-[#1B4332] to-[#143D2B] p-6 sm:p-8 text-[#F4F7F2] relative overflow-hidden shadow-md shadow-[#143D2B]/15 border border-[#A3BFA8]/20">
        {/* Subtle geometric glass rings */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#A3BFA8]/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-[#DDE8DC]/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3BFA8]/20 border border-[#A3BFA8]/30 text-[#C4D8CC] text-[11px] font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#A3BFA8] animate-pulse" />
              <span>AI Study Portal Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black !text-[#F4F7F2] tracking-tight" style={{ color: '#F4F7F2' }}>
              Welcome Back, {firstName}!
            </h1>
            <p className="text-[#C4D8CC] text-sm font-medium leading-relaxed">
              Your personal AI-powered learning companion. Understand concepts, review lecture materials, and ace your university exams.
            </p>
            <p className="text-[#A3BFA8] text-xs font-semibold">
              Curriculum aligned with Dibrugarh University B.Tech / B.Sc syllabus.
            </p>
          </div>

          {/* Study Streak Badge & Language Quick Pill */}
          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 flex-shrink-0">
            {/* Streak card */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-[#A3BFA8]/30 shadow-inner">
              <span className="text-2xl" role="img" aria-label="streak flame">🔥</span>
              <div className="text-left">
                <div className="text-base font-black text-white leading-none">
                  {stats.streakDays} Days
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A3BFA8] mt-0.5">
                  Study Streak
                </div>
              </div>
            </div>

            {/* Language toggle badge */}
            <div className="flex items-center gap-1.5 bg-[#143D2B]/90 p-1 rounded-xl border border-[#A3BFA8]/30">
              <span className="text-[10px] font-bold text-[#A3BFA8] px-2 uppercase">Lang:</span>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  lang === "en" ? "bg-[#A3BFA8] text-[#143D2B]" : "text-[#C4D8CC] hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("as")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  lang === "as" ? "bg-[#A3BFA8] text-[#143D2B]" : "text-[#C4D8CC] hover:text-white"
                }`}
              >
                অসমীয়া
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Full-Width Horizontal Ask Your PDF Interface ── */}
      <DashboardAskPdfBar />

      {/* ── 3. Overview Metric Tiles ── */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#173D2E]">
            {t("dash.overview")}
          </h2>
          <span className="text-xs font-bold text-[#557466]">Updated Live</span>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
          <Metric
            label={t("dash.materials")}
            value={stats.materialsCount}
            icon="📚"
            trend="+2 this week"
            sublabel="Verified faculty notes"
          />
          <Metric
            label={t("dash.quizzes")}
            value={stats.quizzesTaken}
            icon="📝"
            trend="100% completed"
            sublabel="Active recall tests"
          />
          <Metric
            label={t("dash.avg")}
            value={`${stats.avgScore}%`}
            icon="🎯"
            trend="Top 10% class"
            sublabel="High retention rate"
          />
          <Metric
            label={t("dash.streak")}
            value={`${stats.streakDays} ${t("dash.days")}`}
            icon="⚡"
            trend="Personal best"
            sublabel="Consistent daily focus"
          />
        </div>
      </div>

      {/* ── 4. Learning Progress & Daily Goals (2-Column Grid) ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Overall Progress Card */}
        <div className="rounded-3xl border border-[#DDE8DC] bg-white/95 backdrop-blur-sm p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-[#173D2E] uppercase tracking-wide">
                {t("dash.progress")}
              </h3>
              <p className="text-xs text-[#557466] mt-0.5">Semester 3 Curriculum Milestones</p>
            </div>
            <span className="text-base font-black text-[#1B4332] bg-[#DDE8DC] px-3 py-1 rounded-full">
              {stats.progressPercent}%
            </span>
          </div>

          {/* Animated Shimmer Progress Bar */}
          <div className="h-3 w-full rounded-full bg-[#DDE8DC] overflow-hidden my-3">
            <div
              className="h-full rounded-full progress-shimmer transition-all duration-1000 ease-out"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-[#557466] mt-2">
            <span>Core Units: 14/20 Complete</span>
            <span>Target: 100% by Mid-Terms</span>
          </div>

          <p className="mt-4 pt-3.5 border-t border-[#DDE8DC] text-xs text-[#557466] leading-relaxed">
            You are pacing 12% faster than last month. Keep reviewing your RAG citations and revision summaries.
          </p>
        </div>

        {/* Daily Goals Card */}
        <div className="rounded-3xl border border-[#DDE8DC] bg-white/95 backdrop-blur-sm p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-[#173D2E] uppercase tracking-wide">
                Daily Learning Goals
              </h3>
              <p className="text-xs text-[#557466] mt-0.5">
                {completedGoalsCount} of {dailyGoals.length} completed today
              </p>
            </div>
            <span className="text-xs font-bold text-[#1B4332] bg-[#DDE8DC] px-2.5 py-1 rounded-lg">
              {Math.round((completedGoalsCount / dailyGoals.length) * 100)}%
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {dailyGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  goal.completed
                    ? "bg-[#DDE8DC]/40 border-[#A3BFA8]/40 text-[#173D2E]"
                    : "bg-white border-[#DDE8DC] text-[#557466] hover:border-[#A3BFA8]"
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      goal.completed
                        ? "bg-[#1B4332] border-[#1B4332] text-white"
                        : "border-[#A3BFA8] bg-white"
                    }`}
                  >
                    {goal.completed && (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className={goal.completed ? "line-through text-[#557466]" : "text-[#173D2E]"}>
                    {goal.text}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#557466] uppercase">
                  {goal.completed ? "Done" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Subject-Wise Learning Modules ── */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#173D2E]">
            Subject Study Modules
          </h2>
          <Link to="/student/materials" className="text-xs font-bold text-[#1B4332] hover:underline">
            View All Materials →
          </Link>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              subject: "Data Structures",
              unit: "Unit 45: Trees & Graphs",
              progress: 85,
              chunks: "94 Chunks Indexed",
              tag: "In Progress",
              to: "/student/ask-pdf",
            },
            {
              subject: "Engineering Math",
              unit: "Unit 3: Linear Algebra",
              progress: 60,
              chunks: "48 Chunks Indexed",
              tag: "Review Next",
              to: "/student/materials",
            },
            {
              subject: "Operating Systems",
              unit: "Unit 2: Semaphore Locks",
              progress: 40,
              chunks: "32 Chunks Indexed",
              tag: "Upcoming",
              to: "/student/tutor",
            },
            {
              subject: "Computer Networks",
              unit: "Unit 4: Routing & TCP/IP",
              progress: 30,
              chunks: "24 Chunks Indexed",
              tag: "New",
              to: "/student/quiz",
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="group rounded-2xl border border-[#DDE8DC] bg-white/95 backdrop-blur-sm p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332] bg-[#DDE8DC] px-2 py-0.5 rounded-md">
                  {item.tag}
                </span>
                <span className="text-xs font-bold text-[#173D2E]">{item.progress}%</span>
              </div>
              <h4 className="text-sm font-bold text-[#173D2E] group-hover:text-[#1B4332] transition-colors truncate">
                {item.subject}
              </h4>
              <p className="text-xs text-[#557466] truncate mt-0.5">{item.unit}</p>

              <div className="h-1.5 w-full rounded-full bg-[#DDE8DC] overflow-hidden mt-3">
                <div
                  className="h-full rounded-full bg-[#1B4332]"
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-[#557466]">
                <span>{item.chunks}</span>
                <span className="text-[#1B4332] font-bold group-hover:underline">Study →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 6. Feature Exploration Cards ── */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-[#173D2E] mb-3.5">
          {t("dash.explore")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card icon="askPdf" title={t("nav.askPdf")} to="/student/ask-pdf" badge="AI Powered">
            {t("dash.cardPdf")}
          </Card>
          <Card icon="tutor" title={t("nav.tutor")} to="/student/tutor" badge="Interactive">
            {t("dash.cardTutor")}
          </Card>
          <Card icon="materials" title={t("nav.materials")} to="/student/materials" badge="Faculty Notes">
            {t("dash.cardMaterials")}
          </Card>
          <Card icon="quiz" title={t("nav.quiz")} to="/student/quiz" badge="Adaptive">
            {t("dash.cardQuiz")}
          </Card>
          <Card icon="flashcards" title={t("nav.flashcards")} to="/student/flashcards" badge="Spaced Repetition">
            {t("dash.cardFlash")}
          </Card>
          <Card icon="revision" title={t("nav.revision")} to="/student/revision" badge="Smart Planner">
            {t("dash.cardRevision")}
          </Card>
        </div>
      </div>

      {/* ── 7. Recently Accessed Study Materials ── */}
      {recentMaterials.length > 0 && (
        <div className="rounded-3xl border border-[#DDE8DC] bg-white/95 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#173D2E]">
                Recently Accessed Faculty Materials
              </h3>
              <p className="text-xs text-[#557466] mt-0.5">Dibrugarh University department publications</p>
            </div>
            <Link to="/student/materials" className="text-xs font-bold text-[#1B4332] hover:underline">
              Browse All
            </Link>
          </div>

          <div className="divide-y divide-[#DDE8DC]">
            {recentMaterials.map((mat) => (
              <div key={mat.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#173D2E] truncate">{mat.title}</div>
                  <div className="text-[11px] text-[#557466] mt-0.5 truncate">
                    {mat.subject} · {mat.author} · {mat.size}
                  </div>
                </div>
                <Link
                  to="/student/materials"
                  className="px-3 py-1.5 rounded-xl border border-[#A3BFA8]/50 bg-[#DDE8DC]/40 text-[#173D2E] hover:bg-[#1B4332] hover:text-white text-xs font-bold transition flex-shrink-0"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
