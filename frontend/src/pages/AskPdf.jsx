import { useCallback, useEffect, useState } from "react";
import { askQuestion, deleteDocument, listDocuments, uploadDocument } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

const inputCls =
  "w-full rounded-xl border border-brand-line bg-white px-3.5 py-2.5 text-sm text-brand-head placeholder:text-brand-muted/60 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20 transition";
const btnCls =
  "rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-brand-dark hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

export default function AskPdf() {
  const { lang, t } = useLanguage();

  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
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
  const [dragOver, setDragOver] = useState(false);

  const refresh = useCallback(() => {
    listDocuments().then(setDocs).catch((e) => setError(e.message));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true); setError(""); setUploadMsg("");
    try {
      const info = await uploadDocument({ file, subject, topic });
      setUploadMsg(t("pdf.upload.done").replace("{pages}", info.pages).replace("{chunks}", info.chunks));
      setFile(null); setFileKey((k) => k + 1); refresh();
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  }

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true); setError(""); setResult(null);
    try {
      const data = await askQuestion({ question, lang: answerLang, doc_id: docId || null });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setAsking(false); }
  }

  async function handleDelete(id) {
    try { await deleteDocument(id); if (docId === id) setDocId(""); refresh(); }
    catch (err) { setError(err.message); }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-brand-head">📄 {t("nav.askPdf")}</h2>
        <p className="text-sm text-brand-muted mt-1">Upload PDFs and ask AI-powered questions in English or Assamese.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Left: Upload + Library ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Upload card */}
          <div className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-head mb-4">📤 {t("pdf.upload.title")}</h3>
            <form onSubmit={handleUpload} className="space-y-3">

              {/* Drag & drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById(`pdf-input-${fileKey}`)?.click()}
                className={`rounded-xl border-2 border-dashed p-5 text-center transition-all duration-200 cursor-pointer ${
                  dragOver
                    ? "border-brand bg-brand-tint"
                    : "border-brand-line bg-brand-hero hover:border-brand/50 hover:bg-brand-tint/40"
                }`}
              >
                <div className="text-3xl mb-2">📄</div>
                {file ? (
                  <div>
                    <p className="text-xs font-bold text-brand-head truncate">{file.name}</p>
                    <p className="text-[11px] text-brand-muted mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); setFileKey(k => k + 1); }}
                      className="mt-2 text-[11px] text-red-500 hover:underline"
                    >Remove</button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-brand-head">Drop PDF here or click to browse</p>
                    <p className="text-[11px] text-brand-muted mt-1">PDF only · Max 50 MB</p>
                  </div>
                )}
                <input
                  id={`pdf-input-${fileKey}`}
                  key={fileKey}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("pdf.upload.subject")} className={inputCls} />
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t("pdf.upload.topic")} className={inputCls} />
              </div>

              <button type="submit" disabled={!file || uploading} className={`${btnCls} w-full justify-center flex items-center gap-2`}>
                {uploading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("pdf.upload.working")}
                  </>
                ) : t("pdf.upload.button")}
              </button>

              {uploadMsg && (
                <p className="text-xs font-semibold text-brand bg-brand-tint border border-brand-line rounded-xl px-3 py-2">
                  ✅ {uploadMsg}
                </p>
              )}
            </form>
          </div>

          {/* Library */}
          <div className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-head mb-3">📚 {t("pdf.library")}</h3>
            {docs.length === 0 ? (
              <p className="text-xs text-brand-muted text-center py-4">{t("pdf.empty")}</p>
            ) : (
              <ul className="space-y-2">
                {docs.map((doc) => (
                  <li key={doc.doc_id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-brand-hero border border-brand-line">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-brand-head truncate">📄 {doc.filename}</div>
                      <div className="text-[11px] text-brand-muted mt-0.5">
                        {[doc.subject, doc.topic].filter(Boolean).join(" · ")}
                        {(doc.subject || doc.topic) && " · "}
                        {doc.chunks} {t("pdf.chunks")}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.doc_id)}
                      className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50 transition flex-shrink-0"
                    >
                      {t("pdf.delete")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right: Ask + Answer ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Ask form */}
          <div className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-head mb-4">🤖 {t("pdf.ask.title")}</h3>
            <form onSubmit={handleAsk} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted mb-1.5 uppercase tracking-wide">{t("pdf.ask.scope")}</label>
                  <select value={docId} onChange={(e) => setDocId(e.target.value)} className={inputCls}>
                    <option value="">{t("pdf.ask.all")}</option>
                    {docs.map((doc) => <option key={doc.doc_id} value={doc.doc_id}>{doc.filename}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-muted mb-1.5 uppercase tracking-wide">{t("pdf.ask.lang")}</label>
                  <select value={answerLang} onChange={(e) => setAnswerLang(e.target.value)} className={inputCls}>
                    <option value="en">English</option>
                    <option value="as">অসমীয়া</option>
                    <option value="auto">{t("pdf.ask.auto")}</option>
                  </select>
                </div>
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder={t("pdf.ask.placeholder")}
                className={inputCls}
              />
              <button type="submit" disabled={asking || !question.trim()} className={`${btnCls} flex items-center gap-2`}>
                {asking ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("pdf.ask.working")}
                  </>
                ) : `🤖 ${t("pdf.ask.button")}`}
              </button>
            </form>
          </div>

          {/* Answer Platform */}
          <div className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-brand-head flex items-center gap-2">
                <span>💡</span><span>{t("pdf.answer")}</span>
              </h4>
              {asking && (
                <span className="flex items-center gap-2 text-xs font-semibold text-brand">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  {t("pdf.ask.working")}
                </span>
              )}
            </div>

            {asking && (
              <div className="animate-pulse space-y-3 p-4 rounded-xl bg-brand-hero border border-brand-line">
                <div className="h-3 bg-brand/10 rounded w-4/5" />
                <div className="h-3 bg-brand/10 rounded w-11/12" />
                <div className="h-3 bg-brand/10 rounded w-3/5" />
                <div className="h-3 bg-brand/10 rounded w-5/6" />
              </div>
            )}

            {!asking && !result && (
              <div className="text-center py-10 text-brand-muted">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm">{t("pdf.placeholderAnswer")}</p>
              </div>
            )}

            {!asking && result && (
              <div className="space-y-4">
                <div className="rounded-xl bg-brand-hero border border-brand-line p-4">
                  <div className="whitespace-pre-wrap leading-relaxed text-brand-head text-sm">{result.answer}</div>
                </div>
                {result.sources && result.sources.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-2">
                      📚 {t("pdf.sources")}
                    </h5>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {result.sources.map((s) => (
                        <li key={s.n} className="rounded-xl border border-brand-line bg-white p-3 text-xs hover:border-brand/30 transition">
                          <div className="font-bold text-brand-head">[{s.n}] {s.filename} · {t("pdf.page")} {s.page}</div>
                          <div className="mt-1 text-brand-muted line-clamp-2">{s.snippet}…</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
