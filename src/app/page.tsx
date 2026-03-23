import DashboardClient from '@/components/DashboardClient'
import { getEspnOverview, makeEmptyOverview } from '@/lib/nba/providers/espn'

export const dynamic = 'force-dynamic'

export const revalidate = 60

export default async function HomePage() {
  try {
    const data = await getEspnOverview()
    return <DashboardClient initialData={data} />
  } catch (error) {
    console.error('HomePage fallback activated:', error)
    return <DashboardClient initialData={makeEmptyOverview()} />
  }
}
