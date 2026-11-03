import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { STUDENT_NAV, TEACHER_NAV } from "./config/navigation";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";

// Every route except the two dashboards is a placeholder for now.
// As each feature is built, swap its ComingSoon for the real page.
const placeholders = (items, skipPath) =>
  items
    .filter((item) => item.path !== skipPath)
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
        {placeholders(STUDENT_NAV, "/student")}

        <Route path="/teacher" element={<TeacherDashboard />} />
        {placeholders(TEACHER_NAV, "/teacher")}

        <Route path="*" element={<Navigate to="/student" replace />} />
      </Route>
    </Routes>
  );
}