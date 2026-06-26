interface Props {
  topicName: string;
  unmetPrereqs: string[];
  onProceed: () => void;
  onCancel: () => void;
}

export default function InformedConsequenceModal({ topicName, unmetPrereqs, onProceed, onCancel }: Props) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "2rem",
        maxWidth: 440, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h3 style={{ margin: "0 0 0.75rem" }}>Heads up</h3>
        <p style={{ color: "#374151", margin: "0 0 0.5rem" }}>
          <strong>{topicName}</strong> depends on topics you haven't completed:
        </p>
        <ul style={{ color: "#6b7280", marginBottom: "1rem" }}>
          {unmetPrereqs.map(p => <li key={p}>{p}</li>)}
        </ul>
        <p style={{ color: "#374151", marginBottom: "1.5rem" }}>
          You can still proceed — just know you might hit gaps.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}>
            Go back
          </button>
          <button onClick={onProceed} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#4f46e5", color: "#fff", cursor: "pointer" }}>
            Proceed anyway
          </button>
        </div>
      </div>
    </div>
  );
}
