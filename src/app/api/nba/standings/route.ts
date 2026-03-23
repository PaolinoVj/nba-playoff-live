import { NextResponse } from 'next/server'
import { getEspnOverview } from '@/lib/nba/providers/espn'

export const revalidate = 300

export async function GET() {
  try {
    const overview = await getEspnOverview()

    return NextResponse.json(
      {
        provider: 'espn-public',
        generatedAt: overview.generatedAt,
        seasonLabel: overview.seasonLabel,
        phase: overview.phase,
        standings: overview.standings,
        playoffPicture: overview.playoffPicture,
        note: 'Standings correnti servite via ESPN. Storico partite servito via balldontlie.',
      },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        provider: 'espn-public',
        generatedAt: new Date().toISOString(),
        seasonLabel: '',
        phase: 'regular',
        standings: { east: [], west: [] },
        playoffPicture: {
          east: { conference: 'East', automatic: [], playIn: [], chase: [] },
          west: { conference: 'West', automatic: [], playIn: [], chase: [] },
        },
        note: error instanceof Error ? error.message : 'Standings unavailable',
      },
      {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  }
}
