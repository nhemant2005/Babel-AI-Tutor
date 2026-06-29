import { useState, useEffect, useRef } from "react";
import { client } from "../lib/client";

interface Message { id: string; role: string; text: string; }

interface Props {
  conversationId: string;
  mode: "teaching" | "recall_check";
}

async function pollUntilNew(conversationId: string, knownCount: number, maxTries = 25): Promise<Message[]> {
  // Check immediately first, then back off (#3 fix)
  for (let i = 0; i < maxTries; i++) {
    const result = await client.conversations.messages.list(conversationId);
    const items = (result.items ?? []) as unknown as Message[];
    if (items.length > knownCount) return items;
    await new Promise(r => setTimeout(r, i === 0 ? 500 : 2000)); // fast first retry, then 2s
  }
  return [];
}

export default function ChatWindow({ conversationId, mode }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false); // agent is thinking
  const bottomRef = useRef<HTMLDivElement>(null);

  // On mount: wait for agent's first message (tutor-initiated sessions)
  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    setIsWaiting(true);

    (async () => {
      const items = await pollUntilNew(conversationId, 0);
      if (!cancelled) { setMessages(items); setIsWaiting(false); }
    })().catch(() => setIsWaiting(false));

    return () => { cancelled = true; };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  async function handleSend() {
    if (!input.trim() || isWaiting) return;
    const text = input.trim();
    setInput("");

    // Optimistic: add user message immediately
    const optimisticMsg: Message = { id: `opt-${Date.now()}`, role: "user", text };
    setMessages(prev => [...prev, optimisticMsg]);
    setIsWaiting(true);

    try {
      await client.conversations.messages.send(conversationId, { content: text });
      // knownCount = current messages + 1 for the one we just sent (#10 fix — use value, not stale closure)
      const serverMessages = await pollUntilNew(conversationId, messages.length + 1);
      if (serverMessages.length) setMessages(serverMessages);
    } finally {
      setIsWaiting(false);
    }
  }

  const visible = messages.filter(m => !m.text?.startsWith("__SYSTEM__:"));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--color-bg-base)" }}>
      <div style={{
        padding: "var(--space-2) var(--space-4)",
        borderBottom: "1px solid var(--color-border)",
        fontSize: "var(--text-11)",
        fontFamily: "var(--font-body)",
        fontWeight: "var(--weight-body-medium)",
        color: "var(--color-text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        {mode === "teaching" ? "Teaching" : "Recall Check"}
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}>
        {visible.map(m => (
          <div key={m.id} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "var(--color-accent)" : "var(--color-bg-elevated)",
            color: m.role === "user" ? "var(--raw-silver-pale)" : "var(--color-text-primary)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-4)",
            maxWidth: "80%",
            fontSize: "var(--text-14)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.6,
          }}>
            {m.text}
          </div>
        ))}

        {isWaiting && (
          <div style={{
            alignSelf: "flex-start",
            background: "var(--color-bg-elevated)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-4)",
            display: "flex",
            gap: 4,
            alignItems: "center",
          }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--color-text-tertiary)",
                display: "inline-block",
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        display: "flex",
        gap: "var(--space-2)",
        padding: "var(--space-3) var(--space-4)",
        borderTop: "1px solid var(--color-border)",
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={isWaiting ? "Tutor is thinking…" : "Type your answer…"}
          disabled={isWaiting}
          style={{
            flex: 1,
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--text-14)",
            color: "var(--color-text-primary)",
            background: "var(--color-bg-elevated)",
            outline: "none",
            fontFamily: "var(--font-body)",
            opacity: isWaiting ? 0.5 : 1,
          }}
        />
        <button onClick={handleSend} disabled={isWaiting} className="btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}
