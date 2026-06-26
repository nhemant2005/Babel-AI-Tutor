import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubject } from "../hooks/useSubject";
import { client } from "../lib/client";
import ChatWindow from "../components/ChatWindow";
import LandscapeGraph from "../components/LandscapeGraph";


export default function Onboarding() {
  const { step = "upload" } = useParams<{ step?: string }>();
  const navigate = useNavigate();
  const [subjectId, setSubjectId] = useState<string | null>(
    () => sessionStorage.getItem("onboarding_subject_id")
  );
  const [persona, setPersona] = useState<"socratic" | "example_first">("socratic");
  const { subject, createRecord, refresh } = useSubject(subjectId);

  useEffect(() => {
    if (subjectId) sessionStorage.setItem("onboarding_subject_id", subjectId);
  }, [subjectId]);

  // Poll for processing completion
  useEffect(() => {
    if (subject?.status !== "processing") return;
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [subject?.status, refresh]);

  if (step === "upload") return (
    <UploadStep
      processing={subject?.status === "processing"}
      onSubmit={async ({ name, deadline, text, availableDays, durationMins, priorExp }) => {
        const s = await createRecord({
          name, deadline: deadline || undefined, status: "processing",
          available_days: availableDays,
          duration_per_day_mins: durationMins,
          prior_experience: priorExp,
        });
        setSubjectId(s.id);
        // Start onboarding workflow
        await (client as any).workflows.run("onboarding", {
          subject_id: s.id,
          material_content: text,
          material_hash: await hashText(text),
        });
        navigate("/onboarding/persona");
      }}
    />
  );

  if (step === "persona") return (
    <PersonaStep
      onSelect={async (p) => {
        setPersona(p);
        navigate("/onboarding/trial");
      }}
    />
  );

  if (step === "trial") return (
    <TrialSessionStep
      subjectId={subjectId!}
      persona={persona}
      onComplete={() => navigate("/onboarding/landscape")}
    />
  );

  if (step === "landscape") return (
    <LandscapeRevealStep
      subjectId={subjectId!}
      onDone={() => navigate("/home")}
    />
  );

  return null;
}

async function hashText(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function UploadStep({ onSubmit, processing }: {
  onSubmit: (d: { name: string; deadline: string; text: string; availableDays: string[]; durationMins: number; priorExp: string }) => Promise<void>;
  processing: boolean;
}) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [text, setText] = useState("");
  const [priorExp, setPriorExp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (processing) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem" }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>Processing your material...</div>
      <div style={{ color: "#6b7280" }}>Identifying topics and building your landscape</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>What are you studying?</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Upload your material and we'll build a learning landscape for you.</p>

      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: 4 }}>Subject name</span>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Organic Chemistry" style={inputStyle} />
      </label>

      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: 4 }}>Exam / deadline (optional)</span>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inputStyle} />
      </label>

      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: 4 }}>Prior experience (optional)</span>
        <input value={priorExp} onChange={e => setPriorExp(e.target.value)} placeholder="e.g. I've done high school chemistry" style={inputStyle} />
      </label>

      <label style={{ display: "block", marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: 4 }}>Paste your material</span>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={10} placeholder="Paste notes, textbook excerpts, or paste text from a PDF..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
      </label>

      <button
        disabled={!name || !text || submitting}
        onClick={async () => { setSubmitting(true); await onSubmit({ name, deadline, text, availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"], durationMins: 60, priorExp }); }}
        style={{ width: "100%", padding: "12px", background: (!name || !text) ? "#d1d5db" : "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: "1rem", cursor: (!name || !text) ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Uploading..." : "Build my landscape"}
      </button>
    </div>
  );
}

function PersonaStep({ onSelect }: { onSelect: (p: "socratic" | "example_first") => void }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>How do you like to learn?</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Your tutor will adapt to your preference. You can switch later.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button onClick={() => onSelect("socratic")} style={personaCardStyle}>
          <strong>Socratic</strong>
          <span style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }}>The tutor asks questions to help you discover answers yourself.</span>
        </button>
        <button onClick={() => onSelect("example_first")} style={personaCardStyle}>
          <strong>Example First</strong>
          <span style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }}>Concrete examples before abstract theory. Intuition first.</span>
        </button>
      </div>
    </div>
  );
}

function TrialSessionStep({ subjectId, persona, onComplete }: { subjectId: string; persona: string; onComplete: () => void }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mode] = useState<"teaching" | "recall_check">("teaching");

  useEffect(() => {
    async function init() {
      const ctx = await (client as any).functions.run("build-session-context", {
        topic_id: "trial",
        subject_id: subjectId,
        session_type: "trial",
        persona,
      });
      const conv = await (client as any).conversations.create({
        agent_name: "tutor-agent",
        initial_message: ctx.context,
      });
      setConversationId(conv.id);
    }
    if (subjectId) init().catch(console.error);
  }, [subjectId, persona]);

  if (!conversationId) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div>Starting your trial session...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <ChatWindow conversationId={conversationId} mode={mode} />
      </div>
      <button onClick={onComplete} style={{ marginTop: "1rem", padding: "10px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
        Continue to your landscape →
      </button>
    </div>
  );
}

function LandscapeRevealStep({ subjectId, onDone }: { subjectId: string; onDone: () => void }) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Your learning landscape</h1>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Here's how your material breaks down. Click any topic to adjust.</p>
      <LandscapeGraph subjectId={subjectId} onTopicClick={() => {}} />
      <button onClick={onDone} style={{ marginTop: "1.5rem", padding: "12px 32px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "1rem" }}>
        Start learning →
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", border: "1px solid #d1d5db",
  borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box",
};

const personaCardStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "flex-start",
  padding: "1.25rem", background: "#fff", border: "2px solid #e5e7eb",
  borderRadius: 10, cursor: "pointer", textAlign: "left",
};
