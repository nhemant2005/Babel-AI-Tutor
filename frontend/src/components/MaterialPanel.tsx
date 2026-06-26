import { useEffect, useState } from "react";
import { client } from "../lib/client";

interface Props { subjectId: string; topicId: string; }

export default function MaterialPanel({ subjectId, topicId }: Props) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const path = `/subjects/${subjectId}/deep-processing/${topicId}.md`;
    client.files.download(path)
      .then(blob => blob.text())
      .then(setContent)
      .catch(() => setContent("Material not yet processed. It will be ready after your first session on this topic."));
  }, [subjectId, topicId]);

  return (
    <div style={{ padding: "var(--space-4)", height: "100%", overflowY: "auto" }}>
      <div style={{
        fontSize: "var(--text-11)",
        fontFamily: "var(--font-body)",
        fontWeight: "var(--weight-body-medium)",
        color: "var(--color-text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "var(--space-4)",
      }}>
        Material
      </div>
      <pre style={{
        whiteSpace: "pre-wrap",
        fontSize: "var(--text-13)",
        fontFamily: "var(--font-body)",
        color: "var(--color-text-secondary)",
        lineHeight: 1.7,
        margin: 0,
      }}>
        {content ?? "Loading..."}
      </pre>
    </div>
  );
}
