'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Map as MapIcon,
  AlertTriangle,
  Trophy,
  Plus
} from 'lucide-react'

const routes = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/map', label: 'Map', icon: MapIcon },
  { href: '/issues', label: 'Issues', icon: AlertTriangle },
  { href: '/leaderboard', label: 'Rank', icon: Trophy },
]

export function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/register' || pathname === '/') return null

  return (
    <>
      {/* Floating Action Button for reporting */}
      {pathname !== '/report' && (
        <Link
          href="/report"
          className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Report Issue</span>
        </Link>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 z-30 flex h-16 w-full border-t bg-background md:hidden">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.href
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                isActive ? "bg-primary/10" : ""
              )}>
                <Icon className={cn("h-5 w-5", isActive ? "fill-primary/20" : "")} />
              </div>
              {route.label}
            </Link>
          )
        })}
      </nav>
      {/* Safe area padding for mobile */}
      <div className="h-16 w-full md:hidden" />
    </>
  )
}
