import { NextRequest, NextResponse } from 'next/server'
import { getBalldontlieGames, getCurrentSeasonYear } from '@/lib/nba/providers/balldontlie'

export const revalidate = 300

function parseBoolean(value: string | null) {
  if (value === null) return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

function parseNumber(value: string | null, fallback?: number) {
  if (value === null || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  try {
    const payload = await getBalldontlieGames({
      season: parseNumber(searchParams.get('season'), getCurrentSeasonYear()),
      cursor: searchParams.get('cursor'),
      perPage: parseNumber(searchParams.get('per_page'), 100),
      teamId: parseNumber(searchParams.get('team_id')),
      postseason: parseBoolean(searchParams.get('postseason')),
      startDate: searchParams.get('start') || undefined,
      endDate: searchParams.get('end') || undefined,
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
        provider: 'balldontlie',
        generatedAt: new Date().toISOString(),
        season: parseNumber(searchParams.get('season'), getCurrentSeasonYear()),
        filters: {
          teamId: parseNumber(searchParams.get('team_id')),
          postseason: parseBoolean(searchParams.get('postseason')),
          startDate: searchParams.get('start') || undefined,
          endDate: searchParams.get('end') || undefined,
        },
        data: [],
        meta: {
          nextCursor: null,
          perPage: parseNumber(searchParams.get('per_page'), 100) ?? 100,
          returned: 0,
        },
        note: message.includes('BALLDONTLIE_API_KEY')
          ? 'Configura BALLDONTLIE_API_KEY in .env.local per interrogare lo storico partite.'
          : message,
      },
      {
        status: message.includes('BALLDONTLIE_API_KEY') ? 503 : 502,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}
