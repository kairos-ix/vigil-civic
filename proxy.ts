import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = [
  '/map',
  '/dashboard',
  '/report',
  '/issues',
  '/leaderboard',
  '/profile'
]

const AUTH_ONLY = ['/login', '/register']

export function proxy(req: NextRequest) {
  const token = req.cookies.get('vigil_token')?.value
  const path = req.nextUrl.pathname

  if (PROTECTED.some(r => path.startsWith(r)) && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (AUTH_ONLY.some(r => path.startsWith(r)) && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
