import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { client } from "../lib/client";

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await client.records.list("notifications", {
          filters: [{ field: "read", op: "eq", value: false }],
          limit: 50,
        });
        setUnread(res?.items?.length ?? 0);
      } catch { /* table may not exist during dev */ }
    }
    fetch();
    const t = setInterval(fetch, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <button
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--radius-sm)",
        background: hovered ? "var(--color-bg-subtle)" : "transparent",
        border: "none",
        color: hovered ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
        transition: "color 150ms var(--ease-out), background 150ms var(--ease-out)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Bell size={18} strokeWidth={1.5} />
      {unread > 0 && (
        <span style={{
          position: "absolute",
          top: 4, right: 4,
          width: 16, height: 16,
          borderRadius: "var(--radius-full)",
          background: "var(--color-accent)",
          color: "var(--raw-silver-pale)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-10)",
          fontWeight: "var(--weight-body-bold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}
