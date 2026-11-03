import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { fetchQuizHistory, clearBackendQuizHistory } from "../api/client";

const INITIAL_RESULTS = [
  {
    id: "res-init-1",
    quizId: "quiz-1",
    quizTitle: "Data Structures Core Mastery Quiz",
    subject: "Data Structures",
    score: 80,
    correctCount: 4,
    totalQuestions: 5,
    passed: true,
    date: "2026-11-02",
  },
  {
    id: "res-init-2",
    quizId: "quiz-2",
    quizTitle: "DBMS Relational Architecture & SQL Quiz",
    subject: "DBMS",
    score: 100,
    correctCount: 5,
    totalQuestions: 5,
    passed: true,
    date: "2026-11-03",
  },
];

export default function ResultsProgress() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [results, setResults] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_quiz_results");
      return saved ? JSON.parse(saved) : INITIAL_RESULTS;
    } catch {
      return INITIAL_RESULTS;
    }
  });

  // Fetch from database on mount
  useEffect(() => {
    async function loadHistory() {
      const dbRows = await fetchQuizHistory(user?.id);
      if (dbRows && dbRows.length > 0) {
        const mapped = dbRows.map((r) => ({
          id: r.id,
          quizId: r.quiz_id,
          quizTitle: r.quiz_title,
          subject: r.subject,
          score: r.score,
          correctCount: r.correct_count,
          totalQuestions: r.total_questions,
          passed: Boolean(r.passed),
          date: r.completed_at ? r.completed_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
        }));
        setResults(mapped);
      }
    }
    loadHistory();
  }, [user?.id]);

  // Calculate Metrics
  const totalQuizzes = results.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalQuizzes)
    : 0;
  const highestScore = totalQuizzes > 0
    ? Math.max(...results.map((r) => r.score))
    : 0;
  const passedCount = results.filter((r) => r.passed).length;
  const passRate = totalQuizzes > 0 ? Math.round((passedCount / totalQuizzes) * 100) : 0;

  // Subject wise performance
  const subjectScores = useMemo(() => {
    const map = {};
    results.forEach((r) => {
      if (!map[r.subject]) map[r.subject] = { total: 0, count: 0 };
      map[r.subject].total += r.score;
      map[r.subject].count += 1;
    });

    return Object.keys(map).map((subj) => ({
      subject: subj,
      avg: Math.round(map[subj].total / map[subj].count),
      attempts: map[subj].count,
    }));
  }, [results]);

  // Clear history
  const handleClearHistory = () => {
    if (confirm("Reset quiz results history from database?")) {
      setResults([]);
      localStorage.removeItem("learnmate_quiz_results");
      clearBackendQuizHistory();
    }
  };

  const getGrade = (score) => {
    if (score >= 90) return { letter: "A+", color: "bg-emerald-100 text-emerald-800" };
    if (score >= 75) return { letter: "A", color: "bg-sky-100 text-sky-800" };
    if (score >= 60) return { letter: "B", color: "bg-amber-100 text-amber-800" };
    return { letter: "C", color: "bg-rose-100 text-rose-800" };
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Hero title={` ${t("nav.results")}`}>
        <p>Track your academic growth, exam readiness, and chapter mastery across all subjects.</p>
      </Hero>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label=" Quizzes Taken" value={totalQuizzes} />
        <Metric label=" Average Score" value={`${avgScore}%`} />
        <Metric label=" Highest Score" value={`${highestScore}%`} />
        <Metric label=" Pass Rate" value={`${passRate}%`} />
      </div>

      {/* Subject-Wise Mastery Meters */}
      <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-brand-head">Subject Performance Breakdown</h3>

        {subjectScores.length === 0 ? (
          <p className="text-xs text-slate-400">Complete quizzes to see subject breakdowns.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {subjectScores.map((item) => (
              <div key={item.subject} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">{item.subject}</span>
                  <span className="text-xs font-semibold text-brand">{item.avg}% ({item.attempts} tests)</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand transition-all duration-500 rounded-full"
                    style={{ width: `${item.avg}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Attempt History Table */}
      <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-brand-head">Recent Quiz Attempts</h3>
          {results.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-400 hover:text-rose-600 transition"
            >
              Clear History
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-sm">
            No quiz attempts recorded yet. Take a quiz in{" "}
            <Link to="/student/quiz" className="font-bold text-brand hover:underline">
              Quiz Studio
            </Link>{" "}
            to see your results!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-line text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Quiz Title</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Grade</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {results.map((res) => {
                  const grade = getGrade(res.score);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 pl-2 font-bold text-slate-800">{res.quizTitle}</td>
                      <td className="py-3">
                        <span className="rounded bg-brand-tint text-brand font-semibold px-2 py-0.5 text-[11px]">
                          {res.subject}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{res.date}</td>
                      <td className="py-3 font-semibold">
                        <span className={res.passed ? "text-emerald-600" : "text-rose-600"}>
                          {res.score}% ({res.correctCount}/{res.totalQuestions})
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${grade.color}`}>
                          {grade.letter}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <Link
                          to="/student/quiz"
                          className="rounded-lg bg-slate-100 hover:bg-brand hover:text-white px-2.5 py-1 text-[11px] font-bold transition text-slate-700 inline-block"
                        >
                          Retake
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
