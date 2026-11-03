import React, { useState } from "react";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    fullName: "Student Name",
    email: "student@example.com",
    course: "B.Tech",
    department: "Computer Science Engineering",
    college: "Dibrugarh University",
    semester: "3rd Semester",
    language: "English",
    goals: "Improve my programming and problem-solving skills",
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
    alert("Profile updated successfully!");
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and learning details.</p>
      </div>

      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">
            {profile.fullName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{profile.fullName}</h2>
            <p>{profile.email}</p>
            <span className="profile-badge">Student</span>
          </div>
        </div>

        <div className="profile-details">
          <h3>Personal Information</h3>

          <div className="profile-grid">
            {[
              ["Full Name", "fullName"],
              ["Email Address", "email"],
              ["Course", "course"],
              ["Department", "department"],
              ["College", "college"],
              ["Semester", "semester"],
              ["Preferred Language", "language"],
              ["Learning Goals", "goals"],
            ].map(([label, name]) => (
              <div className="profile-field" key={name}>
                <label>{label}</label>

                {isEditing ? (
                  name === "language" ? (
                    <select
                      name={name}
                      value={profile[name]}
                      onChange={handleChange}
                    >
                      <option>English</option>
                      <option>Assamese</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={name}
                      value={profile[name]}
                      onChange={handleChange}
                    />
                  )
                ) : (
                  <p>{profile[name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>

              <button
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
