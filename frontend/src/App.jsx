import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { STUDENT_NAV, TEACHER_NAV } from "./config/navigation";
import AskPdf from "./pages/AskPdf";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import QuizStudio from "./pages/QuizStudio";
import Tutor from "./pages/Tutor";
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
import TeacherCreateQuiz from "./pages/TeacherCreateQuiz";
import SignIn from "./pages/SignIn";

const placeholders = (items, skipPaths = []) => {
  const skipList = Array.isArray(skipPaths) ? skipPaths : [skipPaths];
  return items
    .filter((item) => !skipList.includes(item.path))
    .map((item) => (
      <Route key={item.path} path={item.path} element={<ComingSoon titleKey={item.key} />} />
    ));
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />
      <Route path="/signin" element={<Navigate to="/login" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/student" replace />} />
        <Route path="/student" element={<Dashboard />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/flashcards" element={<Flashcards />} />
        <Route path="/student/account" element={<Account />} />
        <Route path="/student/materials" element={<StudyMaterials />} />
        <Route path="/student/results" element={<ResultsProgress />} />
        <Route path="/student/revision" element={<RevisionPlanner />} />
        <Route path="/student/quiz" element={<QuizStudio />} />
        <Route path="/student/ask-pdf" element={<AskPdf />} />
        <Route path="/student/tutor" element={<Tutor />} />
        {placeholders(STUDENT_NAV, [
          "/student", "/student/profile", "/student/flashcards", "/student/account",
          "/student/materials", "/student/results", "/student/revision", "/student/quiz",
          "/student/ask-pdf", "/student/tutor",
        ])}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/materials" element={<TeacherMaterials />} />
        <Route path="/teacher/upload" element={<TeacherMaterials />} />
        <Route path="/teacher/create-quiz" element={<TeacherCreateQuiz />} />
        <Route path="/teacher/performance" element={<TeacherPerformance />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/teacher/account" element={<Account />} />
        {placeholders(TEACHER_NAV, [
          "/teacher", "/teacher/materials", "/teacher/upload", "/teacher/create-quiz",
          "/teacher/performance", "/teacher/profile", "/teacher/account",
        ])}
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Route>
    </Routes>
  );
}
