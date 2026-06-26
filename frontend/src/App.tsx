import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Learning from "./pages/Learning";
import SubjectPage from "./pages/SubjectPage";
import StudySession from "./pages/StudySession";
import Sidebar from "./components/Sidebar";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, background: "#f9fafb" }}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding/:step?" element={<Onboarding />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/learning" element={<Layout><Learning /></Layout>} />
        <Route path="/subjects/:id" element={<Layout><SubjectPage /></Layout>} />
        <Route path="/subjects/:id/session" element={<StudySession />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
