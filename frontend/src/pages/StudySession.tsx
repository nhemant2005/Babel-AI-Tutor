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

      const ctx = await (client as any).functions.run("build-session-context", {
        topic_id: topicId,
        subject_id: subjectId,
        session_type: "return",
      });

      const conv = await (client as any).conversations.create({
        agent_name: "tutor-agent",
        initial_message: ctx.context,
      });
      setConversationId(conv.id);
    }
    init().catch(console.error);
  }, []);

  async function handleExit(exitType: "natural" | "abandoned") {
    if (!sessionId || !conversationId) return;
    try {
      const messages = await (client as any).conversations.listMessages(conversationId);
      const summary = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
      await (client as any).workflows.run("session-end", {
        session_id: sessionId,
        topic_id: topicId,
        subject_id: subjectId,
        exit_type: exitType,
        conversation_summary: summary,
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
