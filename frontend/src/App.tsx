import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Learning from "./pages/Learning";
import SubjectPage from "./pages/SubjectPage";
import StudySession from "./pages/StudySession";
import Sidebar from "./components/Sidebar";
import { initClient } from "./lib/client";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: "var(--sidebar-width)", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => { initClient().catch(console.error); }, []);
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
