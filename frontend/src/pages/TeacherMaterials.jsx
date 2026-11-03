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
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
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
          bookmarked: false,
        }));
        setMaterials(mapped);
      }

      const dbHistory = await fetchPdfHistory(50);
      if (dbHistory && dbHistory.length > 0) {
        setPdfHistory(dbHistory);
      }
    }
    loadDatabaseData();
  }, []);

  // Persist to localStorage as cache
  useEffect(() => {
    try {
      localStorage.setItem("learnmate_materials", JSON.stringify(materials));
    } catch {
      /* ignore */
    }
  }, [materials]);

  // Tab: 'list', 'upload', 'preview', 'history'
  const [activeTab, setActiveTab] = useState("list");

  // Filter & Search
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
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
    const formattedSize = file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;
    const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    setForm((prev) => ({
      ...prev,
      title: prev.title || cleanName,
      format: ext,
      size: formattedSize,
    }));
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

    const materialRecord = {
      id: matId,
      title: form.title,
      subject: form.subject,
      type: form.type,
      format: form.format,
      size: form.size,
      author_id: user?.id || "tea-1",
      author_name: form.author,
      department: form.department,
      semester: form.semester,
      description: form.description,
      file_name: selectedFile?.name || `${form.title.replace(/[^a-zA-Z0-9]/g, "_")}.${form.format.toLowerCase()}`,
      faculty_notes: form.facultyNotes,
      uploaded_at: dateStr,
    };

    // Store in SQLite Database
    await uploadPdfMaterial(materialRecord);

    if (editingId) {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                ...form,
                date: dateStr,
              }
            : m
        )
      );
      showToast(`Updated "${form.title}" in database!`);
      setEditingId(null);
    } else {
      const newMaterial = {
        id: matId,
        ...form,
        fileName: materialRecord.file_name,
        date: dateStr,
        downloadUrl: "#",
        bookmarked: false,
      };

      setMaterials((prev) => [newMaterial, ...prev]);
      showToast(` "${form.title}" stored in database! Students can now access it.`);
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
      author: mat.author,
      department: mat.department,
      semester: mat.semester,
      facultyNotes: mat.facultyNotes || "",
    });
    setActiveTab("upload");
  };

  // Delete action (deletes from SQLite Database + localStorage)
  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"It will be removed from database and student library.`)) {
      await deletePdfMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      showToast(`Removed "${title}" from database.`);
    }
  };

  // Simulated Download
  const handleDownload = (material) => {
    const textContent = `LearnMate Study Material\n========================\nTitle: ${material.title}\nSubject: ${material.subject}\nAuthor: ${material.author} (${material.department})\nInstitution: Dibrugarh University\nDate Published: ${material.date}\nFormat: ${material.format}\nSize: ${material.size}\n\nDescription & Syllabus Outline:\n${material.description}\n\nFaculty Notes:\n${material.facultyNotes || "Verified and approved for semester coursework."}\n`;
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
      const matchSub = subjectFilter === "all" || m.subject.toLowerCase() === subjectFilter.toLowerCase();
      const matchSearch =
        !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      return matchSub && matchSearch;
    });
  }, [materials, subjectFilter, search]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-xl transition-all duration-300 text-sm font-semibold text-white ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          <span>{toast.type === "error" ? "" : ""}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Header */}
      <Hero title={` Teacher Study Materials Studio`}>
        <p>
          Upload and organize courseware, slide decks, and reference guides stored in the database. Uploaded documents are immediately accessible in the{" "}
          <Link to="/student/materials" className="font-bold underline text-brand hover:text-brand-dark">
            Student Study Materials Library
          </Link>.
        </p>
      </Hero>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label=" Database Documents" value={materials.length} />
        <Metric label=" Enrolled Students" value="48" />
        <Metric label=" Student Downloads" value={pdfHistory.length > 0 ? pdfHistory.length : 184} />
        <Metric label=" Target Cohort" value="B.Tech CSE 3rd Sem" />
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line pb-3">
        <div className="flex gap-2 flex-wrap">
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
            <span></span> Published ({materials.length})
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "upload"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            <span></span> {editingId ? "Edit Document" : "Upload to Database"}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            <span></span> PDF Download Audit ({pdfHistory.length})
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "preview"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            <span></span> Student Preview
          </button>
        </div>

        {/* Action shortcut to jump to student view */}
        <Link
          to="/student/materials"
          className="rounded-xl border border-brand-line bg-brand-tint px-3.5 py-2 text-xs font-bold text-brand hover:bg-brand hover:text-white transition flex items-center gap-1.5"
        >
          <span></span> View Student Page
        </Link>
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
              <span className="absolute left-3 top-2 text-slate-400"></span>
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
              <p className="text-4xl mb-2"></p>
              <p className="font-semibold text-slate-700">No materials match your search.</p>
              <button
                onClick={() => setActiveTab("upload")}
                className="mt-3 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white"
              >
                + Upload New Material
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
                      <th className="pb-3">Database State</th>
                      <th className="pb-3 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredMaterials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 pl-2">
                          <div className="font-bold text-slate-800">{mat.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{mat.description}</div>
                        </td>
                        <td className="py-3">
                          <span className="rounded bg-brand-tint text-brand px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">
                            {mat.subject}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 whitespace-nowrap">
                          {mat.type} <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">({mat.format})</span>
                        </td>
                        <td className="py-3 text-slate-400 whitespace-nowrap">{mat.date}</td>
                        <td className="py-3 whitespace-nowrap">
                          <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                            ● Stored in DB
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleDownload(mat)}
                            className="rounded bg-slate-100 hover:bg-brand hover:text-white px-2 py-1 text-[11px] font-semibold transition"
                            title="Download file"
                          >
                            
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
                            
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: UPLOAD STUDIO ===================== */}
      {activeTab === "upload" && (
        <div className="rounded-2xl border border-brand-line bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-lg text-brand-head">
                {editingId ? " Edit Course Material in DB" : " Upload & Store Study Material in Database"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved into SQLite <code>pdf_materials</code> table and synchronized directly with the student library.
              </p>
            </div>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setActiveTab("list");
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                 Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handlePublish} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Course Document Attachment (PDF, DOCX, PPTX, TXT)
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-line bg-brand-tint/40 hover:bg-brand-tint/70 p-6 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-3xl"></span>
                <div className="text-xs font-bold text-brand">
                  {selectedFile ? `Selected: ${selectedFile.name}` : "Click to select a document from your computer"}
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedFile ? `File size: ${form.size}` : "Supported formats: PDF notes, DOCX lab sheets, PPTX slides, TXT cheatsheets"}
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Description & Outline</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe key concepts, theorems, or problem solutions included in this document..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Recommendations</label>
              <input
                type="text"
                value={form.facultyNotes}
                onChange={(e) => setForm({ ...form, facultyNotes: e.target.value })}
                placeholder="e.g. Focus on AVL rotation steps and worst-case derivations for Midterm."
                className="w-full rounded-xl border border-slate-300 p-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                <span></span> {editingId ? "Update in Database" : "Save & Publish to Database"}
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
              <h3 className="font-bold text-lg text-brand-head"> Student PDF Access & Download Audit Log</h3>
              <p className="text-xs text-slate-500">
                Live records stored in SQLite <code>pdf_history</code> table when students download or inspect course materials.
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
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        log.action === "DOWNLOAD"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-sky-100 text-sky-800"
                      }`}>
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
              <span className="text-xl"></span>
              <div>
                <strong>Live Synchronized Student View:</strong> Below is how your published materials appear to students in <code>/student/materials</code>.
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
            {materials.map((mat) => (
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

                  <h3 className="font-bold text-base text-slate-800 leading-snug mb-2">
                    {mat.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 mb-3">
                    {mat.description}
                  </p>

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
