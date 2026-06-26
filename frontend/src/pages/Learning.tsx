import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../lib/client";

export default function Learning() {
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    (client as any).records.list("subjects", {
      filter: [{ field: "status", op: "eq", value: "active" }],
      limit: 20,
    }).then((r: any) => setSubjects(r?.items ?? [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ margin: "0 0 1.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Learning</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {subjects.map((s: any) => (
          <Link
            key={s.id}
            to={`/subjects/${s.id}`}
            style={{
              display: "block", padding: "1rem 1.25rem", background: "#fff",
              borderLeft: `4px solid ${s.color ?? "#6366f1"}`,
              border: "1px solid #e5e7eb", borderRadius: 8,
              textDecoration: "none", color: "#111827",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{s.name}</h2>
            {s.deadline && <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#6b7280" }}>Due: {s.deadline}</p>}
          </Link>
        ))}
      </div>
      <Link
        to="/onboarding"
        style={{ display: "inline-block", marginTop: "1.5rem", color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}
      >
        + Add subject
      </Link>
    </div>
  );
}
