'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { StandingsSnapshotPayload, TeamsListPayload } from '@/lib/nba/types'
import { teamLogos } from '@/utils/nbaTeamLogos'

function teamHref(abbreviation: string) {
  return `/teams/${abbreviation.toLowerCase()}`
}

export default function TeamsDirectory() {
  const [teams, setTeams] = useState<TeamsListPayload['data']>([])
  const [standings, setStandings] = useState<StandingsSnapshotPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError('')
        const [teamsResponse, standingsResponse] = await Promise.all([
          fetch('/api/nba/teams', { cache: 'no-store' }),
          fetch('/api/nba/standings', { cache: 'no-store' }),
        ])

        const teamsPayload = (await teamsResponse.json()) as TeamsListPayload
        const standingsPayload = (await standingsResponse.json()) as StandingsSnapshotPayload

        if (!teamsResponse.ok) throw new Error(teamsPayload.note || 'Teams non disponibili')
        if (!standingsResponse.ok) throw new Error(standingsPayload.note || 'Standings non disponibili')

        if (!cancelled) {
          setTeams(teamsPayload.data)
          setStandings(standingsPayload)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Errore caricamento squadre')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const standingsMap = useMemo(() => {
    const map = new Map<string, { rank: number; seed?: number; record: string; conference: string; streak?: string; logo?: string }>()
    const all = [...(standings?.standings.east || []), ...(standings?.standings.west || [])]
    for (const team of all) {
      map.set(team.abbreviation, {
        rank: team.rank,
        record: `${team.wins}-${team.losses}`,
        conference: team.conference,
        streak: team.streak,
        seed: team.seed,
        logo: team.logo,
      })
    }
    return map
  }, [standings])

  const grouped = useMemo(() => {
    return {
      east: teams.filter((team) => team.conference === 'East').sort((a, b) => a.abbreviation.localeCompare(b.abbreviation)),
      west: teams.filter((team) => team.conference === 'West').sort((a, b) => a.abbreviation.localeCompare(b.abbreviation)),
    }
  }, [teams])

  return (
    <div className="page-shell">
      <section className="hero-grid season-hero-grid">
        <div className="card hero-card">
          <p className="eyebrow">Teams hub</p>
          <h1>Indice squadre pronto per seguire stagione, classifica e playoff race.</h1>
          <p className="hero-text">
            Apri una franchigia per vedere pagina dedicata con record, ultimi risultati, prossime partite e calendario interrogato on demand.
          </p>
          <div className="hero-pills">
            <span className="pill">30 squadre</span>
            <span className="pill">Link team dedicati</span>
            <span className="pill">Dati live + storico</span>
          </div>
        </div>
        <div className="card control-card">
          <div className="section-head compact">
            <h3>Stato</h3>
            <span className="muted">/api/nba/teams + /api/nba/standings</span>
          </div>
          {loading ? <div className="empty">Carico indice squadre…</div> : null}
          {error ? <div className="empty">{error}</div> : null}
          {!loading && !error ? (
            <div className="team-directory-meta">
              <div>
                <span className="stat-label">East</span>
                <strong>{grouped.east.length}</strong>
              </div>
              <div>
                <span className="stat-label">West</span>
                <strong>{grouped.west.length}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {(['east', 'west'] as const).map((conferenceKey) => {
        const list = grouped[conferenceKey]
        const title = conferenceKey === 'east' ? 'Eastern Conference' : 'Western Conference'
        return (
          <section key={conferenceKey} className="section-stack">
            <div className="section-head">
              <h2>{title}</h2>
              <span className="muted">Apri la squadra per dettaglio completo</span>
            </div>
            <div className="team-directory-grid">
              {list.map((team) => {
                const standing = standingsMap.get(team.abbreviation)
                return (
                  <Link key={team.id} href={teamHref(team.abbreviation)} className="card team-directory-card">
                    <div className="team-directory-top">
                      <div className="team-directory-team">
                        <img
                          src={standing?.logo || teamLogos[team.abbreviation] || `https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/${team.abbreviation.toLowerCase()}.png`}
                          alt={team.fullName}
                          className="team-logo"
                        />
                        <div>
                          <p className="eyebrow">{team.conference} · {team.division}</p>
                          <h3>{team.fullName}</h3>
                        </div>
                      </div>
                      <span className="badge badge-next">{team.abbreviation}</span>
                    </div>
                    <div className="team-directory-stats">
                      <div>
                        <span className="stat-label">Record</span>
                        <strong>{standing?.record || '—'}</strong>
                      </div>
                      <div>
                        <span className="stat-label">Seed</span>
                        <strong>{standing ? `#${standing.seed ?? standing.rank}` : '—'}</strong>
                      </div>
                    </div>
                    <div className="tiny muted">{standing?.streak ? `Streak ${standing.streak}` : 'Pagina squadra dedicata'}</div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
