import { DEFAULT_REVALIDATE_SECONDS, ESPN_SITE_BASE, SCOREBOARD_WINDOW_DAYS } from '@/lib/nba/constants'
import type { Conference, OverviewPayload, ScoreboardGame, TeamStanding, SeasonPhase } from '@/lib/nba/types'

const dayMs = 24 * 60 * 60 * 1000


const EAST_ABBREVIATIONS = new Set(['ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DET', 'IND', 'MIA', 'MIL', 'NYK', 'ORL', 'PHI', 'TOR', 'WAS'])
const WEST_ABBREVIATIONS = new Set(['DAL', 'DEN', 'GSW', 'HOU', 'LAC', 'LAL', 'MEM', 'MIN', 'NOP', 'OKC', 'PHX', 'POR', 'SAC', 'SAS', 'UTA'])

function toEspnDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

function formatSeasonLabel(now: Date): string {
  const year = now.getUTCMonth() >= 8 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
  const next = (year + 1).toString().slice(-2)
  return `${year}-${next}`
}

function detectPhase(now: Date): SeasonPhase {
  const month = now.getUTCMonth() + 1
  if (month >= 10 || month <= 4) return 'regular'
  if (month >= 5 && month <= 6) return 'playoffs'
  if (month >= 7 && month <= 8) return 'offseason'
  return 'preseason'
}

function emptyStandings() {
  return {
    east: [] as TeamStanding[],
    west: [] as TeamStanding[],
  }
}

export function makeEmptyOverview(now = new Date()): OverviewPayload {
  return {
    generatedAt: now.toISOString(),
    provider: 'espn-public',
    seasonLabel: formatSeasonLabel(now),
    phase: detectPhase(now),
    liveGames: [],
    todayGames: [],
    upcomingGames: [],
    recentResults: [],
    standings: emptyStandings(),
    playoffPicture: {
      east: {
        conference: 'East',
        automatic: [],
        playIn: [],
        chase: [],
      },
      west: {
        conference: 'West',
        automatic: [],
        playIn: [],
        chase: [],
      },
    },
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(url: string, retries = 2) {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'nba-live-hub/2.0',
          Accept: 'application/json',
        },
        next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`ESPN fetch failed (${response.status}) for ${url}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeout)
      lastError = error

      if (attempt < retries) {
        await sleep(700 * (attempt + 1))
        continue
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`ESPN fetch failed for ${url}`)
}

function parseGame(event: any): ScoreboardGame {
  const competition = event?.competitions?.[0] || {}
  const competitors = competition?.competitors || []
  const awayRaw = competitors.find((entry: any) => entry.homeAway === 'away')
  const homeRaw = competitors.find((entry: any) => entry.homeAway === 'home')
  const statusType = competition?.status?.type || event?.status?.type || {}
  const state: 'pre' | 'live' | 'post' = statusType.state === 'in' ? 'live' : statusType.completed ? 'post' : 'pre'
  const broadcasts = competition?.broadcasts || []
  const seriesSummary = competition?.series?.summary || competition?.notes?.[0]?.headline

  return {
    id: String(event?.id || competition?.id || Math.random()),
    date: event?.date,
    status: statusType.shortDetail || statusType.description || 'Scheduled',
    state,
    period: competition?.status?.period ? `Q${competition.status.period}` : undefined,
    clock: competition?.status?.displayClock || undefined,
    broadcast: broadcasts[0]?.names?.join(', ') || undefined,
    venue: competition?.venue?.fullName || undefined,
    seriesSummary: seriesSummary || undefined,
    away: {
      name: awayRaw?.team?.displayName || 'Away',
      abbreviation: awayRaw?.team?.abbreviation || 'AWY',
      score: awayRaw?.score,
      logo: awayRaw?.team?.logo,
      winner: awayRaw?.winner,
    },
    home: {
      name: homeRaw?.team?.displayName || 'Home',
      abbreviation: homeRaw?.team?.abbreviation || 'HME',
      score: homeRaw?.score,
      logo: homeRaw?.team?.logo,
      winner: homeRaw?.winner,
    },
  }
}

function getStatValue(stats: any[], ...names: string[]): string | undefined {
  if (!Array.isArray(stats)) return undefined
  const normalized = names.map((name) => name.toLowerCase())

  for (const entry of stats) {
    const name = String(entry?.name || '').toLowerCase()
    const shortName = String(entry?.shortName || '').toLowerCase()
    const abbreviation = String(entry?.abbreviation || '').toLowerCase()

    if (normalized.includes(name) || normalized.includes(shortName) || normalized.includes(abbreviation)) {
      return entry?.displayValue ?? entry?.value?.toString()
    }
  }

  return undefined
}

function toNumber(value: string | undefined, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getConferenceName(raw: any): Conference | null {
  const label = String(raw?.name || raw?.abbreviation || '').toLowerCase()
  if (label.includes('west') || label.includes('wst')) return 'West'
  if (label.includes('east') || label.includes('est')) return 'East'
  return null
}

function inferConferenceFromEntry(entry: any): Conference | null {
  const fromStats = String(getStatValue(entry?.stats, 'conference') || entry?.team?.conferenceId || '').toLowerCase()
  if (fromStats.includes('west') || fromStats === '2') return 'West'
  if (fromStats.includes('east') || fromStats === '1') return 'East'

  const abbreviation = String(entry?.team?.abbreviation || '').toUpperCase()
  if (EAST_ABBREVIATIONS.has(abbreviation)) return 'East'
  if (WEST_ABBREVIATIONS.has(abbreviation)) return 'West'

  return null
}

function resolveEntries(data: any) {
  const byConference: Record<Conference, any[]> = { East: [], West: [] }

  function visit(node: any) {
    if (!node || typeof node !== 'object') return

    const conference = getConferenceName(node)
    const entries = Array.isArray(node?.standings?.entries) ? node.standings.entries : []

    if (entries.length) {
      if (conference) {
        byConference[conference].push(...entries)
      } else {
        for (const entry of entries) {
          const inferred = inferConferenceFromEntry(entry)
          if (inferred) byConference[inferred].push(entry)
        }
      }
    }

    const children = Array.isArray(node?.children) ? node.children : []
    for (const child of children) {
      visit(child)
    }
  }

  visit(data)

  const topEntries = Array.isArray(data?.standings?.entries)
    ? data.standings.entries
    : Array.isArray(data?.entries)
      ? data.entries
      : []

  if (topEntries.length && !byConference.East.length && !byConference.West.length) {
    for (const entry of topEntries) {
      const inferred = inferConferenceFromEntry(entry)
      if (inferred) byConference[inferred].push(entry)
    }
  }

  return [
    { conference: 'East' as Conference, entries: byConference.East },
    { conference: 'West' as Conference, entries: byConference.West },
  ]
}

function parseStandings(data: any): { east: TeamStanding[]; west: TeamStanding[] } {
  const east: TeamStanding[] = []
  const west: TeamStanding[] = []

  for (const group of resolveEntries(data)) {
    group.entries.forEach((entry: any, index: number) => {
      const rank = toNumber(getStatValue(entry?.stats, 'playoffSeed', 'rank', 'standingSummary'), index + 1)
      const team: TeamStanding = {
        id: Number(entry?.team?.id ?? 0) || undefined,
        name: entry?.team?.displayName || 'Unknown Team',
        shortName: entry?.team?.shortDisplayName || entry?.team?.abbreviation || 'UNK',
        abbreviation: entry?.team?.abbreviation || 'UNK',
        wins: toNumber(getStatValue(entry?.stats, 'wins', 'w')),
        losses: toNumber(getStatValue(entry?.stats, 'losses', 'l')),
        winPct: toNumber(getStatValue(entry?.stats, 'winPercent', 'pct')),
        gamesBack: getStatValue(entry?.stats, 'gamesBack', 'gb'),
        streak: getStatValue(entry?.stats, 'streak', 'strk') || undefined,
        conference: group.conference,
        rank,
        seed: rank,
        logo: entry?.team?.logos?.[0]?.href || entry?.team?.logo,
      }

      if (group.conference === 'East') east.push(team)
      else west.push(team)
    })
  }

  east.sort((a, b) => a.rank - b.rank)
  west.sort((a, b) => a.rank - b.rank)
  return { east, west }
}

function splitPlayoffPicture(conference: Conference, standings: TeamStanding[]) {
  return {
    conference,
    automatic: standings.slice(0, 6),
    playIn: standings.slice(6, 10),
    chase: standings.slice(10, 15),
  }
}

function dedupeGames(games: ScoreboardGame[]): ScoreboardGame[] {
  const byId = new Map<string, ScoreboardGame>()
  for (const game of games) {
    byId.set(game.id, game)
  }
  return [...byId.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function getEspnOverview(): Promise<OverviewPayload> {
  const now = new Date()
  const fallback = makeEmptyOverview(now)

  const scoreboardDates: Date[] = []
  for (let offset = -SCOREBOARD_WINDOW_DAYS.past; offset <= SCOREBOARD_WINDOW_DAYS.future; offset += 1) {
    scoreboardDates.push(new Date(now.getTime() + offset * dayMs))
  }

  const scoreboardResponsesSettled = await Promise.allSettled(
    scoreboardDates.map((date) => fetchJson(`${ESPN_SITE_BASE}/scoreboard?dates=${toEspnDate(date)}`))
  )

  const scoreboardResponses = scoreboardResponsesSettled
    .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    .map((result) => result.value)

  scoreboardResponsesSettled
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .forEach((result) => {
      console.error('ESPN scoreboard fetch warning:', result.reason)
    })

  let standings = emptyStandings()
  try {
    const standingsRaw = await fetchJson(`${ESPN_SITE_BASE}/standings?group=7&sort=winPercent:desc`)
    standings = parseStandings(standingsRaw)
  } catch (error) {
    console.error('ESPN standings fetch warning:', error)
  }

  const allGames = dedupeGames(
    scoreboardResponses.flatMap((payload: any) => (payload?.events || []).map(parseGame))
  )

  const todayKey = now.toISOString().slice(0, 10)

  return {
    ...fallback,
    liveGames: allGames.filter((game) => game.state === 'live'),
    todayGames: allGames.filter((game) => game.date?.slice(0, 10) === todayKey),
    upcomingGames: allGames
      .filter((game) => new Date(game.date).getTime() > now.getTime() && game.state === 'pre')
      .slice(0, 12),
    recentResults: allGames
      .filter((game) => new Date(game.date).getTime() <= now.getTime() && game.state === 'post')
      .slice(-10)
      .reverse(),
    standings,
    playoffPicture: {
      east: splitPlayoffPicture('East', standings.east),
      west: splitPlayoffPicture('West', standings.west),
    },
  }
}
