import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { STUDENT_NAV, TEACHER_NAV } from "./config/navigation";
import AskPdf from "./pages/AskPdf";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import QuizStudio from "./pages/QuizStudio";
import TeacherDashboard from "./pages/TeacherDashboard";
import Tutor from "./pages/Tutor";

// Paths that already have a real page.
const IMPLEMENTED = new Set([
  "/student",
  "/teacher",
  "/student/ask-pdf",
  "/student/tutor",
  "/student/quiz",
]);

const placeholders = (items) =>
  items
    .filter((item) => !IMPLEMENTED.has(item.path))
    .map((item) => (
      <Route
        key={item.path}
        path={item.path}
        element={<ComingSoon titleKey={item.key} />}
      />
    ));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/student" replace />} />

        <Route path="/student" element={<Dashboard />} />
        <Route path="/student/ask-pdf" element={<AskPdf />} />
        <Route path="/student/tutor" element={<Tutor />} />
        <Route path="/student/quiz" element={<QuizStudio />} />
        {placeholders(STUDENT_NAV)}

        <Route path="/teacher" element={<TeacherDashboard />} />
        {placeholders(TEACHER_NAV)}

        <Route path="*" element={<Navigate to="/student" replace />} />
      </Route>
    </Routes>
  );
}
