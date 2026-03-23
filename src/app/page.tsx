import DashboardClient from '@/components/DashboardClient'
import { getEspnOverview } from '@/lib/nba/providers/espn'

export const revalidate = 60

function makeFallbackOverview() {
  return {
    generatedAt: new Date().toISOString(),
    provider: 'espn-public',
    seasonLabel: '2025-26',
    phase: 'regular' as const,
    liveGames: [],
    todayGames: [],
    upcomingGames: [],
    recentResults: [],
    standings: {
      east: [],
      west: [],
    },
    playoffPicture: {
      east: {
        conference: 'East' as const,
        automatic: [],
        playIn: [],
        chase: [],
      },
      west: {
        conference: 'West' as const,
        automatic: [],
        playIn: [],
        chase: [],
      },
    },
  }
}

export default async function HomePage() {
  try {
    const data = await getEspnOverview()
    return <DashboardClient initialData={data} />
  } catch (error) {
    console.error('HomePage ESPN fallback:', error)
    return <DashboardClient initialData={makeFallbackOverview()} />
  }
}