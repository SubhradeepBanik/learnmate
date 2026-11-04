import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { uploadDocument, askQuestion, listDocuments } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export default function DashboardAskPdfBar() {
  const { lang, t } = useLanguage();

  const [docs, setDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const fileInputRef = useRef(null);

  // Load existing documents
  useEffect(() => {
    listDocuments()
      .then((data) => {
        if (Array.isArray(data)) {
          setDocs(data);
          if (data.length > 0) {
            setSelectedDocId(data[0].doc_id);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Handle direct file upload from the dashboard search bar
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    setUploading(true);
    setError("");
    setUploadSuccess("");

    try {
      const info = await uploadDocument({
        file,
        subject: "Study Material",
        topic: file.name.replace(/\.pdf$/i, ""),
      });
      setUploadSuccess(`Uploaded "${file.name}" (${info.pages || 1} pages, ${info.chunks || 1} chunks)`);
      const updatedDocs = await listDocuments();
      if (Array.isArray(updatedDocs)) {
        setDocs(updatedDocs);
        setSelectedDocId(info.doc_id || updatedDocs[0]?.doc_id || "");
      }
    } catch (err) {
      setError(err.message || "Failed to upload and process PDF.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle asking question
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAsking(true);
    setError("");
    setResult(null);

    try {
      const data = await askQuestion({
        question: question.trim(),
        lang: lang === "as" ? "as" : "en",
        doc_id: selectedDocId || null,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not retrieve answer. Please try again.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#A3BFA8]/40 bg-gradient-to-br from-[#143D2B] via-[#1B4332] to-[#143D2B] p-5 sm:p-7 shadow-lg shadow-[#143D2B]/15 relative overflow-hidden">
      {/* Decorative ambient background rings */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#A3BFA8]/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full bg-[#DDE8DC]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#A3BFA8]/20 border border-[#A3BFA8]/30 flex items-center justify-center text-[#A3BFA8]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M10 9H8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#F5F7F2]">Ask Your PDF</h2>
              <p className="text-xs text-[#A3BFA8] font-medium">
                Upload your study materials and get instant AI-powered explanations.
              </p>
            </div>
          </div>

          <Link
            to="/student/ask-pdf"
            className="self-start sm:self-auto text-[11px] font-bold text-[#DDE8DC] hover:text-white flex items-center gap-1 transition"
          >
            <span>Full Workspace</span>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Hidden PDF File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Horizontal Search & Upload Bar */}
        <form onSubmit={handleAsk} className="relative">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#DDE8DC] shadow-md transition-all focus-within:ring-2 focus-within:ring-[#A3BFA8] focus-within:border-[#1B4332]">
            {/* Document Scope Tag / Dropdown */}
            {docs.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DDE8DC]/60 border border-[#A3BFA8]/30 text-[#143D2B] text-xs font-bold flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-[#1B4332]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                </svg>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-[#143D2B] focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[160px] truncate"
                >
                  <option value="">All Documents</option>
                  {docs.map((d) => (
                    <option key={d.doc_id} value={d.doc_id} className="text-black">
                      {d.filename}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Main Question Input */}
            <div className="flex-1 flex items-center gap-2 px-3 py-1">
              <svg className="w-4 h-4 text-[#52796F] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything from your PDF..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#143D2B] placeholder-[#52796F]/70 font-medium focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 md:pt-0 border-t md:border-t-0 border-[#DDE8DC] justify-end">
              {/* Upload PDF Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-xl border border-[#A3BFA8]/50 bg-[#DDE8DC]/50 hover:bg-[#DDE8DC] px-3.5 py-2 text-xs font-bold text-[#143D2B] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Upload PDF study material"
              >
                {uploading ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#143D2B] border-t-transparent" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-[#1B4332]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Upload PDF</span>
                  </>
                )}
              </button>

              {/* Submit Question Button */}
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#143D2B] to-[#1B4332] hover:from-[#1B4332] hover:to-[#2D6A4F] px-4 py-2 text-xs font-bold text-[#F5F7F2] shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {asking ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F5F7F2] border-t-transparent" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>Ask</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Upload Success Alert */}
        {uploadSuccess && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-[#DDE8DC] border border-[#A3BFA8] px-3.5 py-2 text-xs font-bold text-[#143D2B] animate-fadeIn">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#1B4332]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{uploadSuccess}</span>
            </div>
            <button onClick={() => setUploadSuccess("")} className="text-[#143D2B]/70 hover:text-[#143D2B] text-xs">✕</button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs font-medium text-red-700 animate-fadeIn">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 text-xs font-bold">✕</button>
          </div>
        )}

        {/* AI Answer Card (Interactive Output) */}
        {result && (
          <div className="mt-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#A3BFA8]/50 p-4 sm:p-5 shadow-lg animate-fadeIn text-[#143D2B]">
            <div className="flex items-center justify-between border-b border-[#DDE8DC] pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332] animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#143D2B]">AI Tutor Explanation</h3>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-xs font-semibold text-[#52796F] hover:text-[#143D2B] transition"
              >
                Close
              </button>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal text-[#143D2B]">
              {result.answer}
            </p>

            {/* Cited Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-[#DDE8DC]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#52796F] mb-1.5">
                  Verified PDF Sources:
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((s) => (
                    <div key={s.n} className="rounded-lg bg-[#DDE8DC]/60 border border-[#A3BFA8]/40 px-2.5 py-1 text-[11px] font-semibold text-[#143D2B]">
                      [{s.n}] {s.filename} (Page {s.page})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
