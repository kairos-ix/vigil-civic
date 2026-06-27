'use client'

import Link from 'next/link'
import { User } from '@/types'
import { LevelBadge } from './LevelBadge'
import { PointsBadge } from './PointsBadge'
import { cn } from '@/lib/utils'

interface LeaderboardProps {
  users: User[]
  isLoading?: boolean
}

function avatarFor(user: User) {
  return user.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(user._id || user.email || user.name)}&backgroundColor=e8f6fb,dcebf2,ffffff&shapeColor=0787b7,3aa7c5,0c5f82`
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black surface-flat',
        rank <= 3 ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground'
      )}
    >
      #{rank}
    </div>
  )
}

export function Leaderboard({ users, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-[var(--radius-card)] border bg-card p-4 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-muted" />
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
      <div className="flex h-32 items-center justify-center rounded-[var(--radius-card)] border border-dashed text-sm text-muted-foreground">
        No leaderboard data available
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => {
        const rank = index + 1

        return (
          <Link
            key={user._id}
            href={`/profile/${user._id}`}
            className={cn(
              'flex items-center gap-4 rounded-[var(--radius-card)] border bg-card p-4 transition-all hover-lift',
              rank <= 3 && 'bg-primary/5'
            )}
          >
            <RankBadge rank={rank} />

            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarFor(user)} alt={`${user.name} avatar`} className="h-full w-full object-cover" />
            </div>

            <div className="flex flex-1 flex-col">
              <span className="font-semibold">{user.name}</span>
              <div className="mt-1 flex items-center gap-2">
                <LevelBadge level={user.level} />
                <span className="hidden text-xs text-muted-foreground sm:inline-block">
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
          </Link>
        )
      })}
    </div>
  )
}
