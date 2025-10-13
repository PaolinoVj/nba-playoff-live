import "./globals.css";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Aggiorna il data-theme sul body (per CSS)
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      {/* Header NBA con icona/logo */}
      <header
        style={{
          background: "linear-gradient(90deg,#1d428a 60%,#c8102e 40%)",
          color: theme === "dark" ? "#fff" : "#181f2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "22px",
          fontWeight: "bold",
          fontSize: "2.2em",
          letterSpacing: "0.06em",
        }}
      >
        <img
          src="/favicon.jpg"
          alt="NBA Cover"
          style={{
            height: 54,
            marginRight: 22,
            borderRadius: 12,
            boxShadow: "0 2px 14px #0007",
            background: "#fff",
          }}
        />
        NBA 2024-25 Season Live
        <button
          style={{
            marginLeft: 28,
            padding: "8px 20px",
            background: theme === "dark" ? "#f8fafd" : "#181f2a",
            color: theme === "dark" ? "#1d428a" : "#fff",
            border: "none",
            borderRadius: 13,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.65em",
            boxShadow: "0 2px 7px #2a2a2a33"
          }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Switch Theme"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </header>
      <main>{children}</main>
      <footer
        style={{
          background: theme === "dark" ? "#181f2acc" : "#eaeaeaee",
          color: theme === "dark" ? "#eee" : "#181f2a",
          textAlign: "center",
          padding: "14px",
          marginTop: "38px",
          fontSize: "1em",
          borderTop: "4px solid #c8102e",
          letterSpacing: "0.03em"
        }}
      >
        Powered by <a href="https://balldontlie.io" style={{ color: "#c8102e" }}>balldontlie.io</a> | Made by PaolinoVj
      </footer>
    </>
  );
}
