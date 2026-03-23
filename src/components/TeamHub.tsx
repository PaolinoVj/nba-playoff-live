'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { HistoricalGame, TeamSummaryPayload, TeamPhaseFilter } from '@/lib/nba/types'

interface TeamHubProps {
  initialSlug: string
  initialSeason: number
}

function gameResultLabel(game: HistoricalGame, abbreviation: string) {
  const isHome = game.homeTeam.abbreviation === abbreviation
  const teamScore = isHome ? game.homeTeamScore : game.visitorTeamScore
  const oppScore = isHome ? game.visitorTeamScore : game.homeTeamScore
  if (game.status.toLowerCase().includes('final')) {
    return teamScore > oppScore ? `W ${teamScore}-${oppScore}` : `L ${teamScore}-${oppScore}`
  }
  if (game.postponed) return 'Postponed'
  return game.time ? `${game.status} · ${game.time}` : game.status
}

function matchupLabel(game: HistoricalGame, abbreviation: string) {
  const isHome = game.homeTeam.abbreviation === abbreviation
  const opponent = isHome ? game.visitorTeam : game.homeTeam
  return isHome ? `vs ${opponent.abbreviation}` : `@ ${opponent.abbreviation}`
}

export default function TeamHub({ initialSlug, initialSeason }: TeamHubProps) {
  const [season, setSeason] = useState(initialSeason)
  const [phase, setPhase] = useState<TeamPhaseFilter>('regular')
  const [payload, setPayload] = useState<TeamSummaryPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError('')
        const params = new URLSearchParams({ season: String(season), phase })
        const response = await fetch(`/api/nba/team/${initialSlug}?${params.toString()}`, { cache: 'no-store' })
        const nextPayload = (await response.json()) as TeamSummaryPayload
        if (!response.ok) throw new Error(nextPayload.note || 'Dettaglio squadra non disponibile')
        if (!cancelled) setPayload(nextPayload)
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Errore dettaglio squadra')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [initialSlug, season, phase])

  const team = payload?.team
  const standings = payload?.standingsEntry
  const seasonLabel = `${season}-${String(season + 1).slice(-2)}`
  const heroPills = useMemo(() => {
    const values = [
      `Season ${seasonLabel}`,
      phase === 'regular' ? 'Regular season' : phase === 'playoffs' ? 'Playoffs' : 'Regular + playoff',
    ]
    if (standings) values.push(`Seed #${standings.rank} ${standings.conference}`)
    if (payload) values.push(`Record ${payload.summary.wins}-${payload.summary.losses}`)
    return values
  }, [payload, phase, seasonLabel, standings])

  return (
    <div className="page-shell team-page-shell">
      <section className="hero-grid team-hero-grid">
        <div className="card hero-card team-hero-card">
          <div className="team-hero-top">
            {team?.logo ? <img src={team.logo} alt={team.fullName} className="team-hero-logo" /> : null}
            <div>
              <p className="eyebrow">Team page</p>
              <h1>{team?.fullName || initialSlug.toUpperCase()}</h1>
              <p className="hero-text">
                Pagina squadra dedicata con classifica corrente, ultimi risultati, prossime partite e calendario della stagione interrogato on demand.
              </p>
            </div>
          </div>
          <div className="hero-pills">
            {heroPills.map((pill) => (
              <span key={pill} className="pill">{pill}</span>
            ))}
          </div>
        </div>
        <div className="card control-card">
          <div className="section-head compact">
            <h3>Filtri squadra</h3>
            <span className="muted">/api/nba/team/{initialSlug}</span>
          </div>
          <div className="filters-grid team-filter-grid">
            <label>
              <span>Season</span>
              <input type="number" value={season} onChange={(e) => setSeason(Number(e.target.value || initialSeason))} />
            </label>
            <label>
              <span>Fase</span>
              <select value={phase} onChange={(e) => setPhase(e.target.value as TeamPhaseFilter)}>
                <option value="regular">Regular season</option>
                <option value="playoffs">Playoffs</option>
                <option value="all">Tutte</option>
              </select>
            </label>
          </div>
          <div className="filter-actions">
            <Link href="/teams" className="button-secondary nav-button">Tutte le squadre</Link>
            <Link href="/season" className="button-secondary nav-button">Season explorer</Link>
          </div>
          {payload?.note ? <p className="tiny muted">{payload.note}</p> : null}
        </div>
      </section>

      {error ? <section className="card empty">{error}</section> : null}
      {loading ? <section className="card empty">Carico dettaglio squadra…</section> : null}

      {!loading && !error && payload && team ? (
        <>
          <section className="cards-grid three-up">
            <article className="card team-summary-card">
              <div className="section-head compact">
                <h3>Snapshot stagione</h3>
                <span className="muted">{seasonLabel}</span>
              </div>
              <div className="team-summary-metrics">
                <div>
                  <span className="stat-label">Record</span>
                  <strong>{payload.summary.wins}-{payload.summary.losses}</strong>
                </div>
                <div>
                  <span className="stat-label">Last 10</span>
                  <strong>{payload.summary.last10}</strong>
                </div>
                <div>
                  <span className="stat-label">Home</span>
                  <strong>{payload.summary.homeRecord}</strong>
                </div>
                <div>
                  <span className="stat-label">Away</span>
                  <strong>{payload.summary.awayRecord}</strong>
                </div>
              </div>
            </article>
            <article className="card team-summary-card">
              <div className="section-head compact">
                <h3>Classifica</h3>
                <span className="muted">Contesto corrente</span>
              </div>
              <div className="team-summary-metrics single-col">
                <div>
                  <span className="stat-label">Conference</span>
                  <strong>{standings?.conference || team.conference || '—'}</strong>
                </div>
                <div>
                  <span className="stat-label">Seed</span>
                  <strong>{standings ? `#${standings.rank}` : '—'}</strong>
                </div>
                <div>
                  <span className="stat-label">Streak</span>
                  <strong>{standings?.streak || '—'}</strong>
                </div>
              </div>
            </article>
            <article className="card team-summary-card">
              <div className="section-head compact">
                <h3>Copertura</h3>
                <span className="muted">Storico interrogato</span>
              </div>
              <div className="team-summary-metrics single-col">
                <div>
                  <span className="stat-label">Partite caricate</span>
                  <strong>{payload.summary.totalGames}</strong>
                </div>
                <div>
                  <span className="stat-label">Completate</span>
                  <strong>{payload.summary.completedGames}</strong>
                </div>
                <div>
                  <span className="stat-label">Provider</span>
                  <strong>{payload.provider}</strong>
                </div>
              </div>
            </article>
          </section>

          <section className="cards-grid two-up">
            <article className="card">
              <div className="section-head compact">
                <h3>Prossime partite</h3>
                <span className="muted">Orario italiano</span>
              </div>
              <div className="mini-schedule-list">
                {payload.upcomingGames.length ? payload.upcomingGames.map((game) => (
                  <div key={game.id} className="mini-schedule-row">
                    <div>
                      <strong>{matchupLabel(game, team.abbreviation)}</strong>
                      <div className="tiny muted">{game.dayItaly} · {game.timeItaly}</div>
                    </div>
                    <span className="badge badge-next">{game.status}</span>
                  </div>
                )) : <div className="empty">Nessuna prossima partita nel filtro corrente.</div>}
              </div>
            </article>
            <article className="card">
              <div className="section-head compact">
                <h3>Ultimi risultati</h3>
                <span className="muted">Ultime 10 finali</span>
              </div>
              <div className="mini-schedule-list">
                {payload.recentGames.length ? payload.recentGames.map((game) => (
                  <div key={game.id} className="mini-schedule-row">
                    <div>
                      <strong>{matchupLabel(game, team.abbreviation)}</strong>
                      <div className="tiny muted">{game.dayItaly} · {game.timeItaly}</div>
                    </div>
                    <span className={`badge ${gameResultLabel(game, team.abbreviation).startsWith('W') ? 'badge-final' : 'badge-live'}`}>
                      {gameResultLabel(game, team.abbreviation)}
                    </span>
                  </div>
                )) : <div className="empty">Nessun risultato disponibile nel filtro corrente.</div>}
              </div>
            </article>
          </section>

          <section className="section-stack">
            <div className="section-head">
              <h2>Calendario e risultati</h2>
              <span className="muted">Vista completa della squadra</span>
            </div>
            <section className="card">
              <div className="table-wrap">
                <table className="games-table">
                  <thead>
                    <tr>
                      <th>Data ITA</th>
                      <th>Match</th>
                      <th>Risultato</th>
                      <th>Fase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payload.allGames.map((game) => (
                      <tr key={game.id}>
                        <td>
                          <strong>{game.dayItaly}</strong>
                          <div className="tiny muted">{game.timeItaly}</div>
                        </td>
                        <td>
                          <strong>{matchupLabel(game, team.abbreviation)}</strong>
                          <div className="tiny muted">{game.visitorTeam.abbreviation} @ {game.homeTeam.abbreviation}</div>
                        </td>
                        <td>{gameResultLabel(game, team.abbreviation)}</td>
                        <td>{game.postseason ? 'Playoff' : 'Regular'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!payload.allGames.length ? <div className="empty top-gap">Nessuna partita trovata per questo filtro.</div> : null}
            </section>
          </section>
        </>
      ) : null}
    </div>
  )
}
