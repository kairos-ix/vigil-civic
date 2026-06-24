'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { User, Issue } from '@/types'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { PointsBadge } from '@/components/gamification/PointsBadge'
import { IssueCard } from '@/components/issues/IssueCard'
import { User as UserIcon, Calendar, Activity, CheckCircle2, FileWarning, ThumbsUp, Shield } from 'lucide-react'
import { format } from 'date-fns'

export default function ProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndIssues = async () => {
      try {
        const [userRes, issuesRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          // We can reuse the issues API to fetch issues by this user (client side filter for now, or just show all if API doesn't support filter by user. The API doesn't have a reportedBy filter, so we will fetch all and filter client side for the demo)
          fetch(`/api/issues?limit=50`)
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)
        }
        
        if (issuesRes.ok) {
          const issuesData = await issuesRes.json()
          // Filter issues reported by this user
          const userIssues = issuesData.issues.filter((i: any) => 
            (typeof i.reportedBy === 'string' ? i.reportedBy : i.reportedBy?._id) === id
          )
          setRecentIssues(userIssues)
        }
      } catch (error) {
        console.error('Failed to fetch profile', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchUserAndIssues()
  }, [id])

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading profile...</div>
  }

  if (!user) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">User not found</div>
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-in fade-in duration-500">
      
      {/* Profile Header */}
      <div className="rounded-2xl border bg-card p-6 md:p-10 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-md overflow-hidden">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-16 w-16 text-primary" />
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{user.name}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <LevelBadge level={user.level} className="px-3 py-1 text-sm" />
              <PointsBadge points={user.points} className="px-3 py-1 text-sm" />
              {user.city && (
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {user.ward ? `${user.ward}, ` : ''}{user.city}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Stats & Badges */}
        <div className="space-y-8">
          
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <h3 className="font-semibold">Activity Stats</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
                <span className="text-2xl font-bold text-blue-600">{user.stats?.reportsSubmitted || 0}</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><FileWarning className="h-3 w-3" /> Reports</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
                <span className="text-2xl font-bold text-emerald-600">{user.stats?.issuesVerified || 0}</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
                <span className="text-2xl font-bold text-amber-600">{user.stats?.upvotesGiven || 0}</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> Upvotes</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
                <span className="text-2xl font-bold text-violet-600">{user.stats?.issuesResolved || 0}</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Shield className="h-3 w-3" /> Fixed</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-semibold">Earned Badges ({user.badges?.length || 0})</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {user.badges && user.badges.length > 0 ? (
                user.badges.map((badge, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-3 rounded-lg border bg-muted/30 w-[80px] text-center" title={format(new Date(badge.earnedAt), 'MMM d, yyyy')}>
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <span className="text-[10px] font-medium leading-tight">{badge.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground w-full text-center py-4">No badges earned yet.</p>
              )}
            </div>
          </div>
          
        </div>

        {/* Right Col: Recent Issues */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Recent Reports</h2>
          
          {recentIssues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentIssues.map(issue => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-card text-muted-foreground text-sm">
              No issues reported yet.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
