export type Conference = 'East' | 'West'
export type SeasonPhase = 'preseason' | 'regular' | 'playoffs' | 'offseason'

export interface TeamStanding {
  id?: number
  name: string
  shortName: string
  abbreviation: string
  wins: number
  losses: number
  winPct: number
  gamesBack?: string
  streak?: string
  conference: Conference
  rank: number
  logo?: string
}

export interface GameTeam {
  name: string
  abbreviation: string
  score?: string
  logo?: string
  winner?: boolean
}

export interface ScoreboardGame {
  id: string
  date: string
  status: string
  state: 'pre' | 'live' | 'post'
  period?: string
  clock?: string
  broadcast?: string
  venue?: string
  seriesSummary?: string
  away: GameTeam
  home: GameTeam
}

export interface PlayoffPicture {
  conference: Conference
  automatic: TeamStanding[]
  playIn: TeamStanding[]
  chase: TeamStanding[]
}

export interface OverviewPayload {
  generatedAt: string
  provider: string
  seasonLabel: string
  phase: SeasonPhase
  liveGames: ScoreboardGame[]
  todayGames: ScoreboardGame[]
  upcomingGames: ScoreboardGame[]
  recentResults: ScoreboardGame[]
  standings: {
    east: TeamStanding[]
    west: TeamStanding[]
  }
  playoffPicture: {
    east: PlayoffPicture
    west: PlayoffPicture
  }
}

export interface HistoricalGameTeam {
  id: number
  abbreviation: string
  name: string
  fullName: string
  conference?: string
  division?: string
}


export interface ApiTeam {
  id: number
  abbreviation: string
  name: string
  fullName: string
  conference?: string
  division?: string
}

export interface TeamsListPayload {
  provider: string
  generatedAt: string
  data: ApiTeam[]
  note?: string
}

export interface HistoricalGame {
  id: string
  season: number
  date: string
  datetime: string
  datetimeItaly: string
  dayItaly: string
  timeItaly: string
  status: string
  period: number
  time: string
  postseason: boolean
  postponed: boolean
  homeTeamScore: number
  visitorTeamScore: number
  homeTeam: HistoricalGameTeam
  visitorTeam: HistoricalGameTeam
  istStage?: string | null
}

export interface GamesListPayload {
  provider: string
  generatedAt: string
  season: number
  filters: {
    teamId?: number
    postseason?: boolean
    startDate?: string
    endDate?: string
  }
  data: HistoricalGame[]
  meta: {
    nextCursor: number | null
    perPage: number
    returned: number
  }
  note?: string
}

export interface StandingsSnapshotPayload {
  provider: string
  generatedAt: string
  seasonLabel: string
  phase: SeasonPhase
  standings: {
    east: TeamStanding[]
    west: TeamStanding[]
  }
  playoffPicture: {
    east: PlayoffPicture
    west: PlayoffPicture
  }
  note?: string
}
