import { useState, useEffect, useMemo } from "react";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { INITIAL_QUIZZES } from "../data/mockData";
import { recordQuizAttempt } from "../api/client";

export default function QuizStudio() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Load quizzes from localStorage or fallback
  const [quizzes, setQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_quizzes");
      return saved ? JSON.parse(saved) : INITIAL_QUIZZES;
    } catch {
      return INITIAL_QUIZZES;
    }
  });

  // Active quiz session state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  // Subject filter
  const [selectedSubject, setSelectedSubject] = useState("all");

  const subjects = useMemo(() => {
    return Array.from(new Set(quizzes.map((q) => q.subject)));
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      return selectedSubject === "all" || q.subject.toLowerCase() === selectedSubject.toLowerCase();
    });
  }, [quizzes, selectedSubject]);

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || quizFinished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, quizFinished, timeLeft]);

  // Start a quiz
  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setReviewMode(false);
    setTimeLeft(quiz.durationMinutes * 60);
  };

  // Select an option
  const handleSelectOption = (qIdx, optIdx) => {
    if (quizFinished) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    // Calculate score
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const totalQuestions = activeQuiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= activeQuiz.passingScore;

    const resultRecord = {
      id: `result-${Date.now()}`,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      subject: activeQuiz.subject,
      score: percentage,
      correctCount,
      totalQuestions,
      passed,
      date: new Date().toISOString().split("T")[0],
      answers: selectedAnswers,
    };

    // Save attempt to localStorage
    try {
      const existingResults = JSON.parse(localStorage.getItem("learnmate_quiz_results") || "[]");
      localStorage.setItem("learnmate_quiz_results", JSON.stringify([resultRecord, ...existingResults]));
    } catch {
      /* ignore */
    }

    // Persist to Database
    recordQuizAttempt({
      id: resultRecord.id,
      user_id: user?.id || "stu-1",
      student_name: user?.name || "Student Name",
      quiz_id: activeQuiz.id,
      quiz_title: activeQuiz.title,
      subject: activeQuiz.subject,
      score: percentage,
      correct_count: correctCount,
      total_questions: totalQuestions,
      passed: passed,
      answers_json: JSON.stringify(selectedAnswers),
      completed_at: resultRecord.date,
    });

    setQuizFinished(true);
  };

  // Reset back to quiz library
  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setQuizFinished(false);
    setReviewMode(false);
    setSelectedAnswers({});
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Results calculations
  const totalScore = useMemo(() => {
    if (!activeQuiz) return 0;
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correct += 1;
    });
    return Math.round((correct / activeQuiz.questions.length) * 100);
  }, [activeQuiz, selectedAnswers]);

  const correctAnswersCount = useMemo(() => {
    if (!activeQuiz) return 0;
    return activeQuiz.questions.filter((q, idx) => selectedAnswers[idx] === q.correctIndex).length;
  }, [activeQuiz, selectedAnswers]);

  return (
    <div className="space-y-6">
      {/* ================= QUIZ PLAYING VIEW ================= */}
      {activeQuiz ? (
        <div className="space-y-5">
          {/* Top Bar with Timer and Progress */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-line shadow-sm">
            <div>
              <span className="rounded bg-brand-tint px-2.5 py-0.5 text-xs font-bold text-brand uppercase">
                {activeQuiz.subject}
              </span>
              <h2 className="text-lg font-bold text-brand-head mt-1">{activeQuiz.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              {!quizFinished && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${
                  timeLeft < 120
                    ? "border-rose-300 bg-rose-50 text-rose-600 animate-pulse"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}>
                  ⏱️ <span>{formatTime(timeLeft)}</span>
                </div>
              )}

              <button
                onClick={handleExitQuiz}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ✕ Exit Quiz
              </button>
            </div>
          </div>

          {/* QUIZ FINISHED RESULTS SCREEN */}
          {quizFinished && !reviewMode ? (
            <div className="rounded-2xl border border-brand-line bg-white p-8 shadow-sm text-center max-w-xl mx-auto space-y-5">
              <span className="text-6xl inline-block">{totalScore >= activeQuiz.passingScore ? "🎉" : "📚"}</span>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {totalScore >= activeQuiz.passingScore ? "Congratulations! You Passed!" : "Good Effort! Keep Practicing!"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Quiz attempt saved to your performance record.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-brand-tint rounded-xl border border-brand-line">
                <div>
                  <div className="text-xs text-slate-500">Your Score</div>
                  <div className="text-2xl font-bold text-brand-head">{totalScore}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Correct</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {correctAnswersCount} / {activeQuiz.questions.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Passing Cutoff</div>
                  <div className="text-2xl font-bold text-slate-700">{activeQuiz.passingScore}%</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => setReviewMode(true)}
                  className="rounded-xl bg-brand-tint border border-brand-line px-5 py-2.5 text-xs font-bold text-brand hover:bg-brand hover:text-white transition"
                >
                  🔍 Review All Answers
                </button>
                <button
                  onClick={() => handleStartQuiz(activeQuiz)}
                  className="rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition shadow"
                >
                  🔄 Retake Quiz
                </button>
                <button
                  onClick={handleExitQuiz}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Back to Quiz Studio
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE QUESTION OR REVIEW MODE */
            <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-6">
              {/* Question Navigation Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-500">
                  Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                </span>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {activeQuiz.questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const isCurrent = currentQuestionIdx === idx;
                    const isCorrect = selectedAnswers[idx] === q.correctIndex;

                    let bgClass = "bg-slate-100 text-slate-600";
                    if (reviewMode) {
                      bgClass = isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800";
                    } else if (isCurrent) {
                      bgClass = "bg-brand text-white shadow";
                    } else if (isAnswered) {
                      bgClass = "bg-brand-tint text-brand border border-brand-line";
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition ${bgClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed">
                  {activeQuiz.questions[currentQuestionIdx]?.question}
                </h3>
              </div>

              {/* Options List */}
              <div className="space-y-3">
                {activeQuiz.questions[currentQuestionIdx]?.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                  const isCorrect = activeQuiz.questions[currentQuestionIdx].correctIndex === optIdx;

                  let optionStyle = "border-slate-200 hover:border-brand-line bg-white";
                  if (reviewMode) {
                    if (isCorrect) optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                    else if (isSelected && !isCorrect) optionStyle = "border-rose-400 bg-rose-50 text-rose-900";
                  } else if (isSelected) {
                    optionStyle = "border-brand bg-brand-tint text-brand font-semibold shadow-sm";
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => !reviewMode && handleSelectOption(currentQuestionIdx, optIdx)}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition ${optionStyle} ${
                        !reviewMode ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${
                        isSelected ? "bg-brand text-white border-brand" : "border-slate-300 text-slate-600 bg-white"
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-sm flex-1">{option}</span>
                      {reviewMode && isCorrect && <span className="text-emerald-600 text-sm font-bold">✓ Correct</span>}
                      {reviewMode && isSelected && !isCorrect && <span className="text-rose-600 text-sm font-bold">✗ Your Choice</span>}
                    </div>
                  );
                })}
              </div>

              {/* Explanation in Review Mode */}
              {reviewMode && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-1">
                  <h4 className="font-bold uppercase tracking-wider text-amber-800">💡 Explanation</h4>
                  <p>{activeQuiz.questions[currentQuestionIdx]?.explanation}</p>
                </div>
              )}

              {/* Question Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((p) => p - 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  ◀ Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                      className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-dark"
                    >
                      Next ▶
                    </button>
                  ) : !reviewMode ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow"
                    >
                      Submit Quiz ✅
                    </button>
                  ) : (
                    <button
                      onClick={handleExitQuiz}
                      className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-dark"
                    >
                      Finish Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= QUIZ CATALOG VIEW ================= */
        <div className="space-y-6">
          <Hero title={`📝 ${t("nav.quiz")}`}>
            <p>Test your conceptual understanding with timed chapter quizzes and exam prep assessments.</p>
          </Hero>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric label="📝 Total Quizzes" value={quizzes.length} />
            <Metric label="🎯 Pass Threshold" value="70%" />
            <Metric label="⏱️ Avg Time" value="10 min" />
            <Metric label="🏆 Difficulty" value="Medium" />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-brand-tint p-3 rounded-2xl border border-brand-line">
            <span className="text-xs font-bold text-brand uppercase tracking-wider mr-1">Subject:</span>
            <button
              onClick={() => setSelectedSubject("all")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedSubject === "all"
                  ? "bg-brand text-white"
                  : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
              }`}
            >
              All Quizzes
            </button>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  selectedSubject === sub
                    ? "bg-brand text-white"
                    : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Quizzes List */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-md bg-brand-tint px-2.5 py-0.5 text-xs font-bold text-brand">
                      {quiz.subject}
                    </span>
                    <span className="text-xs text-slate-400">⏱️ {quiz.durationMinutes} mins</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-800 leading-snug mb-2">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {quiz.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                    <div><strong>{quiz.questions.length}</strong> Questions</div>
                    <div>•</div>
                    <div>Pass: <strong>{quiz.passingScore}%</strong></div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartQuiz(quiz)}
                  className="w-full rounded-xl bg-brand py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition shadow text-center flex items-center justify-center gap-1.5"
                >
                  <span>🚀</span> Start Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
