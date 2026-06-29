import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { client } from "../lib/client";
import LandscapeGraph from "../components/LandscapeGraph";
import InformedConsequenceModal from "../components/InformedConsequenceModal";

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<any>(null);
  const [pendingTopicId, setPendingTopicId] = useState<string | null>(null);
  const [pendingTopicName, setPendingTopicName] = useState("");
  const [unmetPrereqs, setUnmetPrereqs] = useState<string[]>([]);
  const [prereqShown, setPrereqShown] = useState(false);
  const [graphKey, setGraphKey] = useState(0);

  useEffect(() => {
    if (id) client.records.get("subjects", id).then(setSubject).catch(() => {});
  }, [id]);

  async function deleteSubject() {
    if (!confirm("Delete this subject and all its topics? This cannot be undone.")) return;
    await client.records.delete("subjects", id!);
    navigate("/learning", { replace: true });
  }

  async function handleTopicDelete(topicId: string) {
    if (!confirm("Delete this topic?")) return;
    await client.records.delete("topics", topicId);
    setGraphKey(k => k + 1); // force LandscapeGraph to reload
  }

  async function handleTopicClick(topicId: string, topicName: string) {
    if (prereqShown) {
      navigate(`/subjects/${id}/session?topic=${topicId}`);
      return;
    }
    try {
      const result = await client.functions.run("check-prerequisites", { input: { topic_id: topicId } });
      const data = (result as any).output_data ?? result;
      if (!data.all_met) {
        setPendingTopicId(topicId);
        setPendingTopicName(topicName);
        setUnmetPrereqs(data.unmet);
        setPrereqShown(true);
      } else {
        navigate(`/subjects/${id}/session?topic=${topicId}`);
      }
    } catch {
      navigate(`/subjects/${id}/session?topic=${topicId}`);
    }
  }

  return (
    <div style={{ padding: "var(--space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-24)", fontWeight: "var(--weight-display-bold)", color: "var(--color-text-primary)", margin: 0 }}>
          {subject?.name ?? "Subject"}
        </h1>
        <button onClick={deleteSubject} style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "var(--space-1) var(--space-3)", color: "var(--color-text-tertiary)", cursor: "pointer", fontSize: "var(--text-13)", fontFamily: "var(--font-body)" }}>
          Delete subject
        </button>
      </div>
      <LandscapeGraph key={graphKey} subjectId={id!} onTopicClick={handleTopicClick} onTopicDelete={handleTopicDelete} />
      {pendingTopicId && (
        <InformedConsequenceModal
          topicName={pendingTopicName}
          unmetPrereqs={unmetPrereqs}
          onProceed={() => {
            setPendingTopicId(null);
            navigate(`/subjects/${id}/session?topic=${pendingTopicId}`);
          }}
          onCancel={() => setPendingTopicId(null)}
        />
      )}
    </div>
  );
}
