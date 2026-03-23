import { NextRequest, NextResponse } from 'next/server'
import { getBalldontlieTeamSummary, getCurrentSeasonYear } from '@/lib/nba/providers/balldontlie'
import type { TeamPhaseFilter } from '@/lib/nba/types'

export const revalidate = 300

function parseSeason(value: string | null) {
  if (!value) return getCurrentSeasonYear()
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : getCurrentSeasonYear()
}

function parsePhase(value: string | null): TeamPhaseFilter {
  if (value === 'playoffs' || value === 'all' || value === 'regular') return value
  return 'regular'
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params
  const { searchParams } = new URL(request.url)

  try {
    const payload = await getBalldontlieTeamSummary({
      slug: resolved.slug,
      season: parseSeason(searchParams.get('season')),
      phase: parsePhase(searchParams.get('phase')),
    })

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        provider: 'balldontlie + espn-public',
        generatedAt: new Date().toISOString(),
        season: parseSeason(searchParams.get('season')),
        phaseFilter: parsePhase(searchParams.get('phase')),
        team: null,
        summary: {
          totalGames: 0,
          completedGames: 0,
          wins: 0,
          losses: 0,
          homeRecord: '0-0',
          awayRecord: '0-0',
          last10: '0-0',
        },
        recentGames: [],
        upcomingGames: [],
        allGames: [],
        note: message.includes('BALLDONTLIE_API_KEY')
          ? 'Configura BALLDONTLIE_API_KEY in .env.local o su Vercel per aprire il dettaglio squadra.'
          : message,
      },
      {
        status: message.includes('BALLDONTLIE_API_KEY') ? 503 : message.includes('Squadra non trovata') ? 404 : 502,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  }
}
