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
          client.functions.run("update-pomodoro", { input: { action: "complete_cycle", session_id: sessionId } }).catch(() => {});
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
    <div style={{ textAlign: "center", padding: "var(--space-6)" }}>
      <div style={{
        fontSize: "var(--text-11)",
        fontFamily: "var(--font-body)",
        fontWeight: "var(--weight-body-medium)",
        color: "var(--color-text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "var(--space-2)",
      }}>
        {phase === "work" ? "Focus" : "Break"}
      </div>
      <div style={{
        fontSize: "var(--text-48)",
        fontWeight: "var(--weight-body-bold)",
        fontFamily: "var(--font-body)",
        color: "var(--color-text-primary)",
        fontVariantNumeric: "tabular-nums",
        marginBottom: "var(--space-4)",
      }}>
        {mins}:{secs}
      </div>
      <button
        onClick={() => setRunning(r => !r)}
        style={{
          padding: "var(--space-2) var(--space-6)",
          background: running ? "var(--color-destructive)" : "var(--color-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
          fontSize: "var(--text-14)",
          fontFamily: "var(--font-body)",
          fontWeight: "var(--weight-body-medium)",
          transition: "background 150ms var(--ease-out)",
        }}
      >
        {running ? "Pause" : "Start"}
      </button>
    </div>
  );
}
