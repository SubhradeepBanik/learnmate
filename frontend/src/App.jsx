import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { STUDENT_NAV, TEACHER_NAV } from "./config/navigation";
import AskPdf from "./pages/AskPdf";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";

// Paths that already have a real page. Add each new feature here as you build it.
const IMPLEMENTED = new Set(["/student", "/teacher", "/student/ask-pdf"]);

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
        {placeholders(STUDENT_NAV)}

        <Route path="/teacher" element={<TeacherDashboard />} />
        {placeholders(TEACHER_NAV)}

        <Route path="*" element={<Navigate to="/student" replace />} />
      </Route>
    </Routes>
  );
}