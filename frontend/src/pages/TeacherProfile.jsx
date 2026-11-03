import { useState } from "react";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";

export default function TeacherProfile() {
  const { t } = useLanguage();

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_teacher_profile");
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return {
      fullName: "Dr. Debajit Sharma",
      email: "d.sharma@dibru.ac.in",
      designation: "Associate Professor",
      department: "Computer Science & Engineering",
      college: "Dibrugarh University",
      coursesHandled: "Data Structures & Algorithms, Database Systems",
      officeLocation: "CSE Academic Block, Room 204",
      language: "English & Assamese",
      bio: "Teaching Computer Science at Dibrugarh University with a focus on data structures, algorithmic optimization, and bilingual education.",
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    try {
      localStorage.setItem("learnmate_teacher_profile", JSON.stringify(profile));
    } catch {
      /* ignore */
    }
    setToastMsg("Faculty profile updated successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  const fields = [
    ["Faculty Name", "fullName"],
    ["Institutional Email", "email"],
    ["Designation", "designation"],
    ["Department", "department"],
    ["University / College", "college"],
    ["Office Location", "officeLocation"],
    ["Courses Handled", "coursesHandled"],
    ["Medium of Instruction", "language"],
  ];

  return (
    <div className="space-y-6 page-enter">
      <Hero title={t("nav.teacherProfile")}>
        <p>Manage your faculty credentials, academic background, and office communication details.</p>
      </Hero>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Active Courses" value="2" />
        <Metric label="Total Students" value="48" />
        <Metric label="Published Notes" value="6" />
        <Metric label="Department" value="CSE" />
      </div>

      {toastMsg && (
        <div className="rounded-xl bg-brand-tint border border-brand/30 p-3.5 text-xs font-bold text-brand flex items-center justify-between shadow-sm">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg("")} className="text-brand/60 hover:text-brand">✕</button>
        </div>
      )}

      {/* Main Glassmorphic Profile Card */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_12px_40px_-8px_rgba(8,122,69,0.12)] p-6 sm:p-8 space-y-8">
        {/* Top Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-brand-line">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-brand/25 border-2 border-white flex-shrink-0">
            {profile.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-brand-head truncate">{profile.fullName}</h2>
              <span className="self-center sm:self-auto px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-brand-tint text-brand uppercase tracking-wider">
                Faculty · {profile.designation}
              </span>
            </div>
            <p className="text-sm text-brand-muted">{profile.email}</p>
            <p className="text-xs text-brand-muted/80 mt-1">
              {profile.department} · {profile.college}
            </p>
          </div>

          <div className="sm:self-center">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-xl bg-brand hover:bg-brand-dark text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                Edit Faculty Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-xl bg-brand hover:bg-brand-dark text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-brand-line bg-white hover:bg-brand-hero text-brand-head px-4 py-2 text-xs font-bold transition active:scale-95"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-brand-head mb-4">
            Academic &amp; Departmental Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {fields.map(([label, name]) => (
              <div
                key={name}
                className="rounded-2xl border border-brand-line/70 bg-brand-hero/60 p-4 transition-all duration-200 hover:border-brand/40 hover:bg-brand-hero"
              >
                <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name={name}
                    value={profile[name]}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2 text-sm font-semibold text-brand-head focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition"
                  />
                ) : (
                  <div className="text-sm font-bold text-brand-head break-words leading-relaxed">
                    {profile[name]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bio */}
          <div className="mt-4 rounded-2xl border border-brand-line/70 bg-brand-hero/60 p-4">
            <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1.5">
              Biography &amp; Research Focus
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                rows={3}
                value={profile.bio}
                onChange={handleChange}
                className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2.5 text-sm font-semibold text-brand-head focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition"
              />
            ) : (
              <p className="text-sm font-medium text-brand-head leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
