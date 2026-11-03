import { useEffect, useRef, useState } from "react";
import { chatWithTutor, listDocuments } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { NavIcon } from "../components/Icons";

export default function Tutor() {
  const { lang, t } = useLanguage();
  const [docs, setDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [chatLang, setChatLang] = useState(lang);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", content: t("tutor.welcome"), sources: [] }]);
  const messagesEndRef = useRef(null);

  useEffect(() => { listDocuments().then(setDocs).catch(() => {}); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function handleSend(e) {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;
    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages); setInput(""); setLoading(true); setError("");
    try {
      const response = await chatWithTutor({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        docId: selectedDocId || null,
        lang: chatLang,
      });
      setMessages([...newMessages, { role: "assistant", content: response.reply, sources: response.sources || [] }]);
    } catch (err) { setError(err.message || "Failed to reach AI Tutor"); }
    finally { setLoading(false); }
  }

  function handleClear() {
    setMessages([{ role: "assistant", content: t("tutor.welcome"), sources: [] }]);
    setError("");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] space-y-4 page-enter">
      {/* Header */}
      <div className="rounded-2xl border border-brand-line bg-white p-4 shadow-sm flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
              <NavIcon name="tutor" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-brand-head">{t("tutor.title")}</h2>
              <p className="text-xs text-brand-muted">{t("tutor.subtitle")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-brand-hero border border-brand-line rounded-xl px-2.5 py-1.5">
              <NavIcon name="askPdf" className="w-3.5 h-3.5 text-brand-muted" />
              <select value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)} className="bg-transparent font-medium text-brand-head outline-none cursor-pointer text-xs">
                <option value="">{t("tutor.allDocs")}</option>
                {docs.map((doc) => <option key={doc.doc_id} value={doc.doc_id}>{doc.filename}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-hero border border-brand-line rounded-xl px-2.5 py-1.5">
              <select value={chatLang} onChange={(e) => setChatLang(e.target.value)} className="bg-transparent font-medium text-brand-head outline-none cursor-pointer text-xs">
                <option value="en">English</option>
                <option value="as">অসমীয়া</option>
              </select>
            </div>
            <button onClick={handleClear} className="rounded-xl border border-brand-line bg-brand-hero px-2.5 py-1.5 text-brand-head hover:bg-brand-tint hover:border-brand/30 transition text-xs font-semibold">
              {t("tutor.clear")}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2 flex-shrink-0">
          {error}
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-brand-line bg-white p-5 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-tint border border-brand/20">
                <NavIcon name="tutor" className="w-4 h-4 text-brand" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-brand text-white rounded-tr-sm shadow-sm"
                : "bg-brand-hero border border-brand-line text-brand-head rounded-tl-sm"
            }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-brand-line/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block mb-1.5">Sources:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.sources.map((s) => (
                      <span key={s.n} className="inline-flex items-center gap-1 rounded-lg bg-white border border-brand-line px-2 py-0.5 text-[11px] text-brand font-medium">
                        {s.filename} (p.{s.page})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {m.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-tint border border-brand/20">
                <NavIcon name="profile" className="w-4 h-4 text-brand" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-tint border border-brand/20">
              <NavIcon name="tutor" className="w-4 h-4 text-brand" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-brand-hero border border-brand-line p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                {t("tutor.thinking")}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <span className="text-xs font-bold text-brand-muted">Prompts:</span>
        {[t("tutor.suggest1"), t("tutor.suggest2"), t("tutor.suggest3")].map((s, i) => (
          <button key={i} onClick={() => setInput(s)}
            className="rounded-xl border border-brand-line bg-brand-hero px-3 py-1.5 text-xs font-medium text-brand-head hover:bg-brand-tint hover:border-brand/30 transition">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={t("tutor.inputPlaceholder")} disabled={loading}
          className="flex-1 rounded-xl border border-brand-line bg-white px-4 py-3 text-sm text-brand-head placeholder:text-brand-muted/60 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20 transition"
        />
        <button type="submit" disabled={loading || !input.trim()}
          className="rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-dark transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50">
          {loading ? "…" : t("tutor.send")}
        </button>
      </form>
    </div>
  );
}
