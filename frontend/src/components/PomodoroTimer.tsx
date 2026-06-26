import { useEffect, useState } from "react";
import { client } from "../lib/client";

const WORK_MINS = 25;
const BREAK_MINS = 5;

export default function PomodoroTimer({ sessionId }: { sessionId: string }) {
  const [phase, setPhase] = useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINS * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s > 1) return s - 1;
        if (phase === "work") {
          (client as any).functions.run("update-pomodoro", { action: "complete_cycle", session_id: sessionId }).catch(() => {});
          setPhase("break");
          return BREAK_MINS * 60;
        } else {
          setPhase("work");
          return WORK_MINS * 60;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, phase, sessionId]);

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const secs = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div style={{ textAlign: "center", padding: "1.5rem" }}>
      <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
        {phase === "work" ? "Focus" : "Break"}
      </div>
      <div style={{ fontSize: "3rem", fontWeight: 700, fontFamily: "monospace", color: "#111827", marginBottom: "1rem" }}>
        {mins}:{secs}
      </div>
      <button
        onClick={() => setRunning(r => !r)}
        style={{ padding: "8px 24px", background: running ? "#ef4444" : "#4f46e5", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
      >
        {running ? "Pause" : "Start"}
      </button>
    </div>
  );
}
