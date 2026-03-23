import type { ApiTeam, GamesListPayload, HistoricalGame, TeamsListPayload } from '@/lib/nba/types'

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
  const key = process.env.BALLDONTLIE_API_KEY
  if (!key) {
    throw new Error('BALLDONTLIE_API_KEY mancante')
  }
  return key
}

async function fetchBalldontlie(path: string, searchParams: URLSearchParams) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(`${BALLDONTLIE_BASE}${path}?${searchParams.toString()}`, {
      headers: {
        Authorization: getApiKey(),
        Accept: 'application/json',
        'User-Agent': 'nba-live-hub/2.0',
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
