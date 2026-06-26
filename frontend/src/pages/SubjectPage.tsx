import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { client } from "../lib/client";
import LandscapeGraph from "../components/LandscapeGraph";
import InformedConsequenceModal from "../components/InformedConsequenceModal";

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pendingTopicId, setPendingTopicId] = useState<string | null>(null);
  const [pendingTopicName, setPendingTopicName] = useState("");
  const [unmetPrereqs, setUnmetPrereqs] = useState<string[]>([]);
  const [prereqShown, setPrereqShown] = useState(false);

  async function handleTopicClick(topicId: string, topicName: string) {
    if (prereqShown) {
      // Already shown once — navigate directly
      navigate(`/subjects/${id}/session?topic=${topicId}`);
      return;
    }
    try {
      const result = await (client as any).functions.run("check-prerequisites", { topic_id: topicId });
      if (!result.all_met) {
        setPendingTopicId(topicId);
        setPendingTopicName(topicName);
        setUnmetPrereqs(result.unmet);
        setPrereqShown(true);
      } else {
        navigate(`/subjects/${id}/session?topic=${topicId}`);
      }
    } catch {
      navigate(`/subjects/${id}/session?topic=${topicId}`);
    }
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <LandscapeGraph subjectId={id!} onTopicClick={handleTopicClick} />
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
