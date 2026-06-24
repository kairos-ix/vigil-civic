'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Map as MapIcon,
  AlertTriangle,
  Trophy,
  PlusCircle
} from 'lucide-react'

const routes = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map', label: 'Live Map', icon: MapIcon },
  { href: '/issues', label: 'All Issues', icon: AlertTriangle },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
]

export function Sidebar() {
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/register' || pathname === '/') return null

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {routes.map((route) => {
          const Icon = route.icon
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === route.href ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {route.label}
            </Link>
          )
        })}
        <div className="mt-auto pt-4">
          <Link
            href="/report"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90"
          >
            <PlusCircle className="h-5 w-5" />
            Report Issue
          </Link>
        </div>
      </nav>
    </aside>
  )
}
