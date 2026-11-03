import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import { INITIAL_QUIZZES } from "../data/mockData";

export default function TeacherCreateQuiz() {
  const { t } = useLanguage();

  const [quizzes, setQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_quizzes");
      return saved ? JSON.parse(saved) : INITIAL_QUIZZES;
    } catch {
      return INITIAL_QUIZZES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("learnmate_quizzes", JSON.stringify(quizzes));
    } catch {
      /* ignore */
    }
  }, [quizzes]);

  const [feedback, setFeedback] = useState("");

  // Quiz Header State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Data Structures");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [passingScore, setPassingScore] = useState(70);
  const [description, setDescription] = useState("");

  // Questions State
  const [questions, setQuestions] = useState([
    {
      id: "q-1",
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
    },
  ]);

  // Add Question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: "",
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Update Question Field
  const updateQuestionText = (idx, text) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, question: text } : q))
    );
  };

  // Update Option
  const updateOptionText = (qIdx, optIdx, text) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOpts = [...q.options];
        newOpts[optIdx] = text;
        return { ...q, options: newOpts };
      })
    );
  };

  // Update Correct Option
  const updateCorrectIndex = (qIdx, optIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, correctIndex: optIdx } : q))
    );
  };

  // Update Explanation
  const updateExplanation = (qIdx, text) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, explanation: text } : q))
    );
  };

  // Save Quiz
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        alert(`Question #${i + 1} text cannot be empty`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j].trim()) {
          alert(`Question #${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty`);
          return;
        }
      }
    }

    const newQuiz = {
      id: `quiz-${Date.now()}`,
      title,
      subject,
      durationMinutes: Number(durationMinutes),
      passingScore: Number(passingScore),
      description: description || `Assessment test for ${subject}.`,
      questions,
    };

    setQuizzes((prev) => [newQuiz, ...prev]);
    setFeedback(`Quiz "${title}" published! Students can now take it in Quiz Studio.`);
    setTimeout(() => setFeedback(""), 4500);

    // Reset Form
    setTitle("");
    setDescription("");
    setQuestions([
      {
        id: "q-1",
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: "",
      },
    ]);
  };

  // Delete Quiz
  const handleDeleteQuiz = (id) => {
    if (confirm("Delete this quiz?")) {
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Hero title={`📝 ${t("nav.createQuiz")}`}>
        <p>Design interactive multiple choice quizzes, set custom timers and thresholds, and publish assessments.</p>
      </Hero>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="📝 Total Quizzes" value={quizzes.length} />
        <Metric label="👥 Available To" value="48 Students" />
        <Metric label="🎯 Default Passing" value="70%" />
        <Metric label="⚡ Questions in Draft" value={questions.length} />
      </div>

      {feedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <span>✅</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Quiz Creator Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-brand-head">Quiz Details & Configuration</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quiz Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 2: Graph Theory & Shortest Path Quiz"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                <option>Data Structures</option>
                <option>DBMS</option>
                <option>Operating Systems</option>
                <option>Computer Networks</option>
                <option>Discrete Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Limit (Minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passing Score (%)</label>
              <input
                type="number"
                min="40"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Instructions</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students taking this assessment..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>
        </div>

        {/* Questions Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-brand-head">
              Questions ({questions.length})
            </h3>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="rounded-xl bg-brand-tint border border-brand-line px-4 py-2 text-xs font-bold text-brand hover:bg-brand hover:text-white transition"
            >
              + Add Another Question
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-sm text-brand">Question #{qIdx + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    ✕ Remove Question
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Statement</label>
                <input
                  type="text"
                  required
                  value={q.question}
                  onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                  placeholder="Enter the problem statement or question..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              {/* 4 Options with Radio for correct */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Multiple Choice Options (Select radio button for the correct answer)
                </label>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctIndex === optIdx}
                      onChange={() => updateCorrectIndex(qIdx, optIdx)}
                      className="text-brand focus:ring-brand cursor-pointer"
                    />
                    <span className="w-6 text-xs font-bold text-slate-500">
                      {String.fromCharCode(65 + optIdx)}:
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                      className={`flex-1 rounded-lg border p-2 text-xs ${
                        q.correctIndex === optIdx ? "border-emerald-500 bg-emerald-50/40" : "border-slate-300"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Answer Explanation (Shown during review)</label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateExplanation(qIdx, e.target.value)}
                  placeholder="Why is this option correct? (Optional formula or concept note)"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="rounded-xl bg-brand px-8 py-3 text-sm font-bold text-white hover:bg-brand-dark transition shadow-lg flex items-center gap-2"
          >
            <span>🚀</span> Publish Quiz to Students
          </button>
        </div>
      </form>

      {/* Existing Quizzes Table */}
      <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-brand-head">Existing Assessments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-line text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Title</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Questions</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Pass Cutoff</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 pl-2 font-bold text-slate-800">{quiz.title}</td>
                  <td className="py-3">
                    <span className="rounded bg-brand-tint text-brand px-2 py-0.5 text-[11px] font-semibold">
                      {quiz.subject}
                    </span>
                  </td>
                  <td className="py-3">{quiz.questions.length} Qs</td>
                  <td className="py-3">{quiz.durationMinutes} mins</td>
                  <td className="py-3">{quiz.passingScore}%</td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
