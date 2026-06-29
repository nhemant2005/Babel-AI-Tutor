import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { client } from "../lib/client";
import ChatWindow from "../components/ChatWindow";
import MaterialPanel from "../components/MaterialPanel";
import PomodoroTimer from "../components/PomodoroTimer";
import { useSession } from "../hooks/useSession";

export default function StudySession() {
  const { id: subjectId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get("topic") ?? "";
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mode] = useState<"teaching" | "recall_check">("teaching");

  const { startSession } = useSession();

  useEffect(() => {
    async function init() {
      const sid = await startSession(topicId, subjectId!);
      setSessionId(sid);

      const ctx = await client.functions.run("build-session-context", { input: {
        topic_id: topicId,
        subject_id: subjectId,
        session_type: "return",
      }});

      // Cap instructions to avoid exceeding Lemma's request body limit
      const rawCtx: string = (ctx as any).context ?? "";
      const instructions = rawCtx.length > 12000 ? rawCtx.slice(0, 12000) + "\n\n[context truncated]" : rawCtx;

      const conv = await client.conversations.create({
        agent_name: "tutor-agent",
        instructions,
      });
      // Tutor always speaks first
      await client.conversations.messages.send(conv.id, {
        content: "__SYSTEM__: Begin the session. Start with a brief recall check on prior sessions if any, then move into today's topic.",
      });
      setConversationId(conv.id);
    }
    init().catch(console.error);
  }, []);

  async function handleExit(exitType: "natural" | "abandoned") {
    if (!sessionId || !conversationId) return;
    try {
      const result = await client.conversations.messages.list(conversationId);
      const transcript = (result.items ?? []).map((m: any) => `${m.role}: ${m.text}`).join("\n");
      // Upload transcript to file storage — never send full conversation inline (body size limit)
      const transcriptBlob = new Blob([transcript], { type: "text/plain" });
      const transcriptPath = `/subjects/${subjectId}/sessions/${sessionId}/transcript.txt`;
      try {
        await client.files.folder.create(sessionId!, { directoryPath: `/subjects/${subjectId}/sessions/` });
      } catch { /* folder may already exist */ }
      await client.files.upload(transcriptBlob as File, { name: "transcript.txt", directoryPath: `/subjects/${subjectId}/sessions/${sessionId}/` });
      const conv = await client.conversations.create({ agent_name: "note-banker-agent" });
      await client.conversations.messages.send(conv.id, {
        content: `session_id: ${sessionId}\ntopic_id: ${topicId}\nsubject_id: ${subjectId}\nexit_type: ${exitType}\ntranscript_path: ${transcriptPath}`,
      });
    } catch {
      // Don't block navigation on banking failure
    }
    navigate(`/subjects/${subjectId}`);
  }

  if (!conversationId || !sessionId) {
    return (
      <div style={centerScreen}>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-15)" }}>
          Starting session...
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--color-bg-base)" }}>
      <div style={{ width: 280, borderRight: "1px solid var(--color-border)", flexShrink: 0, overflowY: "auto" }}>
        <MaterialPanel subjectId={subjectId!} topicId={topicId} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <ChatWindow conversationId={conversationId} mode={mode} />
      </div>

      <div style={{ width: 220, borderLeft: "1px solid var(--color-border)", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <PomodoroTimer sessionId={sessionId} />
        <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "auto" }}>
          <button onClick={() => handleExit("natural")} className="btn-primary">
            End Session
          </button>
          <button onClick={() => handleExit("abandoned")} className="btn-ghost">
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

const centerScreen: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  background: "var(--color-bg-base)",
};
