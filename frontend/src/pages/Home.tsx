import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../lib/client";

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const [todaysPlan, setTodaysPlan] = useState<any[]>([]);
  const [topics, setTopics] = useState<Record<string, any>>({});

  useEffect(() => {
    async function load() {
      const plan = await (client as any).records.list("plan", {
        filter: [
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
          topicMap[item.topic_id] = await (client as any).records.get("topics", item.topic_id);
        }));
        setTopics(topicMap);
      }
    }
    load().catch(() => {});
  }, [today]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ margin: "0 0 1.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Today</h1>
      {!todaysPlan.length ? (
        <p style={{ color: "#6b7280" }}>Nothing scheduled for today.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {todaysPlan.map((item: any) => (
            <li key={item.id}>
              <Link
                to={`/subjects/${item.subject_id}/session?topic=${item.topic_id}`}
                style={{
                  display: "block", padding: "1rem 1.25rem", background: "#fff",
                  border: "1px solid #e5e7eb", borderRadius: 8, textDecoration: "none",
                  color: "#111827",
                }}
              >
                <div style={{ fontWeight: 600 }}>{topics[item.topic_id]?.name ?? item.topic_id}</div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: 4 }}>{item.duration_mins} min</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
