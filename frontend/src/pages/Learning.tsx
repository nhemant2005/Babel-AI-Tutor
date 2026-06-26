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
    <div style={{ padding: "var(--space-8)" }}>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-28)",
        fontWeight: "var(--weight-display-bold)",
        color: "var(--color-text-primary)",
        marginBottom: "var(--space-6)",
      }}>
        Learning
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {subjects.map((s: any) => (
          <Link
            key={s.id}
            to={`/subjects/${s.id}`}
            style={{
              display: "block",
              padding: "var(--space-4) var(--space-5)",
              background: "var(--color-bg-surface)",
              borderLeft: `4px solid ${s.color ?? "var(--color-accent)"}`,
              borderTop: "1px solid var(--color-border)",
              borderRight: "1px solid var(--color-border)",
              borderBottom: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              transition: "border-color 150ms var(--ease-out)",
            }}
          >
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-16)",
              fontWeight: "var(--weight-display-medium)",
              color: "var(--color-text-primary)",
              margin: 0,
            }}>
              {s.name}
            </h2>
            {s.deadline && (
              <p style={{ marginTop: "var(--space-1)", fontSize: "var(--text-13)", color: "var(--color-text-tertiary)" }}>
                Due: {s.deadline}
              </p>
            )}
          </Link>
        ))}
      </div>
      <Link
        to="/onboarding"
        className="btn-ghost"
        style={{ display: "inline-flex", marginTop: "var(--space-6)" }}
      >
        + Add subject
      </Link>
    </div>
  );
}
