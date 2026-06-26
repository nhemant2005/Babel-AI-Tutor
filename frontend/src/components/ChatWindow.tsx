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
    async function load() {
      const result = await client.conversations.messages.list(conversationId);
      setMessages((result.items ?? []) as unknown as Message[]);
    }
    if (conversationId) load();
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
      const result = await client.conversations.messages.list(conversationId);
      setMessages((result.items ?? []) as unknown as Message[]);
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
        {messages.map(m => (
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
