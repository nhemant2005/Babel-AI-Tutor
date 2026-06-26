import { useState, useEffect, useRef } from "react";
import { client } from "../lib/client";

interface Message { id: string; role: "user" | "assistant"; content: string; }

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
      const msgs = await (client as any).conversations.listMessages(conversationId);
      setMessages(msgs ?? []);
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
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: text }]);
    try {
      const reply = await (client as any).conversations.send(conversationId, text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: reply.content ?? reply }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid #e5e7eb", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {mode === "teaching" ? "Teaching" : "Recall Check"}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {messages.map(m => (
          <div key={m.id} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "#4f46e5" : "#f3f4f6",
            color: m.role === "user" ? "#fff" : "#111827",
            borderRadius: 10, padding: "8px 14px", maxWidth: "80%", fontSize: 14,
          }}>
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: "flex-start", background: "#f3f4f6", borderRadius: 10, padding: "8px 14px", color: "#9ca3af", fontSize: 14 }}>
            ...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 1rem", borderTop: "1px solid #e5e7eb" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type your answer..."
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, outline: "none" }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
