import { getEspnTeamLogo, teamLogos } from '@/utils/nbaTeamLogos'
import type { ApiTeam, GamesListPayload, HistoricalGame, TeamPhaseFilter, TeamSummaryPayload, TeamSummaryTeam, TeamsListPayload } from '@/lib/nba/types'
import { getEspnOverview } from '@/lib/nba/providers/espn'
import { requireServerEnv } from '@/lib/env'

const BALLDONTLIE_BASE = 'https://api.balldontlie.io/v1'
const DEFAULT_GAMES_PER_PAGE = 100
const ITALY_TIMEZONE = 'Europe/Rome'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function getCurrentSeasonYear(now = new Date()) {
  return now.getUTCMonth() >= 8 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
}

export function getCurrentSeasonLabel(now = new Date()) {
  const season = getCurrentSeasonYear(now)
  return `${season}-${String(season + 1).slice(-2)}`
}

function formatItalyDateParts(value: string) {
  const date = new Date(value)

  const dayFormatter = new Intl.DateTimeFormat('it-IT', {
    timeZone: ITALY_TIMEZONE,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })

  const timeFormatter = new Intl.DateTimeFormat('it-IT', {
    timeZone: ITALY_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  })

  const dateTimeFormatter = new Intl.DateTimeFormat('it-IT', {
    timeZone: ITALY_TIMEZONE,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    dayItaly: dayFormatter.format(date),
    timeItaly: timeFormatter.format(date),
    datetimeItaly: dateTimeFormatter.format(date),
  }
}

function getApiKey() {
  return requireServerEnv('BALLDONTLIE_API_KEY')
}

async function fetchBalldontlie(path: string, searchParams: URLSearchParams) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(`${BALLDONTLIE_BASE}${path}?${searchParams.toString()}`, {
      headers: {
        Authorization: getApiKey(),
        Accept: 'application/json',
        'User-Agent': 'nba-live-hub/3.0',
      },
      next: { revalidate: 300 },
      signal: controller.signal,
    })

    if (!response.ok) {
      const details = await response.text().catch(() => '')
      throw new Error(`BALLDONTLIE ${response.status}: ${details || 'request failed'}`)
    }

    return response.json()
  } finally {
    clearTimeout(timeout)
  }
}

function mapGame(raw: any): HistoricalGame {
  const datetime = raw?.datetime || raw?.date
  const local = formatItalyDateParts(datetime)

  return {
    id: String(raw?.id),
    season: Number(raw?.season ?? 0),
    date: raw?.date || datetime,
    datetime,
    datetimeItaly: local.datetimeItaly,
    dayItaly: local.dayItaly,
    timeItaly: local.timeItaly,
    status: raw?.status || 'Scheduled',
    period: Number(raw?.period ?? 0),
    time: raw?.time || '',
    postseason: Boolean(raw?.postseason),
    postponed: Boolean(raw?.postponed),
    homeTeamScore: Number(raw?.home_team_score ?? 0),
    visitorTeamScore: Number(raw?.visitor_team_score ?? 0),
    istStage: raw?.ist_stage ?? null,
    homeTeam: {
      id: Number(raw?.home_team?.id ?? 0),
      abbreviation: raw?.home_team?.abbreviation || 'HOME',
      name: raw?.home_team?.name || 'Home',
      fullName: raw?.home_team?.full_name || raw?.home_team?.name || 'Home',
      conference: raw?.home_team?.conference,
      division: raw?.home_team?.division,
    },
    visitorTeam: {
      id: Number(raw?.visitor_team?.id ?? 0),
      abbreviation: raw?.visitor_team?.abbreviation || 'AWAY',
      name: raw?.visitor_team?.name || 'Away',
      fullName: raw?.visitor_team?.full_name || raw?.visitor_team?.name || 'Away',
      conference: raw?.visitor_team?.conference,
      division: raw?.visitor_team?.division,
    },
  }
}

export interface GamesQueryInput {
  season?: number
  cursor?: string | null
  perPage?: number
  teamId?: number
  postseason?: boolean
  startDate?: string
  endDate?: string
}

export async function getBalldontlieGames(input: GamesQueryInput = {}): Promise<GamesListPayload> {
  const season = input.season ?? getCurrentSeasonYear()
  const perPage = Math.min(Math.max(input.perPage ?? DEFAULT_GAMES_PER_PAGE, 1), 100)

  const searchParams = new URLSearchParams()
  searchParams.append('seasons[]', String(season))
  searchParams.append('per_page', String(perPage))

  if (input.cursor) searchParams.append('cursor', input.cursor)
  if (typeof input.teamId === 'number' && !Number.isNaN(input.teamId)) {
    searchParams.append('team_ids[]', String(input.teamId))
  }
  if (typeof input.postseason === 'boolean') {
    const flag = input.postseason ? 'true' : 'false'
    searchParams.append('postseason', flag)
    searchParams.append('posteason', flag)
  }
  if (input.startDate) searchParams.append('start_date', input.startDate)
  if (input.endDate) searchParams.append('end_date', input.endDate)

  const payload = await fetchBalldontlie('/games', searchParams)
  const rawGames = Array.isArray(payload?.data) ? payload.data : []
  const games = rawGames
    .map(mapGame)
    .sort((a: HistoricalGame, b: HistoricalGame) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())

  return {
    provider: 'balldontlie',
    generatedAt: new Date().toISOString(),
    season,
    filters: {
      teamId: input.teamId,
      postseason: input.postseason,
      startDate: input.startDate,
      endDate: input.endDate,
    },
    data: games,
    meta: {
      nextCursor: typeof payload?.meta?.next_cursor === 'number' ? payload.meta.next_cursor : null,
      perPage: Number(payload?.meta?.per_page ?? perPage),
      returned: games.length,
    },
  }
}

export function getSeasonStartDateLabel(season: number) {
  return `${season}-${pad(10)}-${pad(1)}`
}

function mapTeam(raw: any): ApiTeam {
  return {
    id: Number(raw?.id ?? 0),
    abbreviation: raw?.abbreviation || 'UNK',
    name: raw?.name || 'Unknown',
    fullName: raw?.full_name || raw?.name || 'Unknown Team',
    conference: raw?.conference,
    division: raw?.division,
  }
}

export async function getBalldontlieTeams(): Promise<TeamsListPayload> {
  const payload = await fetchBalldontlie('/teams', new URLSearchParams())
  const teams = Array.isArray(payload?.data) ? payload.data.map(mapTeam) : []

  return {
    provider: 'balldontlie',
    generatedAt: new Date().toISOString(),
    data: teams.sort((a: ApiTeam, b: ApiTeam) => a.abbreviation.localeCompare(b.abbreviation)),
  }
}

function normalizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function matchTeamFromSlug(teams: ApiTeam[], slug: string): ApiTeam | null {
  const normalized = normalizeSlug(slug)
  return (
    teams.find((team) => normalizeSlug(team.abbreviation) === normalized) ||
    teams.find((team) => normalizeSlug(team.fullName) === normalized) ||
    teams.find((team) => normalizeSlug(team.name) === normalized) ||
    null
  )
}

function isFinished(game: HistoricalGame) {
  const status = game.status.toLowerCase()
  return status.includes('final') || status.includes('ft')
}

function isUpcoming(game: HistoricalGame, now: number) {
  return !isFinished(game) && new Date(game.datetime).getTime() >= now
}

function teamWon(game: HistoricalGame, abbreviation: string) {
  if (!isFinished(game)) return false
  if (game.homeTeam.abbreviation === abbreviation) return game.homeTeamScore > game.visitorTeamScore
  if (game.visitorTeam.abbreviation === abbreviation) return game.visitorTeamScore > game.homeTeamScore
  return false
}

function buildTeamWithLogo(team: ApiTeam): TeamSummaryTeam {
  return {
    ...team,
    logo: teamLogos[team.abbreviation] || getEspnTeamLogo(team.abbreviation),
  }
}

export async function getBalldontlieTeamSummary(input: { slug: string; season?: number; phase?: TeamPhaseFilter }): Promise<TeamSummaryPayload> {
  const season = input.season ?? getCurrentSeasonYear()
  const phase = input.phase ?? 'regular'
  const teamsPayload = await getBalldontlieTeams()
  const foundTeam = matchTeamFromSlug(teamsPayload.data, input.slug)

  if (!foundTeam) {
    throw new Error(`Squadra non trovata per slug: ${input.slug}`)
  }

  const allGames: HistoricalGame[] = []
  let cursor: string | null = null

  for (let page = 0; page < 3; page += 1) {
    const gamesPayload = await getBalldontlieGames({
      season,
      teamId: foundTeam.id,
      perPage: 100,
      cursor,
      postseason: phase === 'all' ? undefined : phase === 'playoffs',
    })

    allGames.push(...gamesPayload.data)
    cursor = gamesPayload.meta.nextCursor ? String(gamesPayload.meta.nextCursor) : null

    if (!cursor) break
  }

  const dedupedGames = [...new Map(allGames.map((game) => [game.id, game])).values()]
  const now = Date.now()
  const chronologicalGames = [...dedupedGames].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  )
  const completedGames = chronologicalGames.filter(isFinished)
  const recentGames = [...completedGames].reverse().slice(0, 10)
  const upcomingGames = chronologicalGames.filter((game) => isUpcoming(game, now)).slice(0, 10)

  const abbreviation = foundTeam.abbreviation
  let wins = 0
  let losses = 0
  let homeWins = 0
  let homeLosses = 0
  let awayWins = 0
  let awayLosses = 0

  for (const game of completedGames) {
    const won = teamWon(game, abbreviation)
    const isHomeTeam = game.homeTeam.abbreviation === abbreviation

    if (won) wins += 1
    else losses += 1

    if (isHomeTeam) {
      if (won) homeWins += 1
      else homeLosses += 1
    } else {
      if (won) awayWins += 1
      else awayLosses += 1
    }
  }

  const last10Slice = recentGames.slice(0, 10)
  const last10Wins = last10Slice.filter((game) => teamWon(game, abbreviation)).length
  const last10Losses = Math.max(last10Slice.length - last10Wins, 0)

  let standingsEntry
  try {
    const overview = await getEspnOverview()
    standingsEntry = [...overview.standings.east, ...overview.standings.west].find(
      (team) => team.abbreviation === abbreviation
    )
  } catch (error) {
    console.error('Team standings lookup warning:', error)
  }

  return {
    provider: 'balldontlie + espn-public',
    generatedAt: new Date().toISOString(),
    season,
    phaseFilter: phase,
    team: buildTeamWithLogo(foundTeam),
    standingsEntry,
    summary: {
      totalGames: chronologicalGames.length,
      completedGames: completedGames.length,
      wins,
      losses,
      homeRecord: `${homeWins}-${homeLosses}`,
      awayRecord: `${awayWins}-${awayLosses}`,
      last10: `${last10Wins}-${last10Losses}`,
    },
    recentGames,
    upcomingGames,
    allGames: [...chronologicalGames].reverse(),
    note: 'Dettaglio squadra interrogato on demand: storico partite da balldontlie, contesto classifica da ESPN.',
  }
}
