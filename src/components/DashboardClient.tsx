'use client'

import { useEffect, useMemo, useState } from 'react'
import type { OverviewPayload, ScoreboardGame, TeamStanding } from '@/lib/nba/types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function ScoreBadge({ game }: { game: ScoreboardGame }) {
  if (game.state === 'live') return <span className="badge badge-live">LIVE</span>
  if (game.state === 'post') return <span className="badge badge-final">FINAL</span>
  return <span className="badge badge-next">UPCOMING</span>
}

function GameCard({ game }: { game: ScoreboardGame }) {
  return (
    <article className="card game-card">
      <div className="game-topline">
        <ScoreBadge game={game} />
        <span>{formatDate(game.date)}</span>
      </div>
      <div className="teams-stack">
        <div className="team-row">
          <div className="team-id">
            {game.away.logo ? <img src={game.away.logo} alt={game.away.name} className="team-logo" /> : null}
            <strong>{game.away.abbreviation}</strong>
            <span>{game.away.name}</span>
          </div>
          <div className="team-score">{game.away.score ?? '-'}</div>
        </div>
        <div className="team-row">
          <div className="team-id">
            {game.home.logo ? <img src={game.home.logo} alt={game.home.name} className="team-logo" /> : null}
            <strong>{game.home.abbreviation}</strong>
            <span>{game.home.name}</span>
          </div>
          <div className="team-score">{game.home.score ?? '-'}</div>
        </div>
      </div>
      <div className="game-meta">
        <span>{game.status}</span>
        {game.broadcast ? <span>{game.broadcast}</span> : null}
        {game.venue ? <span>{game.venue}</span> : null}
        {game.seriesSummary ? <span>{game.seriesSummary}</span> : null}
      </div>
    </article>
  )
}

function StandingsTable({ title, teams }: { title: string; teams: TeamStanding[] }) {
  return (
    <section className="card standings-card">
      <div className="section-head">
        <h3>{title}</h3>
        <span className="muted">Top 15</span>
      </div>
      <div className="table-wrap">
        <table className="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>W</th>
              <th>L</th>
              <th>%</th>
              <th>Strk</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.abbreviation}>
                <td>{team.rank}</td>
                <td>
                  <div className="team-cell">
                    {team.logo ? <img src={team.logo} alt={team.name} className="team-logo small" /> : null}
                    <div>
                      <strong>{team.abbreviation}</strong>
                      <div className="muted tiny">{team.name}</div>
                    </div>
                  </div>
                </td>
                <td>{team.wins}</td>
                <td>{team.losses}</td>
                <td>{team.winPct.toFixed(3)}</td>
                <td>{team.streak || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PlayoffColumn({ title, automatic, playIn, chase }: { title: string; automatic: TeamStanding[]; playIn: TeamStanding[]; chase: TeamStanding[] }) {
  return (
    <section className="card playoff-card">
      <div className="section-head">
        <h3>{title}</h3>
        <span className="muted">Pronto per i playoff</span>
      </div>
      <div className="playoff-block">
        <h4>Seeds 1–6</h4>
        <ul>
          {automatic.map((team) => (
            <li key={team.abbreviation}><span>{team.rank}. {team.abbreviation}</span><span>{team.wins}-{team.losses}</span></li>
          ))}
        </ul>
      </div>
      <div className="playoff-block">
        <h4>Play-In 7–10</h4>
        <ul>
          {playIn.map((team) => (
            <li key={team.abbreviation}><span>{team.rank}. {team.abbreviation}</span><span>{team.wins}-{team.losses}</span></li>
          ))}
        </ul>
      </div>
      <div className="playoff-block">
        <h4>Outside Looking In</h4>
        <ul>
          {chase.map((team) => (
            <li key={team.abbreviation}><span>{team.rank}. {team.abbreviation}</span><span>{team.wins}-{team.losses}</span></li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function DashboardClient({ initialData }: { initialData: OverviewPayload }) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/nba/overview', { cache: 'no-store' })
        if (!response.ok) return
        const fresh = (await response.json()) as OverviewPayload
        setData(fresh)
      } finally {
        setLoading(false)
      }
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  const summary = useMemo(() => ({
    live: data.liveGames.length,
    today: data.todayGames.length,
    upcoming: data.upcomingGames.length,
  }), [data])

  return (
    <div className="page-shell">
      <section className="hero-grid">
        <div className="hero-copy card hero-card">
          <p className="eyebrow">NBA Live Hub</p>
          <h1>Campionato completo, già impostato per la corsa playoff.</h1>
          <p className="hero-text">
            Una base unica per regular season, scoreboard live, classifica conference e playoff picture.
            Pensata per GitHub + Vercel, mobile-first, con dati serviti da route interne.
          </p>
          <div className="hero-pills">
            <span className="pill">Season {data.seasonLabel}</span>
            <span className="pill">Provider {data.provider}</span>
            <span className="pill">Phase {data.phase}</span>
          </div>
        </div>
        <div className="hero-stats card">
          <div>
            <span className="stat-label">Live now</span>
            <strong>{summary.live}</strong>
          </div>
          <div>
            <span className="stat-label">Today</span>
            <strong>{summary.today}</strong>
          </div>
          <div>
            <span className="stat-label">Upcoming</span>
            <strong>{summary.upcoming}</strong>
          </div>
          <div>
            <span className="stat-label">Updated</span>
            <strong>{new Date(data.generatedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
          <div className="tiny muted">{loading ? 'Aggiornamento in corso…' : 'Refresh automatico ogni 60s'}</div>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <h2>Live & score di oggi</h2>
          <span className="muted">Partite in corso e calendario della giornata</span>
        </div>
        <div className="cards-grid three-up">
          {(data.liveGames.length ? data.liveGames : data.todayGames).map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        {!data.liveGames.length && !data.todayGames.length ? <div className="empty card">Nessuna partita disponibile nella finestra corrente.</div> : null}
      </section>

      <section className="section-stack">
        <div className="section-head">
          <h2>Prossime partite</h2>
          <span className="muted">Pronto per countdown, pagine match e alert</span>
        </div>
        <div className="cards-grid three-up">
          {data.upcomingGames.slice(0, 9).map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <h2>Playoff picture</h2>
          <span className="muted">Top 6, zona play-in e chase per conference</span>
        </div>
        <div className="cards-grid two-up">
          <PlayoffColumn
            title="Eastern Conference"
            automatic={data.playoffPicture.east.automatic}
            playIn={data.playoffPicture.east.playIn}
            chase={data.playoffPicture.east.chase}
          />
          <PlayoffColumn
            title="Western Conference"
            automatic={data.playoffPicture.west.automatic}
            playIn={data.playoffPicture.west.playIn}
            chase={data.playoffPicture.west.chase}
          />
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <h2>Standings complete</h2>
          <span className="muted">Base pronta per pagina dedicata standings / bracket</span>
        </div>
        <div className="cards-grid two-up">
          <StandingsTable title="Eastern Conference" teams={data.standings.east} />
          <StandingsTable title="Western Conference" teams={data.standings.west} />
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <h2>Recent results</h2>
          <span className="muted">Utile per home, recap e card shareable</span>
        </div>
        <div className="cards-grid three-up">
          {data.recentResults.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  )
}
