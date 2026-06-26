import { Handle, Position } from "reactflow";

interface TopicNodeData {
  label: string;
  completion_status: string;
  onClick: (topicId: string) => void;
}

export default function TopicNode({ id, data }: { id: string; data: TopicNodeData }) {
  const statusColor: Record<string, string> = {
    not_started: "var(--color-bg-subtle)",
    in_progress: "var(--color-warning)",
    complete: "var(--color-success)",
  };

  const statusBorder: Record<string, string> = {
    not_started: "var(--color-border)",
    in_progress: "var(--color-warning)",
    complete: "var(--color-success)",
  };

  return (
    <div
      onClick={() => data.onClick(id)}
      style={{
        background: statusColor[data.completion_status] ?? "var(--color-bg-subtle)",
        border: `2px solid ${statusBorder[data.completion_status] ?? "var(--color-border)"}`,
        borderRadius: "var(--radius-md)",
        padding: "var(--space-2) var(--space-4)",
        cursor: "pointer",
        minWidth: 130,
        textAlign: "center",
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-13)",
        fontWeight: "var(--weight-display-medium)",
        color: "var(--color-text-primary)",
        letterSpacing: "0.02em",
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
