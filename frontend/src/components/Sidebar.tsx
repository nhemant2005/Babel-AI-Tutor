import { Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "Home", path: "/home" },
  { label: "Learning", path: "/learning" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <nav style={{
      width: 200, minHeight: "100vh", background: "#f9fafb",
      borderRight: "1px solid #e5e7eb", display: "flex",
      flexDirection: "column", padding: "1.5rem 1rem",
    }}>
      <div style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "2rem", color: "#111827" }}>
        Gappy
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, flex: 1 }}>
        {navItems.map(item => (
          <li key={item.path} style={{ marginBottom: "0.5rem" }}>
            <Link
              to={item.path}
              style={{
                display: "block", padding: "8px 12px", borderRadius: 6,
                textDecoration: "none",
                color: pathname.startsWith(item.path) ? "#4f46e5" : "#374151",
                background: pathname.startsWith(item.path) ? "#ede9fe" : "transparent",
                fontWeight: pathname.startsWith(item.path) ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
        <NotificationBell />
        <Link to="/settings" style={{ color: "#6b7280" }}><Settings size={20} /></Link>
      </div>
    </nav>
  );
}
