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
    () => localStorage.getItem("onboarding_subject_id")
  );
  const [persona, setPersona] = useState<"socratic" | "example_first">("socratic");
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const { subject, createRecord, refresh } = useSubject(subjectId);

  useEffect(() => {
    if (subjectId) {
      localStorage.setItem("onboarding_subject_id", subjectId);
      refresh(); // fetch subject state on mount / subjectId change
    }
  }, [subjectId]);

  // If subject already active, skip onboarding
  useEffect(() => {
    if (subject?.status === "active") navigate("/learning");
  }, [subject?.status]);

  useEffect(() => {
    if (subject?.status !== "processing") return;
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [subject?.status, refresh]);

  if (step === "upload") return (
    <UploadStep
      processing={subject?.status === "processing"}
      stage={stage}
      error={error}
      onReset={() => { setSubjectId(null); setError(null); setStage(null); localStorage.removeItem("onboarding_subject_id"); }}
      onSubmit={async ({ name, deadline, text, files, availableDays, durationMins, priorExp }) => {
        setError(null);
        setStage("creating");
        let s: any;
        try {
          s = await createRecord({
            name, deadline: deadline || undefined, status: "processing",
            available_days: availableDays,
            duration_per_day_mins: durationMins,
            prior_experience: priorExp,
          });
        } catch (err) {
          console.error("Failed to create subject:", err);
          setError("Could not create subject. Check your connection and try again.");
          return;
        }
        setSubjectId(s.id);

        try {
          const rawFolder = `/subjects/${s.id}/raw`;
          setStage("uploading");
          try { await client.files.folder.create("raw", { directoryPath: `/subjects/${s.id}/` }); } catch { /* may already exist */ }

          // Upload all files in parallel (#4 fix)
          await Promise.all(files.map(f => client.files.upload(f.file, {
            name: f.name,
            directoryPath: rawFolder,
          })));

          // If user pasted text with no file, save it as a plain text file
          if (text.trim() && files.length === 0) {
            const blob = new Blob([text], { type: "text/plain" });
            await client.files.upload(blob as File, {
              name: "pasted-material.txt",
              directoryPath: rawFolder,
            });
          }

          setStage("processing");
          // Fire ingest agent — pass only the path, NOT the file content (avoids huge request body)
          const conv = await client.conversations.create({
            agent_name: "ingest-agent",
            instructions: `Mode: structural\nSubject ID: ${s.id}\nFiles are at: ${rawFolder}/\n\nDo your structural pass now.`,
          });
          await client.conversations.messages.send(conv.id, { content: `Process the material for subject ${s.id}. Identify topics, write source notes, and create rows in the topics table.` });
          navigate("/onboarding/persona");
        } catch (err) {
          console.error("Onboarding failed:", err);
          setError("Upload or processing failed. Check the browser console for details.");
        }
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
      onDone={() => { localStorage.removeItem("onboarding_subject_id"); navigate("/home"); }}
    />
  );

  return null;
}


function UploadStep({ onSubmit, processing, stage, error, onReset }: {
  onSubmit: (d: { name: string; deadline: string; text: string; files: FileItem[]; availableDays: string[]; durationMins: number; priorExp: string }) => Promise<void>;
  processing: boolean;
  stage: string | null;
  error: string | null;
  onReset: () => void;
}) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [text, setText] = useState("");
  const [priorExp, setPriorExp] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name && (text.length > 0 || files.length > 0);

  const stages = [
    { key: "creating",    label: "Creating subject..." },
    { key: "uploading",   label: "Uploading files..." },
    { key: "processing",  label: "Analysing material..." },
  ];
  const currentIdx = stages.findIndex(s => s.key === stage);
  const progressPct = stage ? ((currentIdx + 1) / stages.length) * 100 : 0;

  if (processing) return (
    <div style={centerScreen}>
      {error ? (
        <>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-20)", fontWeight: "var(--weight-display-bold)", color: "var(--color-destructive)", marginBottom: "var(--space-3)" }}>
            Something went wrong
          </p>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-14)", marginBottom: "var(--space-6)", maxWidth: 400, textAlign: "center" }}>
            {error}
          </p>
          <button onClick={onReset} className="btn-secondary">
            Try again
          </button>
        </>
      ) : (
        <div style={{ width: 360, textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-20)", fontWeight: "var(--weight-display-bold)", color: "var(--color-text-primary)", marginBottom: "var(--space-6)" }}>
            Processing your material
          </p>

          {/* Progress bar */}
          <div style={{
            height: 4,
            background: "var(--color-bg-elevated)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
            marginBottom: "var(--space-6)",
          }}>
            <div style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "var(--color-accent)",
              borderRadius: "var(--radius-full)",
              transition: "width 600ms var(--ease-settle)",
              boxShadow: "0 0 12px var(--color-accent-glow)",
            }} />
          </div>

          {/* Stage labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", textAlign: "left" }}>
            {stages.map((s, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              const pending = i > currentIdx;
              return (
                <div key={s.key} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  opacity: pending ? 0.35 : 1,
                  transition: "opacity 400ms var(--ease-out)",
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "var(--radius-full)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--text-11)", flexShrink: 0,
                    background: done ? "var(--color-success)" : active ? "var(--color-accent)" : "var(--color-bg-elevated)",
                    border: active ? "none" : "1px solid var(--color-border)",
                    color: done || active ? "#fff" : "var(--color-text-tertiary)",
                    fontWeight: "var(--weight-body-bold)",
                    transition: "background 400ms var(--ease-out), border-color 400ms var(--ease-out)",
                  }}>
                    {done ? "\u2713" : active ?
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", animation: "pulse 1s ease-in-out infinite" }} /> :
                      i + 1}
                  </span>
                  <span style={{
                    fontSize: "var(--text-13)",
                    color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    fontWeight: active ? "var(--weight-body-medium)" : "var(--weight-body-regular)",
                    transition: "color 400ms var(--ease-out)",
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-17)", fontWeight: "var(--weight-display-medium)", color: "var(--color-accent-text)", marginTop: "var(--space-8)", fontStyle: "italic" }}>
            This won't take long
          </p>
        </div>
      )}
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
          await onSubmit({ name, deadline, text, files, availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"], durationMins: 60, priorExp });
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
      // Fetch context and create conversation in parallel (#1 fix)
      const [ctx, conv] = await Promise.all([
        client.functions.run("build-session-context", { input: {
          topic_id: "trial",
          subject_id: subjectId,
          session_type: "trial",
          persona,
        }}).catch(() => ({ context: "" })),
        client.conversations.create({ agent_name: "tutor-agent", instructions: "" }),
      ]);
      // Update instructions now that we have context — send as first message since create is already done
      const rawCtx: string = (ctx as any).context ?? "";
      const ctxTrunc = rawCtx.length > 12000 ? rawCtx.slice(0, 12000) + "\n\n[context truncated]" : rawCtx;
      await client.conversations.messages.send(conv.id, {
        content: `__SYSTEM__: ${ctxTrunc}\n\nBegin the trial session now. Orient the student with the material, then engage them, then end with something that makes them want to learn more. You speak first.`,
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
