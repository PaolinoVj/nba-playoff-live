import TeamHub from '@/components/TeamHub'
import { getCurrentSeasonYear } from '@/lib/nba/providers/balldontlie'

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params
  return <TeamHub initialSlug={resolved.slug} initialSeason={getCurrentSeasonYear()} />
}
