import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SERVER_SECRET = process.env.INTERNAL_API_SECRET || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Allow requests that include the internal server secret header
  const internalSecret = req.headers.get('x-internal-secret') || ''
  if (internalSecret && SERVER_SECRET && internalSecret === SERVER_SECRET) {
    return NextResponse.next()
  }

  // Check Origin / Referer headers and only allow our app origin (or localhost for dev)
  const origin = req.headers.get('origin') || ''
  const referer = req.headers.get('referer') || ''

  const allowedOrigins = new Set([
    APP_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean))

  const isOriginAllowed = Array.from(allowedOrigins).some(o => o && (origin.startsWith(o) || referer.startsWith(o)))

  if (isOriginAllowed) {
    return NextResponse.next()
  }

  return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config = {
  matcher: '/api/:path*',
}
