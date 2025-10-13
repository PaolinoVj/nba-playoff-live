"use client";
import "./globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
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
              {/* NBA Logo + Title (left) */}
              <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <img
                  src="https://logoeps.com/wp-content/uploads/2011/05/nba-logo-vector-01.png"
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
                    NBA 2025-26 Live
                  </h1>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: 1
                  }}>
                    Punteggi e Calendario
                  </p>
                </div>
              </div>
              
              {/* Live indicator (right) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                LIVE
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </body>
    </html>
  );
}
