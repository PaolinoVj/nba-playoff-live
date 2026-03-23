import { NextResponse } from 'next/server'
import { getEspnOverview, makeEmptyOverview } from '@/lib/nba/providers/espn'

export const revalidate = 60

export async function GET() {
  try {
    const payload = await getEspnOverview()
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Overview route fallback activated:', error)
    return NextResponse.json(makeEmptyOverview(), {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=120',
      },
    })
  }
}
