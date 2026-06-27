'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { User, LogOut, Bell } from 'lucide-react'

export function AboutNav() {
  const { user, isLoading, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="flex items-center gap-3 sm:gap-5">
      <Link href="/about" className="focus-ring rounded-md px-2 py-2 text-sm font-semibold text-primary">About</Link>
      {!mounted || isLoading ? (
        <div className="h-8 w-20 rounded bg-muted animate-pulse" />
      ) : user ? (
        <>
          <Link href="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-muted transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </div>
            <span className="hidden sm:inline">{user.points} pts</span>
          </Link>
          <button onClick={logout} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </>
      ) : (
        <>
          <Button variant="ghost" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </>
      )}
    </nav>
  )
}