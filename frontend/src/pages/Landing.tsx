import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>Gappy</h1>
      <p style={{ fontSize: "1.25rem", color: "#6b7280", marginBottom: "2rem", textAlign: "center", maxWidth: 480 }}>
        Most tutors make you feel good. This one makes you better.
      </p>
      <button
        onClick={() => navigate("/onboarding")}
        style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: "1rem", cursor: "pointer" }}
      >
        Get started
      </button>
    </div>
  );
}
