import { NextResponse } from 'next/server'
import { getServerEnv } from '@/lib/env'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'nba-live-hub',
    timestamp: new Date().toISOString(),
    providers: {
      balldontlieConfigured: Boolean(getServerEnv('BALLDONTLIE_API_KEY')),
    },
    endpoints: ['/api/nba/overview', '/api/nba/health'],
  })
}
