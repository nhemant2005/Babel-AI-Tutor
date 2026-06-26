import { Link, useLocation } from "react-router-dom";
import { House, BookOpen, Settings2 } from "lucide-react";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "Home",     path: "/home",     Icon: House },
  { label: "Learning", path: "/learning", Icon: BookOpen },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <nav style={{
      width: "var(--sidebar-width)",
      minHeight: "100vh",
      background: "var(--color-bg-surface)",
      borderRight: "1px solid var(--color-border)",
      display: "flex",
      flexDirection: "column",
      paddingTop: "var(--space-6)",
      paddingBottom: "var(--space-6)",
      paddingInline: "var(--space-4)",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 100,
    }}>
      {/* Wordmark */}
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-28)",
        fontWeight: "var(--weight-display-extrabold)",
        color: "var(--color-text-primary)",
        letterSpacing: "0.08em",
        marginBottom: "var(--space-8)",
        paddingInline: "var(--space-3)",
      }}>
        Babel
      </div>

      {/* Nav */}
      <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {navItems.map(({ label, path, Icon }) => {
          const active = pathname.startsWith(path);
          return (
            <li key={path}>
              <Link to={path} style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-13)",
                fontWeight: "var(--weight-display-medium)",
                letterSpacing: "0.04em",
                color: active ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                background: active ? "var(--color-accent-subtle)" : "transparent",
                transition: "background 150ms var(--ease-out), color 150ms var(--ease-out)",
              }}>
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Bottom icons */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        paddingTop: "var(--space-4)",
        borderTop: "1px solid var(--color-border)",
      }}>
        <NotificationBell />
        <Link to="/settings" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: "var(--radius-sm)",
          color: "var(--color-text-tertiary)",
          transition: "color 150ms var(--ease-out), background 150ms var(--ease-out)",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"; (e.currentTarget as HTMLElement).style.background = "var(--color-bg-subtle)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-tertiary)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <Settings2 size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </nav>
  );
}
