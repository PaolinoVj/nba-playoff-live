"use client";
import "./globals.css";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <html lang="en">
      <body>
        {/* NBA Header */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '64px'
            }}>
              {/* NBA Logo + Title */}
              <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <img
                  src="https://logoeps.com/wp-content/uploads/2013/03/nba-vector-logo.png"
                  alt="NBA Logo"
                  style={{height: '40px', width: 'auto', objectFit: 'contain'}}
                />
                <div>
                  <h1 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0,
                    lineHeight: 1
                  }}>
                    NBA 2024-25
                  </h1>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: 1
                  }}>
                    Live Stats & Scores
                  </p>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  color: '#374151',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
