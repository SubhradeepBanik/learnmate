import { useEffect, useRef, useState } from "react";
import { chatWithTutor, listDocuments } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export default function Tutor() {
  const { lang, t } = useLanguage();

  const [docs, setDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [chatLang, setChatLang] = useState(lang);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: t("tutor.welcome"),
      sources: [],
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e) {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await chatWithTutor({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        docId: selectedDocId || null,
        lang: chatLang,
      });

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: response.reply,
          sources: response.sources || [],
        },
      ]);
    } catch (err) {
      setError(err.message || "Failed to reach AI Tutor");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickPrompt(text) {
    setInput(text);
  }

  function handleClear() {
    setMessages([
      {
        role: "assistant",
        content: t("tutor.welcome"),
        sources: [],
      },
    ]);
    setError("");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] space-y-4">
      {/* Header bar */}
      <div className="rounded-2xl border border-brand-line bg-gradient-to-r from-brand-hero via-white to-brand-tint p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-2xl text-white shadow-sm">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-head">{t("tutor.title")}</h2>
              <p className="text-xs text-slate-600">{t("tutor.subtitle")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Document scope */}
            <div className="flex items-center gap-1.5 bg-white border border-brand-line rounded-lg px-2.5 py-1.5">
              <span className="font-semibold text-slate-500">📄 {t("tutor.docScope")}</span>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="">{t("tutor.allDocs")}</option>
                {docs.map((doc) => (
                  <option key={doc.doc_id} value={doc.doc_id}>
                    {doc.filename}
                  </option>
                ))}
              </select>
            </div>

            {/* Language toggle */}
            <div className="flex items-center gap-1.5 bg-white border border-brand-line rounded-lg px-2.5 py-1.5">
              <span className="font-semibold text-slate-500">🌐</span>
              <select
                value={chatLang}
                onChange={(e) => setChatLang(e.target.value)}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="as">অসমীয়া</option>
              </select>
            </div>

            <button
              onClick={handleClear}
              className="rounded-lg border border-brand-line bg-white px-2.5 py-1.5 text-slate-600 hover:text-brand hover:bg-brand-tint transition"
              title={t("tutor.clear")}
            >
              🔄 {t("tutor.clear")}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Chat scroll container */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-brand-line bg-white p-5 space-y-4 shadow-inner">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-tint border border-brand/30 text-base">
                🤖
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-brand text-white rounded-tr-xs shadow-xs"
                  : "bg-slate-50 border border-brand-line/60 text-slate-800 rounded-tl-xs shadow-xs"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Source citations */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-brand-line/50">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    📚 Referenced Study Notes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.sources.map((s) => (
                      <span
                        key={s.n}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-brand-line px-2 py-0.5 text-2xs text-brand font-medium shadow-2xs"
                      >
                        📄 {s.filename} (p. {s.page})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-sm font-bold text-slate-700">
                👤
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-tint border border-brand/30 text-base">
              🤖
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-slate-50 border border-brand-line/60 p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                <span>{t("tutor.thinking")}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xs font-semibold text-slate-400">💡 Prompts:</span>
        {[t("tutor.suggest1"), t("tutor.suggest2"), t("tutor.suggest3")].map((s, i) => (
          <button
            key={i}
            onClick={() => handleQuickPrompt(s)}
            className="rounded-full border border-brand-line bg-brand-tint/50 px-3 py-1 text-xs text-brand hover:bg-brand-tint hover:border-brand/40 transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("tutor.inputPlaceholder")}
          disabled={loading}
          className="flex-1 rounded-xl border border-brand-line bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none shadow-xs"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-brand-dark transition disabled:opacity-50"
        >
          {loading ? "…" : `🚀 ${t("tutor.send")}`}
        </button>
      </form>
    </div>
  );
}
