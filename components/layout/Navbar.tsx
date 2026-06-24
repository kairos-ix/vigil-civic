'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon } from 'lucide-react'

export function Navbar() {
  const { user, logout, isLoading } = useAuth()
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/register' || pathname === '/') return null

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex w-full items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span className="hidden md:inline-block">Vigil</span>
        </Link>
        <div className="flex items-center gap-4">
          {!isLoading && user && (
            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end text-sm md:flex">
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground">{user.points} pts • {user.level}</span>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/profile/${user._id}`}>
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Profile</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => logout()}>
                <LogOut className="h-5 w-5 text-destructive" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
