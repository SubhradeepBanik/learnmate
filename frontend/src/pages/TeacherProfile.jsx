import { useState } from "react";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import "./Profile.css";

export default function TeacherProfile() {
  const { t } = useLanguage();

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_teacher_profile");
      return saved
        ? JSON.parse(saved)
        : {
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
    } catch {
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
    }
  });

  const [isEditing, setIsEditing] = useState(false);

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
    alert("Faculty profile updated successfully!");
  };

  return (
    <div className="space-y-6">
      <Hero title={`👨‍🏫 ${t("nav.teacherProfile")}`}>
        <p>Manage your faculty credentials, academic background, and office communication details.</p>
      </Hero>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="📚 Active Courses" value="2" />
        <Metric label="👥 Total Students" value="48" />
        <Metric label="📄 Published Notes" value="6" />
        <Metric label="🏛️ Department" value="CSE" />
      </div>

      <div className="profile-card">
        {/* Top Profile Header */}
        <div className="profile-top">
          <div className="profile-avatar">
            {profile.fullName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{profile.fullName}</h2>
            <p>{profile.email}</p>
            <span className="profile-badge">Faculty • {profile.designation}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="profile-details">
          <h3>Academic & Departmental Details</h3>

          <div className="profile-grid">
            {[
              ["Faculty Name", "fullName"],
              ["Institutional Email", "email"],
              ["Designation", "designation"],
              ["Department", "department"],
              ["University / College", "college"],
              ["Office Location", "officeLocation"],
              ["Courses Handled", "coursesHandled"],
              ["Medium of Instruction", "language"],
            ].map(([label, name]) => (
              <div className="profile-field" key={name}>
                <label>{label}</label>
                {isEditing ? (
                  <input
                    type="text"
                    name={name}
                    value={profile[name]}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profile[name]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 profile-field">
            <label>Biography & Research Focus</label>
            {isEditing ? (
              <textarea
                name="bio"
                rows={3}
                value={profile.bio}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            ) : (
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Faculty Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
