import { Handle, Position } from "reactflow";

interface TopicNodeData {
  label: string;
  completion_status: string;
  onClick: (topicId: string) => void;
}

export default function TopicNode({ id, data }: { id: string; data: TopicNodeData }) {
  const statusColor: Record<string, string> = {
    not_started: "#e5e7eb",
    in_progress: "#fbbf24",
    complete: "#34d399",
  };

  return (
    <div
      onClick={() => data.onClick(id)}
      style={{
        background: statusColor[data.completion_status] ?? "#e5e7eb",
        border: "2px solid #374151", borderRadius: 8,
        padding: "8px 16px", cursor: "pointer",
        minWidth: 120, textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div style={{ fontWeight: 600, fontSize: 13 }}>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
