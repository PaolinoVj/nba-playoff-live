"use client";
import "./globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
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
              justifyContent: 'center',
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
