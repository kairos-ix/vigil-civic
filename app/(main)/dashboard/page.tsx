'use client'

import { useEffect, useState, useCallback } from 'react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { TrendingIssues } from '@/components/dashboard/TrendingIssues'
import { DashboardStats, InfrastructureAlert, Issue } from '@/types'
import { AlertCircle, CheckCircle2, Clock, FileWarning, MapPin } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { CustomSelect } from '@/components/ui/custom-select'

const CITIES = [
  { name: 'My Location', lat: 0, lng: 0 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<InfrastructureAlert[]>([])
  const [trending, setTrending] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCityName, setSelectedCityName] = useState(CITIES[0].name)
  const { lat: geoLat, lng: geoLng, getLocation } = useGeolocation()

  useEffect(() => {
    getLocation()
  }, [getLocation])

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const city = CITIES.find(c => c.name === selectedCityName) || CITIES[0]
      let fetchLat = city.lat
      let fetchLng = city.lng

      if (selectedCityName === 'My Location') {
        if (geoLat && geoLng) {
          fetchLat = geoLat
          fetchLng = geoLng
        } else {
          fetchLat = 0
          fetchLng = 0
        }
      }

      const query = fetchLat && fetchLng ? `?lat=${fetchLat}&lng=${fetchLng}&radius=20000` : ''

      const [statsRes, alertsRes, trendingRes] = await Promise.all([
        fetch(`/api/dashboard/stats${query}`),
        fetch(`/api/dashboard/alerts${query}`),
        fetch(`/api/dashboard/trending${query}`)
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
  }, [selectedCityName, geoLat, geoLng])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Refetch on page focus for fresh stats
  useEffect(() => {
    const onFocus = () => fetchDashboardData()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchDashboardData])

  const resolvedTrend = stats && stats.resolved > 0 && stats.resolvedThisMonth > 0
    ? {
        value: Math.round((stats.resolvedThisMonth / Math.max(stats.resolved, 1)) * 100),
        label: 'resolved this month',
        positive: true,
      }
    : undefined

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-base">Real-time overview of city infrastructure.</p>
        </div>
        <div className="flex w-full shrink-0 items-center gap-2 md:w-auto md:min-w-[11rem]">
          <CustomSelect 
            value={selectedCityName}
            onChange={(val) => setSelectedCityName(val)}
            options={CITIES.map(c => ({ 
              value: c.name, 
              label: c.name,
              icon: <MapPin className="h-4 w-4" /> 
            }))}
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Reported"
          value={stats ? stats.total : '-'}
          icon={<FileWarning />}
          description="All time issues"
          className="border-primary/10"
        />
        <StatsCard
          title="In Progress"
          value={stats ? stats.in_progress : '-'}
          icon={<Clock className="text-primary" />}
          description="Currently being addressed"
          className="border-primary/10"
        />
        <StatsCard
          title="Resolved"
          value={stats ? stats.resolved : '-'}
          icon={<CheckCircle2 className="text-primary" />}
          trend={resolvedTrend}
          description={stats && stats.resolved === 0 ? 'No completed fixes yet' : 'Civic problems fixed'}
          className="border-primary/10"
        />
        <StatsCard
          title="Active Alerts"
          value={stats ? stats.activeAlerts : '-'}
          icon={<AlertCircle className="text-primary" />}
          description="High severity clusters"
          className="border-primary/10"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
        <div className="rounded-[var(--radius-panel)] border bg-card text-card-foreground surface-flat md:col-span-4 overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/30">
            <h3 className="font-semibold leading-none tracking-tight">Active Infrastructure Alerts</h3>
            <p className="text-sm text-muted-foreground">Systemic issues requiring immediate city attention.</p>
          </div>
          <div className="p-6">
            <AlertsPanel alerts={alerts} isLoading={loading} />
          </div>
        </div>
        
        <div className="rounded-[var(--radius-panel)] border bg-card text-card-foreground surface-flat md:col-span-3 overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/30">
            <h3 className="font-semibold leading-none tracking-tight">Issues By Category</h3>
            <p className="text-sm text-muted-foreground">Breakdown of all reported problems.</p>
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
          <p className="text-muted-foreground mt-1">Top verified reports in your area.</p>
        </div>
        <TrendingIssues issues={trending} isLoading={loading} />
      </div>
    </div>
  )
}
