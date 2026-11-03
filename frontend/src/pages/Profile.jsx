import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import "./Profile.css";

function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_user_profile");
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return {
      fullName: user?.name || "Student Name",
      email: user?.email || "student@example.com",
      course: "B.Tech",
      department: user?.department || "Computer Science Engineering",
      college: user?.college || "Dibrugarh University",
      semester: user?.semester || "3rd Semester",
      language: "English",
      goals: "Improve programming, data structures, and problem-solving skills",
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
      localStorage.setItem("learnmate_user_profile", JSON.stringify(profile));
    } catch {
      /* ignore */
    }
    setToastMsg("Profile details updated successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  const fields = [
    { label: "Full Name", name: "fullName", icon: "user" },
    { label: "Email Address", name: "email", icon: "email", type: "email" },
    { label: "Course / Degree", name: "course", icon: "book" },
    { label: "Department", name: "department", icon: "building" },
    { label: "College / University", name: "college", icon: "university" },
    { label: "Current Semester", name: "semester", icon: "calendar" },
    { label: "Preferred Language", name: "language", icon: "globe", isSelect: true },
    { label: "Learning Goals", name: "goals", icon: "target", fullWidth: true },
  ];

  const avatarInitial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "S";

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-enter">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div>
          <h1 className="text-2xl font-black text-brand-head">Profile &amp; Settings</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Manage your university credentials, learning preferences, and academic details.
          </p>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-tint border border-brand/20 text-brand">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          Active Student Account
        </span>
      </div>

      {toastMsg && (
        <div className="rounded-xl bg-brand-tint border border-brand/30 p-3.5 text-xs font-bold text-brand flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span>Verified</span>
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg("")} className="text-brand/60 hover:text-brand">✕</button>
        </div>
      )}

      {/* ── Main Aesthetic Profile Card ── */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_12px_40px_-8px_rgba(8,122,69,0.12)] p-6 sm:p-8 space-y-8 transition-all">
        {/* Top Identity Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-brand-line">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-brand/25 border-2 border-white">
              {avatarInitial}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="Verified">
              ✓
            </div>
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-brand-head truncate">{profile.fullName}</h2>
              <span className="self-center sm:self-auto px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-brand-tint text-brand uppercase tracking-wider">
                {user?.role || "Student"}
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
                className="rounded-xl bg-brand hover:bg-brand-dark text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Edit Profile</span>
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

        {/* ── Details Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-head">
              Personal &amp; Academic Credentials
            </h3>
            <span className="text-xs text-brand-muted font-medium">
              {isEditing ? "Editing Mode" : "Read-Only"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {fields.map(({ label, name, isSelect, fullWidth }) => (
              <div
                key={name}
                className={`rounded-2xl border border-brand-line/70 bg-brand-hero/60 p-4 transition-all duration-200 hover:border-brand/40 hover:bg-brand-hero ${
                  fullWidth ? "sm:col-span-2" : ""
                }`}
              >
                <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                  {label}
                </label>

                {isEditing ? (
                  isSelect ? (
                    <select
                      name={name}
                      value={profile[name]}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2 text-sm font-semibold text-brand-head focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition"
                    >
                      <option>English</option>
                      <option>অসমীয়া (Assamese)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={name}
                      value={profile[name]}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2 text-sm font-semibold text-brand-head focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition"
                    />
                  )
                ) : (
                  <div className="text-sm font-bold text-brand-head break-words leading-relaxed">
                    {profile[name]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Metadata Info */}
        <div className="rounded-2xl bg-brand-tint/60 border border-brand-line p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-muted">
          <div>
            <span className="font-bold text-brand">Institutional ID:</span> DU-CSE-2026-STUDENT
          </div>
          <div>
            Registered with <strong className="text-brand-head">Dibrugarh University Portal</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
