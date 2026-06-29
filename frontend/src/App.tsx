import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard, usePodAccess } from "lemma-sdk/react";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Learning from "./pages/Learning";
import SubjectPage from "./pages/SubjectPage";
import StudySession from "./pages/StudySession";
import Sidebar from "./components/Sidebar";
import { client, initClient } from "./lib/client";

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

function AutoJoin() {
  const access = usePodAccess({ client });
  useEffect(() => {
    if (access.status === "missing") access.requestAccess().catch(console.error);
  }, [access.status]);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-bg-base)", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}>
      {access.status === "pending" ? "Access requested — waiting for approval…" : "Joining…"}
    </div>
  );
}

export default function App() {
  useEffect(() => { initClient().catch(console.error); }, []);
  return (
    <AuthGuard client={client} accessRequestFallback={<AutoJoin />}>
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
    </AuthGuard>
  );
}
