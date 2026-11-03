import { useCallback, useEffect, useState } from "react";
import {
  askQuestion,
  deleteDocument,
  listDocuments,
  uploadDocument,
} from "../api/client";
import { useLanguage } from "../context/LanguageContext";

const inputClass =
  "w-full rounded-lg border border-brand-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none";
const buttonClass =
  "rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50";

export default function AskPdf() {
  const { lang, t } = useLanguage();

  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0); // changing this clears the file input
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const [question, setQuestion] = useState("");
  const [docId, setDocId] = useState("");
  const [answerLang, setAnswerLang] = useState(lang);
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    listDocuments()
      .then(setDocs)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    setUploadMsg("");
    try {
      const info = await uploadDocument({ file, subject, topic });
      setUploadMsg(
        t("pdf.upload.done")
          .replace("{pages}", info.pages)
          .replace("{chunks}", info.chunks)
      );
      setFile(null);
      setFileKey((k) => k + 1);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setError("");
    setResult(null);
    try {
      const data = await askQuestion({
        question,
        lang: answerLang,
        doc_id: docId || null,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAsking(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDocument(id);
      if (docId === id) setDocId("");
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">📄 {t("nav.askPdf")}</h2>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Upload */}
      <section className="rounded-2xl border border-brand-line p-5">
        <h3 className="mb-3 text-lg font-bold">{t("pdf.upload.title")}</h3>
        <form onSubmit={handleUpload} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              {t("pdf.upload.file")}
            </label>
            <input
              key={fileKey}
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className={inputClass}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                {t("pdf.upload.subject")}
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                {t("pdf.upload.topic")}
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <button type="submit" disabled={!file || uploading} className={buttonClass}>
            {uploading ? t("pdf.upload.working") : t("pdf.upload.button")}
          </button>
          {uploadMsg && <p className="text-sm text-green-700">✅ {uploadMsg}</p>}
        </form>
      </section>

      {/* Library */}
      <section className="rounded-2xl border border-brand-line p-5">
        <h3 className="mb-3 text-lg font-bold">{t("pdf.library")}</h3>
        {docs.length === 0 ? (
          <p className="text-sm text-slate-500">{t("pdf.empty")}</p>
        ) : (
          <ul className="divide-y divide-brand-line">
            {docs.map((doc) => (
              <li key={doc.doc_id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <div className="truncate font-semibold">📄 {doc.filename}</div>
                  <div className="text-xs text-slate-500">
                    {[doc.subject, doc.topic].filter(Boolean).join(" · ")}
                    {(doc.subject || doc.topic) && " · "}
                    {doc.chunks} {t("pdf.chunks")}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.doc_id)}
                  className="rounded-lg border border-brand-line px-3 py-1 text-xs text-brand hover:bg-brand-tint"
                >
                  {t("pdf.delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Ask */}
      <section className="rounded-2xl border border-brand-line p-5">
        <h3 className="mb-3 text-lg font-bold">{t("pdf.ask.title")}</h3>
        <form onSubmit={handleAsk} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                {t("pdf.ask.scope")}
              </label>
              <select
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                className={inputClass}
              >
                <option value="">{t("pdf.ask.all")}</option>
                {docs.map((doc) => (
                  <option key={doc.doc_id} value={doc.doc_id}>
                    {doc.filename}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                {t("pdf.ask.lang")}
              </label>
              <select
                value={answerLang}
                onChange={(e) => setAnswerLang(e.target.value)}
                className={inputClass}
              >
                <option value="en">English</option>
                <option value="as">অসমীয়া</option>
                <option value="auto">{t("pdf.ask.auto")}</option>
              </select>
            </div>
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder={t("pdf.ask.placeholder")}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className={buttonClass}
          >
            {asking ? t("pdf.ask.working") : `🤖 ${t("pdf.ask.button")}`}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-brand-tint p-4">
              <h4 className="mb-2 font-bold text-brand-head">{t("pdf.answer")}</h4>
              <div className="whitespace-pre-wrap leading-relaxed">{result.answer}</div>
            </div>
            <div>
              <h4 className="mb-2 font-bold text-brand-head">{t("pdf.sources")}</h4>
              <ul className="space-y-2">
                {result.sources.map((s) => (
                  <li
                    key={s.n}
                    className="rounded-lg border border-brand-line p-3 text-sm"
                  >
                    <div className="font-semibold">
                      [{s.n}] {s.filename} · {t("pdf.page")} {s.page}
                    </div>
                    <div className="mt-1 text-slate-500">{s.snippet}…</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}