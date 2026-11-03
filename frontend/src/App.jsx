import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { STUDENT_NAV, TEACHER_NAV } from "./config/navigation";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Profile from "./pages/Profile";
import Flashcards from "./pages/Flashcards";
import Account from "./pages/Account";
import StudyMaterials from "./pages/StudyMaterials";
import ResultsProgress from "./pages/ResultsProgress";
import RevisionPlanner from "./pages/RevisionPlanner";
import TeacherMaterials from "./pages/TeacherMaterials";
import TeacherPerformance from "./pages/TeacherPerformance";
import TeacherProfile from "./pages/TeacherProfile";
import SignIn from "./pages/SignIn";

// Every route except built pages is a placeholder for now.
// Swapping ComingSoon as each feature is built.
const placeholders = (items, skipPaths = []) => {
  const skipList = Array.isArray(skipPaths) ? skipPaths : [skipPaths];
  return items
    .filter((item) => !skipList.includes(item.path))
    .map((item) => (
      <Route
        key={item.path}
        path={item.path}
        element={<ComingSoon titleKey={item.key} />}
      />
    ));
};

export default function App() {
  return (
    <Routes>
      {/* Standalone Authentication Routes */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/signin" element={<Navigate to="/login" replace />} />

      {/* Main Authenticated Layout Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/student" replace />} />

        {/* Student Routes */}
        <Route path="/student" element={<Dashboard />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/flashcards" element={<Flashcards />} />
        <Route path="/student/account" element={<Account />} />
        <Route path="/student/materials" element={<StudyMaterials />} />
        <Route path="/student/results" element={<ResultsProgress />} />
        <Route path="/student/revision" element={<RevisionPlanner />} />

        {/* Remaining AI student routes (/student/tutor and /student/ask-pdf) are kept as ComingSoon */}
        {placeholders(STUDENT_NAV, [
          "/student",
          "/student/profile",
          "/student/flashcards",
          "/student/account",
          "/student/materials",
          "/student/results",
          "/student/revision",
        ])}

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/materials" element={<TeacherMaterials />} />
        <Route path="/teacher/upload" element={<TeacherMaterials />} />
        <Route path="/teacher/performance" element={<TeacherPerformance />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/teacher/account" element={<Account />} />

        {placeholders(TEACHER_NAV, [
          "/teacher",
          "/teacher/materials",
          "/teacher/upload",
          "/teacher/performance",
          "/teacher/profile",
          "/teacher/account",
        ])}

        <Route path="*" element={<Navigate to="/student" replace />} />
      </Route>
    </Routes>
  );
}
