import { useState, useMemo, useEffect } from "react";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { INITIAL_MATERIALS } from "../data/mockData";
import { fetchPdfMaterials, recordPdfAccess } from "../api/client";

export default function StudyMaterials() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Materials State from localStorage
  const [materials, setMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_materials");
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  // Fetch live materials from SQLite Database on mount
  useEffect(() => {
    async function loadDbMaterials() {
      const dbMaterials = await fetchPdfMaterials();
      if (dbMaterials && dbMaterials.length > 0) {
        const mapped = dbMaterials.map((m) => ({
          id: m.id,
          title: m.title,
          subject: m.subject,
          type: m.type,
          format: m.format,
          size: m.size,
          author: m.author_name,
          department: m.department,
          semester: m.semester,
          date: m.uploaded_at,
          description: m.description,
          bookmarked: false,
        }));
        setMaterials(mapped);
      }
    }
    loadDbMaterials();
  }, []);

  // Persist materials
  useEffect(() => {
    try {
      localStorage.setItem("learnmate_materials", JSON.stringify(materials));
    } catch {
      /* ignore */
    }
  }, [materials]);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'bookmarked'
  const [previewMaterial, setPreviewMaterial] = useState(null);

  // Subject and type list
  const subjects = useMemo(() => {
    return Array.from(new Set(materials.map((m) => m.subject)));
  }, [materials]);

  const types = useMemo(() => {
    return Array.from(new Set(materials.map((m) => m.type)));
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchSubject = selectedSubject === "all" || m.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchType = selectedType === "all" || m.type.toLowerCase() === selectedType.toLowerCase();
      const matchTab = activeTab === "all" || (activeTab === "bookmarked" && m.bookmarked);
      const matchSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchType && matchTab && matchSearch;
    });
  }, [materials, selectedSubject, selectedType, activeTab, searchQuery]);

  // Toggle bookmark
  const toggleBookmark = (id) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, bookmarked: !m.bookmarked } : m))
    );
  };

  // Download simulation & Audit Log
  const handleDownload = (material) => {
    // Record to database audit history
    recordPdfAccess({
      material_id: material.id,
      material_title: material.title,
      subject: material.subject,
      user_id: user?.id || "stu-1",
      user_name: user?.name || "Student Name",
      action: "DOWNLOAD",
    });

    const textContent = `LearnMate Study Material\n========================\nTitle: ${material.title}\nSubject: ${material.subject}\nAuthor: ${material.author}\nDate: ${material.date}\nFormat: ${material.format}\n\nDescription:\n${material.description}\n\nContents provided for Dibrugarh University B.Tech CSE Semester 3.\n`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${material.title.replace(/[^a-zA-Z0-9]/g, "_")}.${material.format.toLowerCase() === "pdf" ? "pdf.txt" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const bookmarkedCount = materials.filter((m) => m.bookmarked).length;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Hero title={` ${t("nav.materials")}`}>
        <p>Access and download lecture slides, reference notes, and lab manuals verified by faculty.</p>
      </Hero>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label=" Total Materials" value={materials.length} />
        <Metric label=" Subjects Covered" value={subjects.length} />
        <Metric label="⭐ Bookmarked" value={bookmarkedCount} />
        <Metric label=" Downloads Today" value="12" />
      </div>

      {/* Search & Tabs Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-brand-line pb-4">
        {/* All vs Bookmarked Tabs */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            All Materials ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab("bookmarked")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === "bookmarked"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            ⭐ Saved ({bookmarkedCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by topic, keyword, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2 pl-9 text-sm focus:outline-none focus:border-brand"
          />
          <span className="absolute left-3 top-2 text-slate-400"></span>
        </div>
      </div>

      {/* Filter Pills (Subject & Type) */}
      <div className="flex flex-wrap items-center gap-2 bg-brand-tint p-3 rounded-2xl border border-brand-line">
        <span className="text-xs font-bold text-brand uppercase tracking-wider mr-1">
          Subject:
        </span>
        <button
          onClick={() => setSelectedSubject("all")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            selectedSubject === "all"
              ? "bg-brand text-white"
              : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
          }`}
        >
          All
        </button>
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              selectedSubject === sub
                ? "bg-brand text-white"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            {sub}
          </button>
        ))}

        <div className="h-4 w-px bg-brand-line mx-2 hidden sm:block" />

        <span className="text-xs font-bold text-brand uppercase tracking-wider mr-1">
          Type:
        </span>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-lg border border-brand-line bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
        >
          <option value="all">All Formats</option>
          {types.map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
        </select>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <p className="text-4xl mb-2"></p>
          <p className="font-semibold text-slate-700">No study materials found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="rounded-md bg-brand-tint px-2.5 py-0.5 text-xs font-bold text-brand">
                    {mat.subject}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {mat.format}
                    </span>
                    <button
                      onClick={() => toggleBookmark(mat.id)}
                      title={mat.bookmarked ? "Remove Bookmark" : "Save Material"}
                      className={`text-base p-0.5 transition ${
                        mat.bookmarked ? "text-amber-500 scale-110" : "text-slate-300 hover:text-amber-400"
                      }`}
                    >
                      
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-slate-800 leading-snug mb-2 line-clamp-2">
                  {mat.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-3 mb-3">
                  {mat.description}
                </p>

                {/* Metadata */}
                <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-100 pt-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span> {mat.author}</span>
                    <span> {mat.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span> {mat.semester}</span>
                    <span> {mat.date}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setPreviewMaterial(mat)}
                  className="flex-1 rounded-xl bg-brand-tint border border-brand-line px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white transition text-center"
                >
                   Preview
                </button>
                <button
                  onClick={() => handleDownload(mat)}
                  className="flex-1 rounded-xl bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition text-center flex items-center justify-center gap-1"
                >
                   Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-6 border border-brand-line flex flex-col space-y-4">
            <div className="flex items-start justify-between border-b border-brand-line pb-3">
              <div>
                <span className="rounded bg-brand text-white px-2 py-0.5 text-xs font-bold uppercase">
                  {previewMaterial.subject}
                </span>
                <h3 className="text-lg font-bold text-brand-head mt-1">
                  {previewMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none p-1"
              >
                
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                <div><strong>Author:</strong> {previewMaterial.author}</div>
                <div><strong>Department:</strong> {previewMaterial.department}</div>
                <div><strong>Format:</strong> {previewMaterial.format} ({previewMaterial.size})</div>
                <div><strong>Uploaded:</strong> {previewMaterial.date}</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Overview & Summary</h4>
                <p className="leading-relaxed">{previewMaterial.description}</p>
              </div>

              <div className="bg-brand-tint border border-brand-line p-3 rounded-xl">
                <h5 className="font-bold text-brand mb-1"> Faculty Recommendation</h5>
                <p>Reviewed and recommended for B.Tech CSE 3rd Semester Mid-Semester & End-Semester examinations.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(previewMaterial);
                  setPreviewMaterial(null);
                }}
                className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-dark flex items-center gap-1.5"
              >
                 Download Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
