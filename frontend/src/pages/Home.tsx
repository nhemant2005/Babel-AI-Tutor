import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../lib/client";

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const [todaysPlan, setTodaysPlan] = useState<any[]>([]);
  const [topics, setTopics] = useState<Record<string, any>>({});

  useEffect(() => {
    async function load() {
      const plan = await client.records.list("plan", {
        filters: [
          { field: "scheduled_date", op: "eq", value: today },
          { field: "status", op: "eq", value: "scheduled" },
        ],
        limit: 10,
      });
      const items = plan?.items ?? [];
      setTodaysPlan(items);

      if (items.length) {
        const topicMap: Record<string, any> = {};
        await Promise.all(items.map(async (item: any) => {
          topicMap[item.topic_id] = await client.records.get("topics", item.topic_id);
        }));
        setTopics(topicMap);
      }
    }
    load().catch(() => {});
  }, [today]);

  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-28)",
        fontWeight: "var(--weight-display-bold)",
        color: "var(--color-text-primary)",
        marginBottom: "var(--space-6)",
      }}>
        Today
      </h1>
      {!todaysPlan.length ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-15)" }}>
          Nothing scheduled for today.
        </p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {todaysPlan.map((item: any) => (
            <li key={item.id}>
              <Link
                to={`/subjects/${item.subject_id}/session?topic=${item.topic_id}`}
                className="glass"
                style={{
                  display: "block",
                  padding: "var(--space-4) var(--space-5)",
                  borderRadius: "var(--radius-md)",
                  transition: "border-color 150ms var(--ease-out)",
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-15)", fontWeight: "var(--weight-display-medium)", color: "var(--color-text-primary)" }}>
                  {topics[item.topic_id]?.name ?? item.topic_id}
                </div>
                <div style={{ fontSize: "var(--text-13)", color: "var(--color-text-tertiary)", marginTop: "var(--space-1)" }}>
                  {item.duration_mins} min
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
