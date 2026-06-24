'use client'

import { Leaderboard } from '@/components/gamification/Leaderboard'
import { useState, useEffect } from 'react'
import { User } from '@/types'
import { Trophy, Star, Shield } from 'lucide-react'

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
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
    }
    
    fetchLeaderboard()
  }, [])

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center mb-10 space-y-4">
        <div className="p-4 bg-amber-100 rounded-full text-amber-600 ring-4 ring-amber-50 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-900/20">
          <Trophy className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Community Leaderboard</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Recognizing the most active citizens keeping our city infrastructure safe and well-maintained.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
            <Star className="h-5 w-5" />
          </div>
          <div className="font-semibold text-lg">Report</div>
          <p className="text-xs text-muted-foreground mt-1">10 pts per issue</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <Shield className="h-5 w-5" />
          </div>
          <div className="font-semibold text-lg">Verify</div>
          <p className="text-xs text-muted-foreground mt-1">5 pts per verification</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 mb-2">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="font-semibold text-lg">Resolution</div>
          <p className="text-xs text-muted-foreground mt-1">25 pts when fixed</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm p-1">
        <Leaderboard users={users} isLoading={loading} />
      </div>
    </div>
  )
}
