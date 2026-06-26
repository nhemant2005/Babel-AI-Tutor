import ReactFlow, { type Node, type Edge, Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import TopicNode from "./TopicNode";
import { useEffect, useState } from "react";
import { client } from "../lib/client";

const nodeTypes = { topic: TopicNode };

interface LandscapeGraphProps {
  subjectId: string;
  onTopicClick: (topicId: string, topicName: string) => void;
}

export default function LandscapeGraph({ subjectId, onTopicClick }: LandscapeGraphProps) {
  const [topics, setTopics] = useState<any[]>([]);
  const [learnerModel, setLearnerModel] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [t, lm] = await Promise.all([
        (client as any).records.list("topics", {
          filter: [{ field: "subject_id", op: "eq", value: subjectId }],
          limit: 100,
        }),
        (client as any).records.list("learner_model", {
          filter: [{ field: "subject_id", op: "eq", value: subjectId }],
          limit: 100,
        }),
      ]);
      setTopics(t?.items ?? []);
      setLearnerModel(lm?.items ?? []);
    }
    if (subjectId) load();
  }, [subjectId]);

  const lmByTopic = Object.fromEntries(learnerModel.map((lm: any) => [lm.topic_id, lm]));

  const nodes: Node[] = topics.map((topic: any, i: number) => ({
    id: topic.id,
    type: "topic",
    position: { x: ((topic.depth_rank ?? 1) - 1) * 220, y: i * 90 },
    data: {
      label: topic.name,
      completion_status: lmByTopic[topic.id]?.completion_status ?? "not_started",
      onClick: (id: string) => onTopicClick(id, topic.name),
    },
  }));

  const edges: Edge[] = topics.flatMap((topic: any) =>
    (topic.dependency_ids ?? []).map((depId: string, i: number) => ({
      id: `${depId}-${topic.id}-${i}`,
      source: depId,
      target: topic.id,
      type: "smoothstep",
    }))
  );

  return (
    <div style={{ height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
