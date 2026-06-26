interface Props {
  topicName: string;
  unmetPrereqs: string[];
  onProceed: () => void;
  onCancel: () => void;
}

export default function InformedConsequenceModal({ topicName, unmetPrereqs, onProceed, onCancel }: Props) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }}>
      <div style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-8)",
        maxWidth: 440,
        width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-20)",
          fontWeight: "var(--weight-display-bold)",
          color: "var(--color-text-primary)",
          marginBottom: "var(--space-3)",
        }}>
          Heads up
        </h3>
        <p style={{ color: "var(--color-text-secondary)", margin: "0 0 var(--space-2)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--color-text-primary)" }}>{topicName}</strong> depends on topics you haven't completed:
        </p>
        <ul style={{ color: "var(--color-text-tertiary)", marginBottom: "var(--space-4)", paddingLeft: "var(--space-5)" }}>
          {unmetPrereqs.map(p => <li key={p} style={{ marginBottom: "var(--space-1)" }}>{p}</li>)}
        </ul>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)", lineHeight: 1.6 }}>
          You can still proceed &mdash; just know you might hit gaps.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <button onClick={onCancel} className="btn-secondary">
            Go back
          </button>
          <button onClick={onProceed} className="btn-primary">
            Proceed anyway
          </button>
        </div>
      </div>
    </div>
  );
}
