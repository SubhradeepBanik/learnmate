import { useState, useMemo, useEffect } from "react";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import { INITIAL_STUDENTS_PERFORMANCE } from "../data/mockData";
import { fetchStudents } from "../api/client";

export default function TeacherPerformance() {
  const { t } = useLanguage();

  const [students, setStudents] = useState(INITIAL_STUDENTS_PERFORMANCE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load student records from SQLite Database
  useEffect(() => {
    async function loadDbStudents() {
      const dbStudents = await fetchStudents();
      if (dbStudents && dbStudents.length > 0) {
        setStudents(
          dbStudents.map((s) => ({
            id: s.id,
            name: s.name,
            roll: s.roll_no || `DU/CSE/26/${s.id}`,
            attendance: s.attendance || "90%",
            quizzesTaken: s.quizzes_taken || 0,
            avgScore: s.avg_score || 75,
            status: s.status || "Good",
          }))
        );
      }
    }
    loadDbStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchStatus = statusFilter === "all" || s.status.toLowerCase() === statusFilter.toLowerCase();
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [students, search, statusFilter]);

  // Export report as CSV
  const handleExportCSV = () => {
    const headers = "Roll No,Student Name,Attendance,Quizzes Taken,Average Score,Status\n";
    const rows = students
      .map((s) => `"${s.roll}","${s.name}","${s.attendance}",${s.quizzesTaken},${s.avgScore}%,"${s.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Dibrugarh_University_CSE_3rdSem_Performance_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const classAvg = Math.round(students.reduce((acc, s) => acc + s.avgScore, 0) / students.length);
  const atRiskCount = students.filter((s) => s.status === "Needs Help").length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Hero title={` ${t("nav.performance")}`}>
        <p>Monitor cohort learning velocity, identify students needing academic assistance, and export performance reports.</p>
      </Hero>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label=" Total Students" value="48" />
        <Metric label=" Class Average" value={`${classAvg}%`} />
        <Metric label=" Avg Attendance" value="89%" />
        <Metric label=" Needs Assistance" value={atRiskCount} />
      </div>

      {/* Subject-Wise Class Performance Overview */}
      <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-brand-head">Semester 3 Subject Performance Trends</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { subject: "Data Structures", avg: 82, attendance: "91%" },
            { subject: "DBMS", avg: 78, attendance: "88%" },
            { subject: "Operating Systems", avg: 72, attendance: "86%" },
            { subject: "Computer Networks", avg: 84, attendance: "93%" },
          ].map((item) => (
            <div key={item.subject} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
              <div className="text-xs font-bold text-slate-700">{item.subject}</div>
              <div className="text-2xl font-bold text-brand-head">{item.avg}%</div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${item.avg}%` }} />
              </div>
              <div className="text-[11px] text-slate-400">Class Attendance: {item.attendance}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Student List & Search Controls */}
      <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["all", "Excellent", "Good", "Needs Help"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                  statusFilter === st
                    ? "bg-brand text-white shadow"
                    : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search by name or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2 pl-9 text-xs focus:outline-none focus:border-brand"
              />
              <span className="absolute left-3 top-2 text-slate-400"></span>
            </div>

            <button
              onClick={handleExportCSV}
              className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition shadow whitespace-nowrap flex items-center gap-1.5"
            >
              <span></span> Export CSV
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-line text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Roll No</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Attendance</th>
                <th className="pb-3">Quizzes Taken</th>
                <th className="pb-3">Avg Score</th>
                <th className="pb-3 pr-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 pl-2 font-mono text-slate-500">{s.roll}</td>
                  <td className="py-3 font-bold text-slate-800">{s.name}</td>
                  <td className="py-3">{s.attendance}</td>
                  <td className="py-3">{s.quizzesTaken} / 5</td>
                  <td className="py-3 font-bold text-brand-head">{s.avgScore}%</td>
                  <td className="py-3 pr-2 text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        s.status === "Excellent"
                          ? "bg-emerald-100 text-emerald-800"
                          : s.status === "Good"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      ● {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
