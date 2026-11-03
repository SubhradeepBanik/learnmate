import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import QuizLibrary from "./QuizLibrary";
import PdfQuizStudio from "./PdfQuizStudio";

export default function QuizStudio() {
  const { t } = useLanguage();
  const [mode, setMode] = useState("library");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-brand-head">📝 {t("nav.quiz")}</h2>
        <p className="text-sm text-brand-muted mt-1">Test your knowledge and generate AI quizzes from your study materials.</p>
      </div>
      <div className="flex gap-1.5 bg-white border border-brand-line rounded-xl p-1.5 shadow-sm w-fit">
        {[
          { key: "library", label: t("quiz.modeLibrary") },
          { key: "pdf", label: t("quiz.modeGenerate") },
        ].map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setMode(key)}
            className={`rounded-lg px-5 py-2 text-sm font-bold transition-all duration-200 ${
              mode === key ? "bg-brand text-white shadow-sm" : "text-brand-muted hover:text-brand hover:bg-brand-tint"
            }`}>
            {label}
          </button>
        ))}
      </div>
      {mode === "library" ? <QuizLibrary /> : <PdfQuizStudio />}
    </div>
  );
}
