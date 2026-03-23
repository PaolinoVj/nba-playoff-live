import { DEFAULT_REVALIDATE_SECONDS, ESPN_SITE_BASE, SCOREBOARD_WINDOW_DAYS } from '@/lib/nba/constants'
import type { Conference, OverviewPayload, ScoreboardGame, TeamStanding, SeasonPhase } from '@/lib/nba/types'

const dayMs = 24 * 60 * 60 * 1000

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
          'User-Agent': 'nba-live-hub/1.1',
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

function getStatValue(stats: any[], name: string): string | undefined {
  const hit = stats?.find((entry: any) => entry.name === name)
  return hit?.displayValue ?? hit?.value?.toString()
}

function parseStandings(data: any): { east: TeamStanding[]; west: TeamStanding[] } {
  const east: TeamStanding[] = []
  const west: TeamStanding[] = []

  const children = Array.isArray(data?.children) ? data.children : []
  for (const conference of children) {
    const confName: Conference = conference?.name === 'WEST' ? 'West' : 'East'
    const entries = conference?.standings?.entries || []

    entries.forEach((entry: any, index: number) => {
      const team: TeamStanding = {
        name: entry?.team?.displayName || 'Unknown Team',
        shortName: entry?.team?.shortDisplayName || entry?.team?.abbreviation || 'UNK',
        abbreviation: entry?.team?.abbreviation || 'UNK',
        wins: Number(getStatValue(entry?.stats, 'wins') || 0),
        losses: Number(getStatValue(entry?.stats, 'losses') || 0),
        winPct: Number(getStatValue(entry?.stats, 'winPercent') || 0),
        gamesBack: getStatValue(entry?.stats, 'gamesBack') || getStatValue(entry?.stats, 'playoffSeed'),
        streak: getStatValue(entry?.stats, 'streak') || undefined,
        conference: confName,
        rank: index + 1,
        logo: entry?.team?.logos?.[0]?.href || entry?.team?.logo,
      }

      if (confName === 'East') east.push(team)
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
