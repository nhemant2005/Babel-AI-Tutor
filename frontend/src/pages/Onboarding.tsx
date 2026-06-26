import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubject } from "../hooks/useSubject";
import { client } from "../lib/client";
import ChatWindow from "../components/ChatWindow";
import LandscapeGraph from "../components/LandscapeGraph";
import DragDropZone, { FileList } from "../components/DragDropZone";

interface FileItem {
  name: string;
  size: number;
  file: File;
}

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

  useEffect(() => {
    if (subject?.status !== "processing") return;
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [subject?.status, refresh]);

  if (step === "upload") return (
    <UploadStep
      processing={subject?.status === "processing"}
      onSubmit={async ({ name, deadline, text, files, availableDays, durationMins, priorExp }) => {
        const s = await createRecord({
          name, deadline: deadline || undefined, status: "processing",
          available_days: availableDays,
          duration_per_day_mins: durationMins,
          prior_experience: priorExp,
        });
        setSubjectId(s.id);

        // Upload files to Lemma storage
        const rawFolder = `/subjects/${s.id}/raw`;
        if (files.length > 0) {
          for (const f of files) {
            await (client as any).files.upload(f.file, {
              name: f.name,
              directoryPath: rawFolder,
            });
          }
        }

        await (client as any).workflows.run("onboarding", {
          subject_id: s.id,
          material_content: text,
          raw_folder: files.length > 0 ? rawFolder : undefined,
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
  onSubmit: (d: { name: string; deadline: string; text: string; files: FileItem[]; availableDays: string[]; durationMins: number; priorExp: string }) => Promise<void>;
  processing: boolean;
}) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [text, setText] = useState("");
  const [priorExp, setPriorExp] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name && (text.length > 0 || files.length > 0);

  // Read text-based files into the text content
  async function readFileText(f: FileItem): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve("");
      reader.readAsText(f.file);
    });
  }

  if (processing) return (
    <div style={centerScreen}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-24)", fontWeight: "var(--weight-display-bold)", color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
        Processing your material...
      </p>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-15)" }}>
        Identifying topics and building your landscape
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "var(--space-12) var(--space-6)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-32)", fontWeight: "var(--weight-display-bold)", color: "var(--color-text-primary)", lineHeight: 1.15, marginBottom: "var(--space-2)" }}>
        What are you studying?
      </h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-15)", marginBottom: "var(--space-8)" }}>
        Upload your material and we'll build a learning landscape for you.
      </p>

      <label style={labelStyle}>
        <span style={labelTextStyle}>Subject name</span>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Organic Chemistry" style={inputStyle} />
      </label>

      <label style={labelStyle}>
        <span style={labelTextStyle}>Exam / deadline (optional)</span>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inputStyle} />
      </label>

      <label style={labelStyle}>
        <span style={labelTextStyle}>Prior experience (optional)</span>
        <input value={priorExp} onChange={e => setPriorExp(e.target.value)} placeholder="e.g. I've done high school chemistry" style={inputStyle} />
      </label>

      <DragDropZone onFilesChange={setFiles} />
      <FileList files={files} onRemove={(i) => setFiles(prev => prev.filter((_, idx) => idx !== i))} />

      <label style={{ display: "block", marginBottom: "var(--space-6)" }}>
        <span style={labelTextStyle}>Or paste text (optional)</span>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste notes, textbook excerpts, or paste text from a PDF..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
      </label>

      <button
        disabled={!canSubmit || submitting}
        onClick={async () => {
          setSubmitting(true);
          // Read text-based file contents and merge with textarea
          let mergedText = text;
          for (const f of files) {
            const content = await readFileText(f);
            if (content.trim()) mergedText += `\n\n--- ${f.name} ---\n\n${content}`;
          }
          await onSubmit({ name, deadline, text: mergedText, files, availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"], durationMins: 60, priorExp });
        }}
        className="btn-primary"
        style={{ width: "100%", opacity: canSubmit ? 1 : 0.4 }}
      >
        {submitting ? "Uploading..." : "Build my landscape"}
      </button>
    </div>
  );
}

function PersonaStep({ onSelect }: { onSelect: (p: "socratic" | "example_first") => void }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "var(--space-12) var(--space-6)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-32)", fontWeight: "var(--weight-display-bold)", color: "var(--color-text-primary)", lineHeight: 1.15, marginBottom: "var(--space-2)" }}>
        How do you like to learn?
      </h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-15)", marginBottom: "var(--space-8)" }}>
        Your tutor will adapt to your preference. You can switch later.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <button onClick={() => onSelect("socratic")} className="glass" style={personaCardStyle}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-17)", fontWeight: "var(--weight-display-bold)", color: "var(--color-text-primary)" }}>Socratic</span>
          <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-14)", marginTop: "var(--space-1)" }}>The tutor asks questions to help you discover answers yourself.</span>
        </button>
        <button onClick={() => onSelect("example_first")} className="glass" style={personaCardStyle}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-17)", fontWeight: "var(--weight-display-bold)", color: "var(--color-text-primary)" }}>Example First</span>
          <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-14)", marginTop: "var(--space-1)" }}>Concrete examples before abstract theory. Intuition first.</span>
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
    <div style={centerScreen}>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-15)" }}>
        Starting your trial session...
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "var(--space-8)", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <ChatWindow conversationId={conversationId} mode={mode} />
      </div>
      <button onClick={onComplete} className="btn-primary" style={{ marginTop: "var(--space-4)" }}>
        Continue to your landscape &rarr;
      </button>
    </div>
  );
}

function LandscapeRevealStep({ subjectId, onDone }: { subjectId: string; onDone: () => void }) {
  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-32)", fontWeight: "var(--weight-display-bold)", color: "var(--color-text-primary)", lineHeight: 1.15, marginBottom: "var(--space-2)" }}>
        Your learning landscape
      </h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-15)", marginBottom: "var(--space-6)" }}>
        Here's how your material breaks down. Click any topic to adjust.
      </p>
      <LandscapeGraph subjectId={subjectId} onTopicClick={() => {}} />
      <button onClick={onDone} className="btn-primary" style={{ marginTop: "var(--space-6)" }}>
        Start learning &rarr;
      </button>
    </div>
  );
}

const centerScreen: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "var(--space-5)",
};

const labelTextStyle: React.CSSProperties = {
  fontSize: "var(--text-13)",
  fontWeight: "var(--weight-body-medium)",
  display: "block",
  marginBottom: "var(--space-1)",
  color: "var(--color-text-secondary)",
  fontFamily: "var(--font-body)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "var(--space-2) var(--space-3)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "var(--text-14)",
  color: "var(--color-text-primary)",
  background: "var(--color-bg-elevated)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font-body)",
  transition: "border-color 150ms var(--ease-out)",
};

const personaCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "var(--space-6)",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  textAlign: "left",
  border: "2px solid transparent",
  width: "100%",
  transition: "border-color 150ms var(--ease-out)",
};
