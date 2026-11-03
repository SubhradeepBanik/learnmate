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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  // Fetch live materials from SQLite Database on mount and merge
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
          facultyNotes: m.faculty_notes,
          notesContent: m.notes_content || "",
          isPublished: m.is_published !== 0,
          publishedByFaculty: true,
          bookmarked: false,
        }));

        setMaterials((prev) => {
          const map = new Map();
          mapped.forEach((item) => map.set(item.id, item));
          prev.forEach((item) => {
            if (!map.has(item.id)) map.set(item.id, item);
          });
          const merged = Array.from(map.values());
          try {
            localStorage.setItem("learnmate_materials", JSON.stringify(merged));
          } catch {
            /* ignore */
          }
          return merged;
        });
      }
    }
    loadDbMaterials();
  }, []);

  // Listen to real-time publish events from teacher portal across tabs / sessions
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem("learnmate_materials");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMaterials(parsed);
          }
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("learnmate_materials_updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("learnmate_materials_updated", handleStorageUpdate);
    };
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
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'faculty', 'bookmarked'
  const [previewMaterial, setPreviewMaterial] = useState(null);

  // Subject and type list (only visible materials)
  const visibleMaterials = useMemo(() => {
    return materials.filter((m) => m.isPublished !== false);
  }, [materials]);

  const subjects = useMemo(() => {
    return Array.from(new Set(visibleMaterials.map((m) => m.subject)));
  }, [visibleMaterials]);

  const types = useMemo(() => {
    return Array.from(new Set(visibleMaterials.map((m) => m.type)));
  }, [visibleMaterials]);

  const facultyMaterialsCount = useMemo(() => {
    return visibleMaterials.filter((m) => m.publishedByFaculty || m.facultyNotes).length;
  }, [visibleMaterials]);

  const bookmarkedCount = useMemo(() => {
    return visibleMaterials.filter((m) => m.bookmarked).length;
  }, [visibleMaterials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return visibleMaterials.filter((m) => {
      const matchSubject =
        selectedSubject === "all" || m.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchType =
        selectedType === "all" || m.type.toLowerCase() === selectedType.toLowerCase();

      let matchTab = true;
      if (activeTab === "bookmarked") {
        matchTab = !!m.bookmarked;
      } else if (activeTab === "faculty") {
        matchTab = !!(m.publishedByFaculty || m.facultyNotes);
      }

      const matchSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSubject && matchType && matchTab && matchSearch;
    });
  }, [visibleMaterials, selectedSubject, selectedType, activeTab, searchQuery]);

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

    const textContent = `LearnMate Study Material\n========================\nTitle: ${material.title}\nSubject: ${material.subject}\nAuthor: ${material.author}\nDate: ${material.date}\nFormat: ${material.format}\nSize: ${material.size}\n\nDescription:\n${material.description}\n\nFaculty Exam Recommendations & Syllabus Tips:\n${material.facultyNotes || "Verified and approved by department faculty."}\n${
      material.notesContent
        ? `\nDetailed Lecture Notes & Notes Content:\n--------------------------------------\n${material.notesContent}\n`
        : ""
    }\nContents provided for Dibrugarh University B.Tech CSE Semester 3.\n`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${material.title.replace(/[^a-zA-Z0-9]/g, "_")}.${material.format.toLowerCase() === "pdf" ? "pdf.txt" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Hero title={t("nav.materials")}>
        <p>Access and download lecture slides, reference notes, and lab manuals verified by faculty.</p>
      </Hero>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Total Materials" value={visibleMaterials.length} />
        <Metric label="Subjects Covered" value={subjects.length} />
        <Metric label="Faculty Notes" value={facultyMaterialsCount} />
        <Metric label="Saved Materials" value={bookmarkedCount} />
      </div>

      {/* Faculty Announcement Banner */}
      <div className="flex items-center justify-between gap-3 bg-brand-tint border border-brand-line rounded-2xl p-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">Faculty Verified Course Notes</div>
            <p className="text-slate-500">
              Your professors publish lecture summaries, question banks, and lab guides directly here.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("faculty")}
          className="rounded-xl bg-brand hover:bg-brand-dark text-white px-3.5 py-1.5 font-bold transition whitespace-nowrap text-xs shadow-sm"
        >
          View Faculty Notes
        </button>
      </div>

      {/* Search & Tabs Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-brand-line pb-4">
        {/* All vs Faculty vs Bookmarked Tabs */}
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            All Materials ({visibleMaterials.length})
          </button>
          <button
            onClick={() => setActiveTab("faculty")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "faculty"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Faculty Published ({facultyMaterialsCount})
          </button>
          <button
            onClick={() => setActiveTab("bookmarked")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "bookmarked"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            Saved ({bookmarkedCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by topic, keyword, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2 pl-9 text-xs focus:outline-none focus:border-brand"
          />
          <svg className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      {/* Filter Pills (Subject & Type) */}
      <div className="flex flex-wrap items-center gap-2 bg-brand-tint p-3 rounded-2xl border border-brand-line">
        <span className="text-xs font-bold text-brand uppercase tracking-wider mr-1">Subject:</span>
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

        <span className="text-xs font-bold text-brand uppercase tracking-wider mr-1">Type:</span>
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
          <p className="font-semibold text-slate-700">No study materials found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((mat) => {
            const isFacultyVerified = mat.publishedByFaculty || !!mat.facultyNotes;

            return (
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
                      {isFacultyVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                          <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Faculty Note
                        </span>
                      )}
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {mat.format}
                      </span>
                      <button
                        onClick={() => toggleBookmark(mat.id)}
                        title={mat.bookmarked ? "Remove Bookmark" : "Save Material"}
                        className={`p-1 rounded-lg transition ${
                          mat.bookmarked
                            ? "text-amber-500 bg-amber-50"
                            : "text-slate-300 hover:text-amber-400 hover:bg-slate-50"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base text-slate-800 leading-snug mb-2 line-clamp-2">
                    {mat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-3 mb-3">{mat.description}</p>

                  {/* Faculty Recommendation Callout if available */}
                  {mat.facultyNotes && (
                    <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-2.5 text-[11px] text-emerald-900 mb-3 font-medium">
                      <span className="font-bold text-emerald-950">Faculty Tip: </span>
                      {mat.facultyNotes}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-100 pt-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span>{mat.author}</span>
                      <span>{mat.size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{mat.semester}</span>
                      <span>{mat.date}</span>
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
                    className="flex-1 rounded-xl bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition text-center flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-6 border border-brand-line flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-brand-line pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-brand text-white px-2 py-0.5 text-xs font-bold uppercase">
                    {previewMaterial.subject}
                  </span>
                  {(previewMaterial.publishedByFaculty || previewMaterial.facultyNotes) && (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                      Verified Faculty Material
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-brand-head mt-1">{previewMaterial.title}</h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <strong>Author:</strong> {previewMaterial.author}
                </div>
                <div>
                  <strong>Department:</strong> {previewMaterial.department}
                </div>
                <div>
                  <strong>Format:</strong> {previewMaterial.format} ({previewMaterial.size})
                </div>
                <div>
                  <strong>Uploaded:</strong> {previewMaterial.date}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Overview & Summary</h4>
                <p className="leading-relaxed">{previewMaterial.description}</p>
              </div>

              {previewMaterial.notesContent && (
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Full Notes & Lecture Body</h4>
                  <pre className="p-3 bg-brand-tint/50 rounded-xl border border-brand-line whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 max-h-48 overflow-y-auto">
                    {previewMaterial.notesContent}
                  </pre>
                </div>
              )}

              <div className="bg-brand-tint border border-brand-line p-3 rounded-xl">
                <h5 className="font-bold text-brand mb-1">Faculty Recommendation & Guidance</h5>
                <p>
                  {previewMaterial.facultyNotes ||
                    "Reviewed and approved for Dibrugarh University B.Tech CSE coursework and semester examinations."}
                </p>
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
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
