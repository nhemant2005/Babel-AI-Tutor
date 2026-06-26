import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { client } from "../lib/client";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const result = await (client as any).records.list("notifications", {
          filter: [{ field: "read", op: "eq", value: false }],
          limit: 50,
        });
        setUnreadCount(result?.items?.length ?? 0);
      } catch {
        // table may not exist yet during dev
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <Bell size={20} />
      {unreadCount > 0 && (
        <span style={{
          position: "absolute", top: -6, right: -6,
          background: "#ef4444", color: "#fff", borderRadius: "50%",
          fontSize: 10, width: 16, height: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}
