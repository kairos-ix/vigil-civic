'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon } from 'lucide-react'
import { NotificationBell } from '@/components/layout/NotificationBell'

export function Navbar() {
  const { user, logout, isLoading } = useAuth()
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/register' || pathname === '/') return null

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl backdrop-saturate-150 px-4 md:px-6 transition-all duration-300">
      <div className="flex w-full items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary group">
          <img src="/logo.png" alt="Vigil Logo" className="h-7 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
          <span className="inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Vigil</span>
        </Link>
        <div className="flex items-center gap-4">
          {!isLoading && user && (
            <>
              <NotificationBell />
              <div className="hidden flex-col items-end text-sm lg:flex">
                <span className="font-medium truncate max-w-[160px]">{user.name}</span>
                <span className="text-muted-foreground text-xs">{user.points} pts - {user.level}</span>
              </div>
              <Button variant="ghost" size="icon" asChild className="transition-transform duration-200 hover:scale-105">
                <Link href={`/profile/${user._id}`}>
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/50" />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Profile</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => logout()} className="transition-all duration-200 hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
