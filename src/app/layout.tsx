import Link from 'next/link'
import './globals.css'

export const metadata = {
  title: 'NBA Live Hub',
  description: 'Dashboard NBA completa per regular season e playoff, pronta per GitHub e Vercel.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <div className="brand-block">
              <img
                src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png"
                alt="NBA"
                className="brand-logo"
              />
              <div>
                <p className="eyebrow">NBA Live Hub</p>
                <h1 className="site-title">Regular Season + Playoff Ready</h1>
              </div>
            </div>
            <nav className="header-nav">
              <Link href="/">Dashboard</Link>
              <Link href="/season">Season Explorer</Link>
              <Link href="/teams">Teams</Link>
            </nav>
            <div className="header-live-pill">
              <span className="live-dot" />
              Public dashboard
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
