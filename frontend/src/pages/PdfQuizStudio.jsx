import { useEffect, useState } from "react";
import { generateQuiz, listDocuments } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export default function QuizStudio() {
  const { lang, t } = useLanguage();

  const [docs, setDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [quizLang, setQuizLang] = useState(lang);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    listDocuments()
      .then((data) => {
        setDocs(data);
        if (data && data.length > 0) {
          setSelectedDocId(data[0].doc_id);
        }
      })
      .catch(() => {});
  }, []);

  async function handleGenerate(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);

    try {
      const res = await generateQuiz({
        docId: selectedDocId || null,
        numQuestions,
        difficulty,
        lang: quizLang,
      });

      if (!res.questions || res.questions.length === 0) {
        throw new Error(t("quiz.noMaterials"));
      }

      setQuestions(res.questions);
    } catch (err) {
      setError(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOption(optionIndex) {
    if (showExplanation) return; // Prevent changing after revealing
    setSelectedOption(optionIndex);
    setShowExplanation(true);

    const currentQ = questions[currentIndex];
    if (optionIndex === currentQ.answer_index) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-line pb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📝</span>
            <span>{t("quiz.title")}</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">{t("quiz.subtitle")}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Screen 1: Quiz Configuration Card (shown when no active quiz) */}
      {questions.length === 0 && (
        <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-xs space-y-5">
          <h3 className="text-lg font-bold text-brand-head">🎯 Customize Your Quiz</h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  {t("quiz.material")}
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="">{t("quiz.allMaterials")}</option>
                  {docs.map((d) => (
                    <option key={d.doc_id} value={d.doc_id}>
                      📄 {d.filename} ({d.chunks} chunks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  🌐 Language
                </label>
                <select
                  value={quizLang}
                  onChange={(e) => setQuizLang(e.target.value)}
                  className="w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="as">অসমীয়া (Pure Assamese)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  {t("quiz.count")}
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
                >
                  <option value={3}>3 Questions (Quick Practice)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={10}>10 Questions (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  {t("quiz.difficulty")}
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-brand-line bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="easy">{t("quiz.easy")}</option>
                  <option value="medium">{t("quiz.medium")}</option>
                  <option value="hard">{t("quiz.hard")}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || docs.length === 0}
              className="w-full sm:w-auto rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-brand-dark transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("quiz.generating")}
                </span>
              ) : (
                t("quiz.generate")
              )}
            </button>
          </form>

          {docs.length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
              💡 {t("quiz.noMaterials")}
            </p>
          )}
        </div>
      )}

      {/* Screen 2: Interactive Question Screen */}
      {questions.length > 0 && !quizFinished && currentQ && (
        <div className="space-y-5">
          {/* Progress Bar & Counter */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>
              {t("quiz.questionOf")
                .replace("{current}", currentIndex + 1)
                .replace("{total}", questions.length)}
            </span>
            <span className="text-brand">Score: {score}</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Box */}
          <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>

            {/* Options Grid */}
            <div className="grid gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.answer_index;

                let optClass = "border-slate-200 bg-white hover:border-brand/40 hover:bg-slate-50";
                if (showExplanation) {
                  if (isCorrect) {
                    optClass = "border-green-500 bg-green-50 text-green-900 font-medium";
                  } else if (isSelected && !isCorrect) {
                    optClass = "border-red-400 bg-red-50 text-red-900";
                  } else {
                    optClass = "border-slate-200 bg-slate-50/50 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start justify-between gap-3 ${optClass}`}
                  >
                    <span>{opt}</span>
                    {showExplanation && isCorrect && <span className="text-green-600 font-bold">✓</span>}
                    {showExplanation && isSelected && !isCorrect && (
                      <span className="text-red-500 font-bold">✕</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Feedback Card */}
            {showExplanation && (
              <div
                className={`rounded-xl p-4 border text-sm leading-relaxed ${
                  selectedOption === currentQ.answer_index
                    ? "bg-green-50 border-green-200 text-green-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1.5">
                  {selectedOption === currentQ.answer_index
                    ? t("quiz.correct")
                    : t("quiz.incorrect")}
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold">{t("quiz.explanation")} </span>
                  {currentQ.explanation}
                </div>
                {currentQ.source && (
                  <div className="mt-2 text-xs text-slate-500">
                    📖 {t("quiz.source")} {currentQ.source}
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setQuestions([])}
                className="text-xs text-slate-500 hover:text-brand"
              >
                ✕ Cancel quiz
              </button>

              {showExplanation && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-dark transition"
                >
                  {currentIndex + 1 < questions.length ? t("quiz.next") : t("quiz.finish")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Final Results Screen */}
      {quizFinished && (
        <div className="rounded-2xl border border-brand-line bg-white p-8 text-center shadow-xs space-y-6">
          <div className="text-5xl">🏆</div>

          <div>
            <h3 className="text-2xl font-bold text-brand-head">{t("quiz.score")}</h3>
            <div className="text-4xl font-extrabold text-slate-900 my-2">
              {score} / {questions.length}
            </div>
            <p className="text-sm text-slate-600">
              {score / questions.length >= 0.8
                ? "Outstanding mastery! You really understand this material! 🌟"
                : score / questions.length >= 0.5
                ? "Good job! A little more practice and you will master it! 💪"
                : "Keep going! Review the study materials with your AI Tutor and try again! 📚"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-brand-line">
            <button
              onClick={handleRestart}
              className="rounded-xl border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand-tint transition"
            >
              🔄 {t("quiz.restart")}
            </button>
            <button
              onClick={() => setQuestions([])}
              className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-dark transition"
            >
              ✨ {t("quiz.newQuiz")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
