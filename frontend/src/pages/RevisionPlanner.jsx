import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import { INITIAL_REVISION_TASKS } from "../data/mockData";

export default function RevisionPlanner() {
  const { t } = useLanguage();

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_revision_tasks");
      return saved ? JSON.parse(saved) : INITIAL_REVISION_TASKS;
    } catch {
      return INITIAL_REVISION_TASKS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("learnmate_revision_tasks", JSON.stringify(tasks));
    } catch {
      /* ignore */
    }
  }, [tasks]);

  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'pending', 'completed'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "Data Structures",
    priority: "Medium",
    dueDate: "Today",
    estimatedMinutes: 20,
    topicNotes: "",
  });

  // Toggle complete
  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((tk) => (tk.id === id ? { ...tk, completed: !tk.completed } : tk))
    );
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((tk) => tk.id !== id));
  };

  // Add task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const taskObj = {
      id: `rev-${Date.now()}`,
      ...newTask,
      completed: false,
    };
    setTasks((prev) => [taskObj, ...prev]);
    setIsModalOpen(false);
    setNewTask({
      title: "",
      subject: "Data Structures",
      priority: "Medium",
      dueDate: "Today",
      estimatedMinutes: 20,
      topicNotes: "",
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((tk) => {
      const matchSub = filterSubject === "all" || tk.subject.toLowerCase() === filterSubject.toLowerCase();
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" && !tk.completed) ||
        (filterStatus === "completed" && tk.completed);
      return matchSub && matchStatus;
    });
  }, [tasks, filterSubject, filterStatus]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Hero title={`📅 ${t("nav.revision")}`}>
        <p>Stay on track with spaced repetition schedules, chapter review goals, and daily study milestones.</p>
      </Hero>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="📋 Total Tasks" value={tasks.length} />
        <Metric label="⏳ Pending Review" value={pendingCount} />
        <Metric label="✅ Completed" value={completedCount} />
        <Metric label="🔥 Completion" value={`${completionRate}%`} />
      </div>

      {/* Action Bar & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-brand-line pb-4">
        <div className="flex gap-2">
          {["all", "pending", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition ${
                filterStatus === st
                  ? "bg-brand text-white shadow"
                  : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
              }`}
            >
              {st} ({st === "all" ? tasks.length : st === "pending" ? pendingCount : completedCount})
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition shadow flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
        >
          <span>+</span> Add Revision Task
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-semibold text-slate-700">No revision tasks in this list!</p>
            <p className="text-xs text-slate-400 mt-1">Add a new revision goal to keep learning.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-2xl border p-4 shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                task.completed
                  ? "bg-slate-50 border-slate-200 opacity-75"
                  : "bg-white border-brand-line hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="rounded bg-brand-tint text-brand text-[11px] font-bold px-2 py-0.5">
                      {task.subject}
                    </span>
                    <span className={`rounded text-[10px] font-bold px-2 py-0.5 ${
                      task.priority === "High"
                        ? "bg-rose-100 text-rose-800"
                        : task.priority === "Medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400">📅 {task.dueDate}</span>
                    <span className="text-xs text-slate-400">⏱️ {task.estimatedMinutes} mins</span>
                  </div>

                  <h4 className={`font-bold text-sm text-slate-800 ${task.completed ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                  </h4>
                  {task.topicNotes && (
                    <p className="text-xs text-slate-500 mt-0.5">{task.topicNotes}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  to="/student/flashcards"
                  className="rounded-lg bg-brand-tint border border-brand-line px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand hover:text-white transition"
                >
                  🗂️ Cards
                </Link>
                <Link
                  to="/student/quiz"
                  className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  📝 Quiz
                </Link>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 text-sm"
                  title="Delete Task"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 border border-brand-line">
            <h3 className="text-lg font-bold text-brand-head mb-4">Add Revision Schedule</h3>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Goal</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Master B-Tree insertion and search"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  >
                    <option>Data Structures</option>
                    <option>DBMS</option>
                    <option>Operating Systems</option>
                    <option>Computer Networks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="text"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    placeholder="Today / Tomorrow / Nov 05"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newTask.estimatedMinutes}
                    onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Study Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={newTask.topicNotes}
                  onChange={(e) => setNewTask({ ...newTask, topicNotes: e.target.value })}
                  placeholder="Key textbook pages or formula references..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-dark"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
