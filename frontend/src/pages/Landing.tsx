import { useNavigate } from "react-router-dom";

const slides = [
  {
    headline: "Your material. Your pace.",
    body: "Upload anything — textbook, notes, papers. Babel reads it, extracts every topic, and orders them so nothing is skipped.",
  },
  {
    headline: "A tutor that actually teaches.",
    body: "Not flashcards. Not quizzes. A conversation that pushes until you understand — and knows when you're bluffing.",
  },
  {
    headline: "Remembers everything you've done.",
    body: "Every session is banked. Every gap is tracked. The next session picks up exactly where you are.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg-base)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-16) var(--space-12)",
      gap: "var(--space-12)",
    }}>
      {/* Hero */}
      <div style={{ textAlign: "center", maxWidth: 680 }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-28)",
          fontWeight: "var(--weight-display-extrabold)",
          color: "var(--color-text-primary)",
          letterSpacing: "0.08em",
          marginBottom: "var(--space-8)",
        }}>
          Babel
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-56)",
          fontWeight: "var(--weight-display-bold)",
          color: "var(--color-text-primary)",
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          marginBottom: "var(--space-6)",
        }}>
          Most tutors make you feel good.
          <br />
          <span style={{ color: "var(--color-accent-text)" }}>This one makes you better.</span>
        </h1>
      </div>

      {/* Slides */}
      <div style={{
        display: "flex",
        gap: "var(--space-6)",
        maxWidth: 900,
        width: "100%",
      }}>
        {slides.map((slide, i) => (
          <div key={i} className="glass" style={{
            flex: 1,
            padding: "var(--space-8)",
            borderRadius: "var(--radius-lg)",
          }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-20)",
              fontWeight: "var(--weight-display-bold)",
              color: "var(--color-text-primary)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              marginBottom: "var(--space-4)",
            }}>
              {slide.headline}
            </h2>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-15)",
              fontWeight: "var(--weight-body-regular)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
            }}>
              {slide.body}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button className="btn-primary" onClick={() => navigate("/onboarding")}>
        Start Learning
      </button>

      {/* Brand secondary line */}
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-15)",
        fontWeight: "var(--weight-display-light)",
        fontStyle: "italic",
        color: "var(--color-text-tertiary)",
        letterSpacing: "0.03em",
      }}>
        We don't perform helpfulness. We're just helpful.
      </p>
    </div>
  );
}
