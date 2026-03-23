import { NextResponse } from 'next/server'
import { getBalldontlieTeams } from '@/lib/nba/providers/balldontlie'

export const dynamic = 'force-dynamic'

export const revalidate = 86400

export async function GET() {
  try {
    const payload = await getBalldontlieTeams()
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        provider: 'balldontlie',
        generatedAt: new Date().toISOString(),
        data: [],
        note: message.includes('BALLDONTLIE_API_KEY')
          ? 'Configura BALLDONTLIE_API_KEY in .env.local per leggere il catalogo squadre.'
          : message,
      },
      {
        status: message.includes('BALLDONTLIE_API_KEY') ? 503 : 502,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  }
}
