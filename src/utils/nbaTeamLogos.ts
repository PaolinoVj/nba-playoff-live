const NBA_TEAM_ABBREVIATIONS = [
  'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DET', 'IND', 'MIA', 'MIL', 'NYK', 'ORL', 'PHI', 'TOR', 'WAS',
  'DAL', 'DEN', 'GSW', 'HOU', 'LAC', 'LAL', 'MEM', 'MIN', 'NOP', 'OKC', 'PHX', 'POR', 'SAC', 'SAS', 'UTA',
] as const

export function getEspnTeamLogo(abbreviation: string) {
  return `https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/${abbreviation.toLowerCase()}.png`
}

export const teamLogos: Record<string, string> = Object.fromEntries(
  NBA_TEAM_ABBREVIATIONS.map((abbreviation) => [abbreviation, getEspnTeamLogo(abbreviation)])
)
