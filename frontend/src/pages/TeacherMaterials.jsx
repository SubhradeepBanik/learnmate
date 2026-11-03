import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { INITIAL_MATERIALS } from "../data/mockData";
import {
  fetchPdfMaterials,
  uploadPdfMaterial,
  deletePdfMaterial,
  fetchPdfHistory,
} from "../api/client";

export default function TeacherMaterials() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Load materials from localStorage or initial
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

  // PDF access history from SQLite database
  const [pdfHistory, setPdfHistory] = useState([]);

  // Fetch materials and download history from SQLite Database on mount
  useEffect(() => {
    async function loadDatabaseData() {
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

      const dbHistory = await fetchPdfHistory(50);
      if (dbHistory && dbHistory.length > 0) {
        setPdfHistory(dbHistory);
      }
    }
    loadDatabaseData();
  }, []);

  // Sync to localStorage
  const syncToStorage = (updated) => {
    try {
      localStorage.setItem("learnmate_materials", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("learnmate_materials_updated"));
    } catch {
      /* ignore */
    }
  };

  // Tab: 'list', 'upload', 'preview', 'history'
  const [activeTab, setActiveTab] = useState("list");

  // Mode in upload tab: 'file' or 'written'
  const [uploadMode, setUploadMode] = useState("file");

  // Filter & Search
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4500);
  };

  // Upload Form State
  const facultyName = user?.name || "Dr. Debajit Sharma";
  const [form, setForm] = useState({
    title: "",
    subject: "Data Structures",
    unit: "Unit 1",
    type: "PDF Notes",
    format: "PDF",
    size: "2.4 MB",
    description: "",
    notesContent: "",
    author: facultyName,
    department: "Computer Science & Engineering",
    semester: "3rd Semester",
    facultyNotes: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Handle Real File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize =
      file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;
    const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    setForm((prev) => ({
      ...prev,
      title: prev.title || cleanName,
      format: ext,
      size: formattedSize,
    }));
  };

  // Toggle Live Publish Status
  const handleTogglePublish = (id) => {
    setMaterials((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          const nextState = m.isPublished === false;
          showToast(
            nextState
              ? `"${m.title}" is now published to students.`
              : `"${m.title}" hidden from student portal (draft).`
          );
          return { ...m, isPublished: nextState };
        }
        return m;
      });
      syncToStorage(updated);
      return updated;
    });
  };

  // Save / Publish Material (stores to SQLite Database + localStorage)
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      showToast("Please provide both a title and description.", "error");
      return;
    }

    const matId = editingId || `mat-${Date.now()}`;
    const dateStr = new Date().toISOString().split("T")[0];

    const computedSize =
      uploadMode === "written"
        ? `${Math.max(12, Math.round((form.notesContent?.length || 200) / 100))} KB`
        : form.size;

    const materialRecord = {
      id: matId,
      title: form.title,
      subject: form.subject,
      type: form.type,
      format: uploadMode === "written" ? "PDF Notes" : form.format,
      size: computedSize,
      author_id: user?.id || "tea-1",
      author_name: form.author,
      department: form.department,
      semester: form.semester,
      description: form.description,
      file_name:
        selectedFile?.name ||
        `${form.title.replace(/[^a-zA-Z0-9]/g, "_")}.${uploadMode === "written" ? "pdf" : form.format.toLowerCase()}`,
      faculty_notes: form.facultyNotes,
      uploaded_at: dateStr,
    };

    // Store in SQLite Database
    await uploadPdfMaterial(materialRecord);

    let updatedList;
    if (editingId) {
      updatedList = materials.map((m) =>
        m.id === editingId
          ? {
              ...m,
              ...form,
              size: computedSize,
              format: uploadMode === "written" ? "PDF Notes" : form.format,
              date: dateStr,
              isPublished: true,
              publishedByFaculty: true,
            }
          : m
      );
      setMaterials(updatedList);
      syncToStorage(updatedList);
      showToast(`Updated "${form.title}" and synced to Student Section!`);
      setEditingId(null);
    } else {
      const newMaterial = {
        id: matId,
        ...form,
        size: computedSize,
        format: uploadMode === "written" ? "PDF Notes" : form.format,
        fileName: materialRecord.file_name,
        date: dateStr,
        downloadUrl: "#",
        bookmarked: false,
        isPublished: true,
        publishedByFaculty: true,
      };

      updatedList = [newMaterial, ...materials];
      setMaterials(updatedList);
      syncToStorage(updatedList);
      showToast(`"${form.title}" published! Students can now access it under Study Materials.`);
    }

    // Reset Form
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setForm({
      title: "",
      subject: "Data Structures",
      unit: "Unit 1",
      type: "PDF Notes",
      format: "PDF",
      size: "2.4 MB",
      description: "",
      notesContent: "",
      author: facultyName,
      department: "Computer Science & Engineering",
      semester: "3rd Semester",
      facultyNotes: "",
    });

    setActiveTab("list");
  };

  // Edit action
  const handleEdit = (mat) => {
    setEditingId(mat.id);
    setForm({
      title: mat.title,
      subject: mat.subject,
      unit: mat.unit || "Unit 1",
      type: mat.type,
      format: mat.format,
      size: mat.size,
      description: mat.description,
      notesContent: mat.notesContent || "",
      author: mat.author,
      department: mat.department,
      semester: mat.semester,
      facultyNotes: mat.facultyNotes || "",
    });
    setUploadMode(mat.notesContent ? "written" : "file");
    setActiveTab("upload");
  };

  // Delete action (deletes from SQLite Database + localStorage)
  const handleDelete = async (id, title) => {
    if (
      confirm(
        `Are you sure you want to delete "${title}"? It will be removed from the database and the student library.`
      )
    ) {
      await deletePdfMaterial(id);
      const updated = materials.filter((m) => m.id !== id);
      setMaterials(updated);
      syncToStorage(updated);
      showToast(`Removed "${title}" from published notes.`);
    }
  };

  // Simulated Download
  const handleDownload = (material) => {
    const textContent = `LearnMate Study Material\n========================\nTitle: ${material.title}\nSubject: ${material.subject}\nAuthor: ${material.author} (${material.department})\nInstitution: Dibrugarh University\nDate Published: ${material.date}\nFormat: ${material.format}\nSize: ${material.size}\n\nDescription & Syllabus Outline:\n${material.description}\n\nFaculty Notes & Exam Recommendations:\n${material.facultyNotes || "Verified and approved for semester coursework."}\n${
      material.notesContent
        ? `\nDetailed Notes & Lecture Content:\n--------------------------------\n${material.notesContent}\n`
        : ""
    }`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${material.title.replace(/[^a-zA-Z0-9]/g, "_")}.${material.format.toLowerCase() === "pdf" ? "pdf.txt" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Subject List
  const subjects = useMemo(() => {
    return Array.from(new Set(materials.map((m) => m.subject)));
  }, [materials]);

  // Filtered List
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchSub =
        subjectFilter === "all" || m.subject.toLowerCase() === subjectFilter.toLowerCase();
      const matchSearch =
        !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      return matchSub && matchSearch;
    });
  }, [materials, subjectFilter, search]);

  const livePublishedCount = materials.filter((m) => m.isPublished !== false).length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl transition-all duration-300 text-sm font-semibold text-white ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toast.message}</span>
          <Link
            to="/student/materials"
            className="ml-2 rounded-lg bg-white/20 hover:bg-white/30 px-2.5 py-1 text-xs font-bold text-white transition underline"
          >
            View in Student Portal
          </Link>
        </div>
      )}

      {/* Hero Header */}
      <Hero title="Teacher Study Materials Studio">
        <p>
          Publish syllabus notes, lecture slides, and reference guides directly to students. Every published note is
          instantly synchronized with the{" "}
          <Link to="/student/materials" className="font-bold underline text-brand hover:text-brand-dark">
            Student Study Materials Library
          </Link>.
        </p>
      </Hero>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Live for Students" value={livePublishedCount} />
        <Metric label="Total Course Docs" value={materials.length} />
        <Metric label="Student Downloads" value={pdfHistory.length > 0 ? pdfHistory.length : 184} />
        <Metric label="Target Cohort" value="B.Tech CSE 3rd Sem" />
      </div>

      {/* Action Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line pb-3">
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => {
              setActiveTab("list");
              setEditingId(null);
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "list"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Published Notes ({materials.length})
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "upload"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {editingId ? "Edit Note" : "Publish Notes to Students"}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            PDF Download Audit ({pdfHistory.length})
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "preview"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Student Preview
          </button>
        </div>

        {/* Primary Call to Action & Student View Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingId(null);
              setActiveTab("upload");
            }}
            className="rounded-xl bg-brand hover:bg-brand-dark text-white px-4 py-2 text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Publish New Notes
          </button>
          <Link
            to="/student/materials"
            className="rounded-xl border border-brand-line bg-brand-tint px-3.5 py-2 text-xs font-bold text-brand hover:bg-brand hover:text-white transition flex items-center gap-1.5"
          >
            <span>View Student Section</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </Link>
        </div>
      </div>

      {/* ===================== TAB 1: PUBLISHED COURSEWARE ===================== */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-brand-tint p-4 rounded-2xl border border-brand-line">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search published materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2 text-xs pl-9 focus:outline-none focus:border-brand"
              />
              <svg className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto py-1">
              <button
                onClick={() => setSubjectFilter("all")}
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                  subjectFilter === "all"
                    ? "bg-brand text-white"
                    : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
                }`}
              >
                All Subjects
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubjectFilter(sub)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                    subjectFilter === sub
                      ? "bg-brand text-white"
                      : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No materials match your search.</p>
              <button
                onClick={() => setActiveTab("upload")}
                className="mt-3 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition"
              >
                + Publish Notes to Students
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-brand-line text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="pb-3 pl-2">Document Title</th>
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Type & Format</th>
                      <th className="pb-3">Uploaded Date</th>
                      <th className="pb-3">Student Visibility</th>
                      <th className="pb-3 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredMaterials.map((mat) => {
                      const isLive = mat.isPublished !== false;
                      return (
                        <tr key={mat.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 pl-2">
                            <div className="font-bold text-slate-800">{mat.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{mat.description}</div>
                            {mat.facultyNotes && (
                              <div className="text-[10px] text-brand-dark font-medium mt-0.5">
                                Tip: {mat.facultyNotes}
                              </div>
                            )}
                          </td>
                          <td className="py-3">
                            <span className="rounded bg-brand-tint text-brand px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">
                              {mat.subject}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 whitespace-nowrap">
                            {mat.type}{" "}
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                              ({mat.format})
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 whitespace-nowrap">{mat.date}</td>
                          <td className="py-3 whitespace-nowrap">
                            {isLive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                Live for Students
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 px-2.5 py-1 text-[10px] font-bold">
                                Draft (Hidden)
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-2 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => handleTogglePublish(mat.id)}
                              className={`rounded px-2.5 py-1 text-[11px] font-semibold transition border ${
                                isLive
                                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                              }`}
                              title={isLive ? "Hide from students" : "Publish to students"}
                            >
                              {isLive ? "Unpublish" : "Publish Now"}
                            </button>
                            <button
                              onClick={() => handleDownload(mat)}
                              className="rounded bg-slate-100 hover:bg-brand hover:text-white px-2 py-1 text-[11px] font-semibold transition"
                              title="Download note content"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => handleEdit(mat)}
                              className="rounded bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold transition text-slate-700"
                              title="Edit details"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(mat.id, mat.title)}
                              className="rounded bg-rose-50 hover:bg-rose-100 px-2 py-1 text-[11px] font-semibold transition text-rose-700"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: PUBLISH NOTES STUDIO ===================== */}
      {activeTab === "upload" && (
        <div className="rounded-2xl border border-brand-line bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Faculty Publishing Channel
                </span>
              </div>
              <h3 className="font-bold text-lg text-brand-head mt-1">
                {editingId ? "Edit & Update Published Notes" : "Publish Notes & Study Materials to Students"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Notes published here are immediately displayed in the Student Study Materials portal with faculty
                verification.
              </p>
            </div>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setActiveTab("list");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Mode Switch: Upload File vs Write Notes */}
          <div className="flex gap-2 p-1.5 bg-brand-tint rounded-xl border border-brand-line max-w-md">
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                uploadMode === "file" ? "bg-brand text-white shadow-sm" : "text-slate-700 hover:bg-white"
              }`}
            >
              Upload Document (PDF/DOCX)
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("written")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                uploadMode === "written" ? "bg-brand text-white shadow-sm" : "text-slate-700 hover:bg-white"
              }`}
            >
              Write Quick Faculty Notes
            </button>
          </div>

          <form onSubmit={handlePublish} className="space-y-5">
            {uploadMode === "file" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Attach Course Document (PDF, DOCX, PPTX, TXT)
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-line bg-brand-tint/40 hover:bg-brand-tint/70 p-6 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
                >
                  <svg className="w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div className="text-xs font-bold text-brand">
                    {selectedFile ? `Selected: ${selectedFile.name}` : "Click to select a document from your computer"}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {selectedFile
                      ? `File size: ${form.size}`
                      : "Supported formats: PDF notes, DOCX lab sheets, PPTX slides, TXT cheatsheets"}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Faculty Lecture Notes & Syllabus Content
                </label>
                <textarea
                  rows={5}
                  value={form.notesContent}
                  onChange={(e) => setForm({ ...form, notesContent: e.target.value })}
                  placeholder="Type or paste lecture summary, key formulas, code snippets, or revision points directly here. Students can view and download these notes anytime."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:border-brand font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Document / Note Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Unit 3: Graph Traversal Algorithms & Minimum Spanning Trees"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-brand"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course / Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                >
                  <option>Data Structures</option>
                  <option>DBMS</option>
                  <option>Operating Systems</option>
                  <option>Computer Networks</option>
                  <option>Discrete Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Chapter</label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g. Unit 1, Unit 2, Midterm Special"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Material Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                >
                  <option>PDF Notes</option>
                  <option>Lecture Slides</option>
                  <option>Lab Manual</option>
                  <option>Cheatsheet</option>
                  <option>Exam Reference & PYQs</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructor / Author</label>
                <input
                  type="text"
                  required
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Semester</label>
                <input
                  type="text"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description & Syllabus Summary</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe key concepts, theorems, or problem solutions covered in this note..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty Exam Tip / Special Recommendation (Displayed to Students)
              </label>
              <input
                type="text"
                value={form.facultyNotes}
                onChange={(e) => setForm({ ...form, facultyNotes: e.target.value })}
                placeholder="e.g. High weightage for Midterm Exam. Focus on AVL tree rotations and BFS traversal proofs."
                className="w-full rounded-xl border border-slate-300 p-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setActiveTab("list");
                }}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand px-7 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {editingId ? "Update Note & Sync with Students" : "Publish Notes to Student Section"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================== TAB 3: PDF AUDIT & DOWNLOAD HISTORY ===================== */}
      {activeTab === "history" && (
        <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-lg text-brand-head">Student PDF Access & Download Audit Log</h3>
              <p className="text-xs text-slate-500">
                Live records stored in SQLite <code>pdf_history</code> table when students download or inspect course
                materials.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold">
              {pdfHistory.length} Recorded Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-line text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Timestamp</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Document Title</th>
                  <th className="pb-3 pr-2">Subject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pdfHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 pl-2 text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                    <td className="py-3 font-bold text-slate-800">{log.user_name || "Student"}</td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          log.action === "DOWNLOAD"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-700">{log.material_title}</td>
                    <td className="py-3 pr-2">
                      <span className="rounded bg-brand-tint text-brand px-2 py-0.5 text-[11px] font-semibold">
                        {log.subject || "Course Material"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: STUDENT VIEW PREVIEW ===================== */}
      {activeTab === "preview" && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <strong>Live Synchronized Student View:</strong> Below is how your published notes appear to students in{" "}
                <code>/student/materials</code>.
              </div>
            </div>
            <Link
              to="/student/materials"
              className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 font-bold hover:bg-emerald-700 transition whitespace-nowrap"
            >
              Open Actual Student Page ↗
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {materials
              .filter((m) => m.isPublished !== false)
              .map((mat) => (
                <div
                  key={mat.id}
                  className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-brand-tint px-2.5 py-0.5 text-xs font-bold text-brand">
                        {mat.subject}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {mat.format}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-800 leading-snug mb-2">{mat.title}</h3>

                    <p className="text-xs text-slate-500 line-clamp-3 mb-3">{mat.description}</p>

                    {mat.facultyNotes && (
                      <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-2.5 mb-3 text-[11px] text-emerald-900">
                        <span className="font-bold">Faculty Tip:</span> {mat.facultyNotes}
                      </div>
                    )}

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

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDownload(mat)}
                      className="w-full rounded-xl bg-brand py-2 text-xs font-bold text-white hover:bg-brand-dark transition text-center flex items-center justify-center gap-1.5"
                    >
                      Student Download Simulator
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
