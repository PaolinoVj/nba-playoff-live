import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'nba-live-hub',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/nba/overview', '/api/nba/health'],
  })
}
