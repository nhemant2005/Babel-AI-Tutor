import { useEffect, useState } from "react";
import { client } from "../lib/client";

interface Props { subjectId: string; topicId: string; }

export default function MaterialPanel({ subjectId, topicId }: Props) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const path = `/subjects/${subjectId}/deep-processing/${topicId}.md`;
    (client as any).files.read(path)
      .then(setContent)
      .catch(() => setContent("Material not yet processed. It will be ready after your first session on this topic."));
  }, [subjectId, topicId]);

  return (
    <div style={{ padding: "1rem", height: "100%", overflowY: "auto" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "0.875rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Material</h3>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#374151", margin: 0 }}>
        {content ?? "Loading..."}
      </pre>
    </div>
  );
}
