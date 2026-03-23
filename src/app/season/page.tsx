import SeasonExplorer from '@/components/SeasonExplorer'
import { getCurrentSeasonYear } from '@/lib/nba/providers/balldontlie'

export default function SeasonPage() {
  return <SeasonExplorer initialSeason={getCurrentSeasonYear()} />
}
