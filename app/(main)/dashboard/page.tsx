'use client'

import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { TrendingIssues } from '@/components/dashboard/TrendingIssues'
import { DashboardStats, InfrastructureAlert, Issue } from '@/types'
import { AlertCircle, CheckCircle2, Clock, FileWarning } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<InfrastructureAlert[]>([])
  const [trending, setTrending] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, alertsRes, trendingRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/alerts'),
          fetch('/api/dashboard/trending')
        ])

        if (statsRes.ok) setStats(await statsRes.json())
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          setAlerts(alertsData.alerts)
        }
        if (trendingRes.ok) {
          const trendingData = await trendingRes.json()
          setTrending(trendingData.issues)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-base">City-wide overview and infrastructure alerts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Reported"
          value={stats ? stats.total : '-'}
          icon={<FileWarning />}
          description="All time issues"
          className="border-blue-100 dark:border-blue-900/50"
        />
        <StatsCard
          title="In Progress"
          value={stats ? stats.in_progress : '-'}
          icon={<Clock className="text-amber-500" />}
          description="Currently being addressed"
          className="border-amber-100 dark:border-amber-900/50"
        />
        <StatsCard
          title="Resolved"
          value={stats ? stats.resolved : '-'}
          icon={<CheckCircle2 className="text-emerald-500" />}
          trend={{ value: 12, label: "from last month", positive: true }}
          className="border-emerald-100 dark:border-emerald-900/50"
        />
        <StatsCard
          title="Active Alerts"
          value={stats ? stats.activeAlerts : '-'}
          icon={<AlertCircle className="text-destructive" />}
          description="High severity clusters"
          className="border-red-100 dark:border-red-900/50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm lg:col-span-4 overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
            <h3 className="font-semibold leading-none tracking-tight">Active Infrastructure Alerts</h3>
            <p className="text-sm text-muted-foreground">AI-detected clusters requiring immediate attention.</p>
          </div>
          <div className="p-6">
            <AlertsPanel alerts={alerts} isLoading={loading} />
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm lg:col-span-3 overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
            <h3 className="font-semibold leading-none tracking-tight">Issues by Category</h3>
            <p className="text-sm text-muted-foreground">Distribution of reported problems.</p>
          </div>
          <div className="p-6">
            {stats ? (
              <CategoryChart data={stats.byCategory} />
            ) : (
              <div className="h-[300px] bg-muted/20 animate-pulse rounded-lg" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trending Issues</h2>
          <p className="text-muted-foreground mt-1">High priority problems voted by the community.</p>
        </div>
        <TrendingIssues issues={trending} isLoading={loading} />
      </div>
    </div>
  )
}
