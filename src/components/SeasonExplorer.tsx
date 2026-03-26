'use client'

import { useEffect, useMemo, useState } from 'react'
import type { GamesListPayload, HistoricalGame, StandingsSnapshotPayload, TeamStanding, TeamsListPayload } from '@/lib/nba/types'
import { getEspnTeamLogo, teamLogos } from '@/utils/nbaTeamLogos'

interface SeasonExplorerProps {
  initialSeason: number
}


function renderStandingRow(team: TeamStanding) {
  const fallbackLogo = getEspnTeamLogo(team.abbreviation)

  return (
    <tr key={team.abbreviation}>
      <td>{team.seed ?? team.rank}</td>
      <td>
        <div className="team-cell">
          <img
            src={team.logo || teamLogos[team.abbreviation] || fallbackLogo}
            alt={team.name}
            className="team-logo small"
          />
          <div>
            <strong>{team.abbreviation}</strong>
            <div className="muted tiny">{team.name}</div>
          </div>
        </div>
      </td>
      <td>{team.wins}</td>
      <td>{team.losses}</td>
      <td>{team.winPct.toFixed(3)}</td>
      <td>{team.streak || '—'}</td>
    </tr>
  )
}

function scoreLabel(game: HistoricalGame) {
  if (game.status === 'Final') return 'FINAL'
  if (game.postponed) return 'POSTPONED'
  if (game.time && game.time.trim()) return `${game.status} · ${game.time}`
  return game.status
}

export default function SeasonExplorer({ initialSeason }: SeasonExplorerProps) {
  const [season, setSeason] = useState(initialSeason)
  const [teamId, setTeamId] = useState('')
  const [postseason, setPostseason] = useState('false')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const [games, setGames] = useState<HistoricalGame[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [gamesLoading, setGamesLoading] = useState(false)
  const [gamesError, setGamesError] = useState('')
  const [gamesNote, setGamesNote] = useState('')

  const [standings, setStandings] = useState<StandingsSnapshotPayload | null>(null)
  const [teams, setTeams] = useState<TeamsListPayload['data']>([])
  const [standingsLoading, setStandingsLoading] = useState(false)
  const [standingsError, setStandingsError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadStandings() {
      try {
        setStandingsLoading(true)
        setStandingsError('')
        const response = await fetch('/api/nba/standings', { cache: 'no-store' })
        const payload = (await response.json()) as StandingsSnapshotPayload
        if (!response.ok) {
          throw new Error(payload.note || 'Standings non disponibili')
        }
        if (!cancelled) setStandings(payload)
      } catch (error) {
        if (!cancelled) setStandingsError(error instanceof Error ? error.message : 'Errore standings')
      } finally {
        if (!cancelled) setStandingsLoading(false)
      }
    }

    loadStandings()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadTeams() {
      try {
        const response = await fetch('/api/nba/teams', { cache: 'no-store' })
        const payload = (await response.json()) as TeamsListPayload
        if (!response.ok) return
        if (!cancelled) setTeams(payload.data)
      } catch (error) {
        console.error('Teams route warning', error)
      }
    }

    loadTeams()
    return () => {
      cancelled = true
    }
  }, [])

  async function loadGames(reset = false) {
    try {
      setGamesLoading(true)
      setGamesError('')

      const params = new URLSearchParams()
      params.set('season', String(season))
      params.set('per_page', '100')
      if (postseason !== 'both') params.set('postseason', postseason)
      if (teamId) params.set('team_id', teamId)
      if (start) params.set('start', start)
      if (end) params.set('end', end)
      if (!reset && nextCursor) params.set('cursor', String(nextCursor))

      const response = await fetch(`/api/nba/games?${params.toString()}`, { cache: 'no-store' })
      const payload = (await response.json()) as GamesListPayload

      if (!response.ok) {
        throw new Error(payload.note || 'Storico partite non disponibile')
      }

      setGamesNote(payload.note || '')
      setNextCursor(payload.meta.nextCursor)
      setGames((current) => (reset ? payload.data : [...current, ...payload.data]))
    } catch (error) {
      setGamesError(error instanceof Error ? error.message : 'Errore storico partite')
    } finally {
      setGamesLoading(false)
    }
  }

  useEffect(() => {
    setNextCursor(null)
    loadGames(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, postseason, teamId, start, end])

  const eastTeams = standings?.standings.east || []
  const westTeams = standings?.standings.west || []
  const mappedTeamOptions = useMemo(() => {
    return [...teams]
      .sort((a, b) => a.abbreviation.localeCompare(b.abbreviation))
      .map((team) => ({
        id: team.id,
        label: `${team.abbreviation} — ${team.fullName}`,
      }))
  }, [teams])

  return (
    <div className="page-shell">
      <section className="hero-grid season-hero-grid">
        <div className="card hero-card">
          <p className="eyebrow">Season explorer</p>
          <h1>Questa stagione dall&apos;inizio, con orari italiani e archivio interrogabile.</h1>
          <p className="hero-text">
            La pagina usa route interne su Vercel: standings correnti da ESPN e storico partite interrogato on demand da balldontlie.
            Nessun archivio scaricato localmente: filtri, paginazione e orari convertiti in Europa/Roma.
          </p>
          <div className="hero-pills">
            <span className="pill">Season {season}-{String(season + 1).slice(-2)}</span>
            <span className="pill">Timezone Europe/Rome</span>
            <span className="pill">Per page 100</span>
          </div>
        </div>
        <div className="card control-card">
          <div className="section-head compact">
            <h3>Filtri</h3>
            <span className="muted">Route /api/nba/games</span>
          </div>
          <div className="filters-grid">
            <label>
              <span>Season</span>
              <input type="number" value={season} onChange={(e) => setSeason(Number(e.target.value || initialSeason))} />
            </label>
            <label>
              <span>Fase</span>
              <select value={postseason} onChange={(e) => setPostseason(e.target.value)}>
                <option value="false">Regular season</option>
                <option value="true">Playoffs</option>
                <option value="both">Tutte</option>
              </select>
            </label>
            <label>
              <span>Team</span>
              <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                <option value="">Tutte le squadre</option>
                {mappedTeamOptions.map((team) => (
                  <option key={team.label} value={String(team.id)}>{team.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Da</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label>
              <span>A</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>
          <div className="filter-actions">
            <button className="button-primary" onClick={() => loadGames(true)} disabled={gamesLoading}>
              {gamesLoading ? 'Aggiornamento…' : 'Aggiorna risultati'}
            </button>
            <button
              className="button-secondary"
              onClick={() => {
                setSeason(initialSeason)
                setTeamId('')
                setPostseason('false')
                setStart('')
                setEnd('')
              }}
              disabled={gamesLoading}
            >
              Reset
            </button>
          </div>
          {gamesNote ? <p className="tiny muted">{gamesNote}</p> : null}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <h2>Classifica attuale</h2>
          <span className="muted">Corrente, pronta per playoff picture</span>
        </div>
        {standingsError ? <div className="empty card">{standingsError}</div> : null}
        {standingsLoading ? <div className="empty card">Carico standings…</div> : null}
        {!standingsLoading && !standingsError && (eastTeams.length || westTeams.length) ? (
          <div className="cards-grid two-up">
            <section className="card standings-card">
              <div className="section-head compact">
                <h3>Eastern Conference</h3>
                <span className="muted">Top 15</span>
              </div>
              <div className="table-wrap">
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Seed</th>
                      <th>Team</th>
                      <th>W</th>
                      <th>L</th>
                      <th>%</th>
                      <th>Strk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eastTeams.map(renderStandingRow)}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="card standings-card">
              <div className="section-head compact">
                <h3>Western Conference</h3>
                <span className="muted">Top 15</span>
              </div>
              <div className="table-wrap">
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Seed</th>
                      <th>Team</th>
                      <th>W</th>
                      <th>L</th>
                      <th>%</th>
                      <th>Strk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {westTeams.map(renderStandingRow)}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}
        {!standingsLoading && !standingsError && !eastTeams.length && !westTeams.length ? (
          <div className="empty card">Nessuna classifica disponibile al momento. Riprova tra poco.</div>
        ) : null}
      </section>

      <section className="section-stack">
        <div className="section-head">
          <h2>Storico partite</h2>
          <span className="muted">Orario italiano + paginazione on demand</span>
        </div>
        {gamesError ? <div className="empty card">{gamesError}</div> : null}
        {!gamesError ? (
          <section className="card">
            <div className="history-summary">
              <span className="pill">Caricate {games.length} partite</span>
              <span className="pill">Cursor {nextCursor ?? 'fine elenco / non disponibile'}</span>
            </div>
            <div className="table-wrap">
              <table className="games-table">
                <thead>
                  <tr>
                    <th>Data ITA</th>
                    <th>Match</th>
                    <th>Score</th>
                    <th>Stato</th>
                    <th>Fase</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id}>
                      <td>
                        <strong>{game.dayItaly}</strong>
                        <div className="muted tiny">{game.timeItaly}</div>
                      </td>
                      <td>
                        <strong>{game.visitorTeam.abbreviation} @ {game.homeTeam.abbreviation}</strong>
                        <div className="muted tiny">{game.visitorTeam.fullName} @ {game.homeTeam.fullName}</div>
                      </td>
                      <td>{game.visitorTeamScore} - {game.homeTeamScore}</td>
                      <td>{scoreLabel(game)}</td>
                      <td>{game.postseason ? 'Playoff' : 'Regular'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!games.length && !gamesLoading ? <div className="empty">Nessuna partita trovata con questi filtri.</div> : null}
            <div className="filter-actions top-gap">
              <button className="button-primary" onClick={() => loadGames(false)} disabled={gamesLoading || !nextCursor}>
                {gamesLoading ? 'Caricamento…' : nextCursor ? 'Carica altre 100' : "Nessun'altra pagina"}
              </button>
            </div>
          </section>
        ) : null}
      </section>
    </div>
  )
}
