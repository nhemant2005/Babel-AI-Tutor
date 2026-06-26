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
      // Don't block navigation on bankin failure
    }
    navigate(`/subjects/${subjectId}`);
  }

  if (!conversationId || !sessionId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#6b7280" }}>
        Starting session...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left — material panel */}
      <div style={{ width: 280, borderRight: "1px solid #e5e7eb", flexShrink: 0, overflowY: "auto" }}>
        <MaterialPanel subjectId={subjectId!} topicId={topicId} />
      </div>

      {/* Middle — chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <ChatWindow conversationId={conversationId} mode={mode} />
      </div>

      {/* Right — pomodoro + controls */}
      <div style={{ width: 220, borderLeft: "1px solid #e5e7eb", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <PomodoroTimer sessionId={sessionId} />
        <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
          <button onClick={() => handleExit("natural")} style={{ padding: "10px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            End Session
          </button>
          <button onClick={() => handleExit("abandoned")} style={{ padding: "10px", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
