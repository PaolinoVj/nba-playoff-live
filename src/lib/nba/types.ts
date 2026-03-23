export type Conference = 'East' | 'West'
export type SeasonPhase = 'preseason' | 'regular' | 'playoffs' | 'offseason'

export interface TeamStanding {
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
