import { useEffect, useRef, useState } from "react";
import { API_BASE_URL, askQuestion, deleteDocument, fetchWithTimeout, listDocuments, uploadDocument } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import MarkdownRenderer from "../components/MarkdownRenderer";

const inputCls =
  "w-full rounded-xl border border-[#DDE8DC] bg-white px-3.5 py-2.5 text-sm text-[#143D2B] placeholder-[#52796F]/60 focus:border-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#A3BFA8]/40 transition shadow-sm";
const btnCls =
  "rounded-xl bg-gradient-to-r from-[#143D2B] to-[#1B4332] hover:from-[#1B4332] hover:to-[#2D6A4F] px-5 py-2.5 text-sm font-bold text-[#F5F7F2] shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

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
  const [waking, setWaking] = useState(false);

  const cancelledRef = useRef(false);

  function refresh() {
    listDocuments().then(setDocs).catch((e) => console.warn("List docs error:", e));
  }

  // On mount: ensure backend is reachable and load docs.
  useEffect(() => {
    cancelledRef.current = false;
    let attempt = 0;
    const MAX = 4;

    async function load() {
      setWaking(true);
      setError("");
      while (attempt < MAX) {
        attempt++;
        try {
          // Step 1: Health check / wake-up ping
          const healthRes = await fetchWithTimeout(`${API_BASE_URL}/api/health`, {}, 45000);
          if (cancelledRef.current) return;
          if (!healthRes.ok) throw new Error(`Health ping returned ${healthRes.status}`);

          // Step 2: Fetch documents
          const docsData = await listDocuments();
          if (cancelledRef.current) return;
          setDocs(docsData);
          setWaking(false);
          return;
        } catch (err) {
          if (cancelledRef.current) return;
          if (attempt < MAX) {
            await new Promise((r) => setTimeout(r, 4000));
          } else {
            setWaking(false);
            setError(
              `Could not reach the AI backend (${err.message}). If the cloud service is waking up, please wait 30 seconds and refresh.`
            );
          }
        }
      }
    }

    load();
    return () => { cancelledRef.current = true; };
  }, []);

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
    <div className="space-y-6 page-enter">
      <div>
        <h2 className="text-2xl font-black text-brand-head">{t("nav.askPdf")}</h2>
        <p className="text-sm text-brand-muted mt-1">Upload PDFs and ask AI-powered questions in English or Assamese.</p>
      </div>

      {waking && (
        <div className="rounded-xl border border-brand-line bg-brand-hero p-4 text-sm text-brand-muted flex items-center gap-3">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent flex-shrink-0" />
          <span>Connecting to AI backend — this takes up to 30 seconds on first load. Please wait...</span>
        </div>
      )}

      {error && !waking && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Left: Upload + Library ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Upload card */}
          <div className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-head mb-4">{t("pdf.upload.title")}</h3>
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
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-brand-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  </svg>
                </div>
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

              <button type="submit" disabled={!file || uploading || waking} className={`${btnCls} w-full justify-center flex items-center gap-2`}>
                {uploading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("pdf.upload.working")}
                  </>
                ) : t("pdf.upload.button")}
              </button>

              {uploadMsg && (
                <p className="text-xs font-semibold text-brand bg-brand-tint border border-brand-line rounded-xl px-3 py-2">
                  {uploadMsg}
                </p>
              )}
            </form>
          </div>

          {/* Library */}
          <div className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-head mb-3">{t("pdf.library")}</h3>
            {docs.length === 0 ? (
              <p className="text-xs text-brand-muted text-center py-4">{t("pdf.empty")}</p>
            ) : (
              <ul className="space-y-2">
                {docs.map((doc) => (
                  <li key={doc.doc_id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-brand-hero border border-brand-line">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-brand-head truncate">{doc.filename}</div>
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
            <h3 className="text-sm font-bold text-brand-head mb-4">{t("pdf.ask.title")}</h3>
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
                ) : t("pdf.ask.button")}
              </button>
            </form>
          </div>

          {/* Answer Platform */}
          <div className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-brand-head">
                {t("pdf.answer")}
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
                <div className="flex justify-center mb-3">
                  <svg className="w-10 h-10 text-brand-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-sm">{t("pdf.placeholderAnswer")}</p>
              </div>
            )}

            {!asking && result && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white border border-[#A3BFA8]/40 p-5 shadow-sm">
                  <MarkdownRenderer content={result.answer} />
                </div>
                {result.sources && result.sources.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-[#557466] uppercase tracking-widest mb-2">
                      {t("pdf.sources")}
                    </h5>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {result.sources.map((s) => (
                        <li key={s.n} className="rounded-xl border border-[#DDE8DC] bg-[#F5F7F2] p-3 text-xs hover:border-[#A3BFA8] transition shadow-sm">
                          <div className="font-bold text-[#143D2B]">[{s.n}] {s.filename} · {t("pdf.page")} {s.page}</div>
                          <div className="mt-1 text-[#557466] line-clamp-2 leading-relaxed">{s.snippet}…</div>
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
