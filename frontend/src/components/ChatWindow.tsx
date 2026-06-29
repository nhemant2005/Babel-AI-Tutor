import { useState, useEffect, useRef } from "react";
import { client } from "../lib/client";

interface Message { id: string; role: string; text: string; }

interface Props {
  conversationId: string;
  mode: "teaching" | "recall_check";
}

export default function ChatWindow({ conversationId, mode }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;

    async function load() {
      // Poll until the agent sends its first message (handles tutor-initiated sessions)
      for (let i = 0; i < 30; i++) {
        const result = await client.conversations.messages.list(conversationId);
        const items = (result.items ?? []) as unknown as Message[];
        if (cancelled) return;
        setMessages(items);
        // Stop polling once we have an agent message
        if (items.some(m => m.role !== "user")) break;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    load().catch(console.error);
    return () => { cancelled = true; };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    setIsLoading(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text }]);
    try {
      await client.conversations.messages.send(conversationId, { content: text });
      // Poll until agent reply appears (agent responds async)
      const before = messages.length + 1; // +1 for the user message we just added
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const result = await client.conversations.messages.list(conversationId);
        const items = (result.items ?? []) as unknown as Message[];
        if (items.length > before) {
          setMessages(items);
          break;
        }
        setMessages(items);
      }
    } finally {
      setIsLoading(false);
    }
  }

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
        {messages.filter(m => !m.text?.startsWith("__SYSTEM__:")).map(m => (
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
        {isLoading && (
          <div style={{
            alignSelf: "flex-start",
            background: "var(--color-bg-elevated)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-4)",
            color: "var(--color-text-tertiary)",
            fontSize: "var(--text-14)",
          }}>
            ...
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
          placeholder="Type your answer..."
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
          }}
        />
        <button onClick={handleSend} disabled={isLoading} className="btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}
