import ReactFlow, { type Node, type Edge, Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import TopicNode from "./TopicNode";
import { useEffect, useState, useMemo } from "react";
import { client } from "../lib/client";

const nodeTypes = { topic: TopicNode };

interface LandscapeGraphProps {
  subjectId: string;
  onTopicClick: (topicId: string, topicName: string) => void;
  onTopicDelete?: (topicId: string) => void;
}

export default function LandscapeGraph({ subjectId, onTopicClick, onTopicDelete }: LandscapeGraphProps) {
  const [topics, setTopics] = useState<any[]>([]);
  const [learnerModel, setLearnerModel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [t, lm] = await Promise.all([
          client.records.list("topics", {
            filters: [{ field: "subject_id", op: "eq", value: subjectId }],
            limit: 100,
          }),
          client.records.list("learner_model", {
            filters: [{ field: "subject_id", op: "eq", value: subjectId }],
            limit: 100,
          }),
        ]);
        setTopics(t?.items ?? []);
        setLearnerModel(lm?.items ?? []);
      } catch (err) {
        console.error("Failed to load landscape:", err);
      } finally {
        setLoading(false);
      }
    }
    if (subjectId) load();
  }, [subjectId]);

  // Memoize nodes + edges so ReactFlow doesn't re-diff on unrelated renders (#8 fix)
  const { nodes, edges } = useMemo(() => {
    const lmByTopic = Object.fromEntries(learnerModel.map((lm: any) => [lm.topic_id, lm]));
    const byRank: Record<number, any[]> = {};
    for (const t of topics) {
      const rank = t.depth_rank ?? 1;
      (byRank[rank] ??= []).push(t);
    }
    const nodes: Node[] = topics.map((topic: any) => {
      const rank = topic.depth_rank ?? 1;
      const siblings = byRank[rank] ?? [];
      const idx = siblings.findIndex((s: any) => s.id === topic.id);
      const totalInRank = siblings.length;
      return {
        id: topic.id,
        type: "topic",
        position: {
          x: (rank - 1) * 240,
          y: (idx - (totalInRank - 1) / 2) * 110,
        },
        data: {
          label: topic.name,
          completion_status: lmByTopic[topic.id]?.completion_status ?? "not_started",
          onClick: (id: string) => onTopicClick(id, topic.name),
          onDelete: onTopicDelete ? (id: string) => onTopicDelete(id) : undefined,
        },
      };
    });
    const edges: Edge[] = topics.flatMap((topic: any) =>
      (topic.dependency_ids ?? []).map((depId: string, i: number) => ({
        id: `${depId}-${topic.id}-${i}`,
        source: depId,
        target: topic.id,
        type: "smoothstep",
        style: { stroke: "var(--color-border)", strokeWidth: 2 },
      }))
    );
    return { nodes, edges };
  }, [topics, learnerModel, onTopicClick, onTopicDelete]);

  if (loading) return (
    <div style={containerStyle}>
      <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)", fontSize: "var(--text-14)" }}>
        Loading landscape…
      </span>
    </div>
  );

  if (!topics.length) return (
    <div style={containerStyle}>
      <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-body)", fontSize: "var(--text-14)" }}>
        No topics yet — the ingest agent is still processing your material.
      </span>
    </div>
  );

  return (
    <div style={{ width: "100%", height: 520, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--color-border)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background color="var(--color-border-subtle)" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: 520,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border)",
  background: "var(--color-bg-elevated)",
};
