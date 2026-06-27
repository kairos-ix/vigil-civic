'use client'

import { Leaderboard } from '@/components/gamification/Leaderboard'
import { useState, useEffect, useCallback } from 'react'
import { User } from '@/types'
import { Trophy, Star, Shield } from 'lucide-react'
import { POINTS } from '@/lib/constants'

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/users/leaderboard')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Refetch on page focus for fresh rankings
  useEffect(() => {
    const onFocus = () => fetchLeaderboard()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchLeaderboard])

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center mb-10 space-y-4">
        <div className="rounded-full bg-primary/10 p-4 text-primary ring-4 ring-primary/5">
          <Trophy className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Leaderboard</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Top civic contributors this week.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-[var(--radius-card)] border bg-card p-4 text-center surface-flat">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Star className="h-5 w-5" />
          </div>
          <div className="font-semibold text-lg">Report</div>
          <p className="text-xs text-muted-foreground mt-1">Report an issue (+{POINTS.REPORT})</p>
        </div>
        <div className="rounded-[var(--radius-card)] border bg-card p-4 text-center surface-flat">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div className="font-semibold text-lg">Verify</div>
          <p className="text-xs text-muted-foreground mt-1">Verify an issue (+{POINTS.VERIFY})</p>
        </div>
        <div className="rounded-[var(--radius-card)] border bg-card p-4 text-center surface-flat">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="font-semibold text-lg">Resolved</div>
          <p className="text-xs text-muted-foreground mt-1">Issue gets resolved (+{POINTS.RESOLVED})</p>
        </div>
      </div>

      <div className="rounded-[var(--radius-panel)] border bg-card p-1 surface-raised">
        <Leaderboard users={users} isLoading={loading} />
      </div>
    </div>
  )
}
