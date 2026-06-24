'use client'

import { User } from '@/types'
import { LevelBadge } from './LevelBadge'
import { PointsBadge } from './PointsBadge'
import { User as UserIcon } from 'lucide-react'

interface LeaderboardProps {
  users: User[]
  isLoading?: boolean
}

export function Leaderboard({ users, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border bg-card p-4 animate-pulse">
            <div className="h-6 w-6 rounded bg-muted" />
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
            <div className="h-6 w-16 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        No leaderboard data available
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <div 
          key={user._id} 
          className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md"
        >
          <div className="flex h-8 w-8 items-center justify-center font-bold text-muted-foreground">
            {index === 0 && '🥇'}
            {index === 1 && '🥈'}
            {index === 2 && '🥉'}
            {index > 2 && `#${index + 1}`}
          </div>
          
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <div className="flex flex-1 flex-col">
            <span className="font-semibold">{user.name}</span>
            <div className="flex items-center gap-2 mt-1">
              <LevelBadge level={user.level} />
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                {user.stats?.reportsSubmitted || 0} reports
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <PointsBadge points={user.points} />
            <div className="flex gap-1">
              {user.badges?.slice(0, 3).map((badge, i) => (
                <span key={i} title={badge.name} className="text-sm">
                  {badge.icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
