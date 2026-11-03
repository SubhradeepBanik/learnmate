import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import QuizLibrary from "./QuizLibrary";
import PdfQuizStudio from "./PdfQuizStudio";

export default function QuizStudio() {
  const { t } = useLanguage();
  const [mode, setMode] = useState("library");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-brand-line bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setMode("library")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === "library" ? "bg-brand text-white" : "text-slate-600 hover:bg-brand-tint"}`}
        >
          {t("quiz.modeLibrary")}
        </button>
        <button
          type="button"
          onClick={() => setMode("pdf")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === "pdf" ? "bg-brand text-white" : "text-slate-600 hover:bg-brand-tint"}`}
        >
          {t("quiz.modeGenerate")}
        </button>
      </div>
      {mode === "library" ? <QuizLibrary /> : <PdfQuizStudio />}
    </div>
  );
}
