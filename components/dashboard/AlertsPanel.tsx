'use client'

import { InfrastructureAlert } from '@/types'
import { SEVERITY_COLORS, CATEGORIES, formatCategory } from '@/lib/constants'
import { AlertTriangle, CheckCircle2, MapPin, Radar, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface AlertsPanelProps {
  alerts: InfrastructureAlert[]
  isLoading?: boolean
}

export function AlertsPanel({ alerts, isLoading }: AlertsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[var(--radius-panel)] border bg-secondary/60 p-6 text-center surface-flat">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary surface-raised">
          <Radar className="h-7 w-7" />
        </div>
        <h4 className="text-lg font-bold text-foreground">No infrastructure clusters need escalation.</h4>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Vigil is watching for repeated high-severity reports. Your city board is calm right now.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-primary surface-flat">
            <CheckCircle2 className="h-4 w-4" />
            Live monitoring active
          </div>
          <Button asChild variant="outline" size="sm" className="min-h-10">
            <Link href="/issues">Review all reports</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const category = CATEGORIES.find(c => c.value === alert.category)
        const color = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.high

        return (
          <div 
            key={alert._id} 
            className="overflow-hidden rounded-[var(--radius-card)] border bg-card surface-flat transition-all hover:surface-raised"
          >
            <div 
              className="flex items-center gap-2 px-4 py-2 border-b"
              style={{ backgroundColor: `${color}15` }}
            >
              <AlertTriangle className="h-4 w-4" style={{ color }} />
              <h4 className="font-semibold" style={{ color }}>
                Cluster Alert: {category?.label || formatCategory(alert.category)}
              </h4>
              <span className="ml-auto text-xs font-medium text-muted-foreground">
                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <div className="p-4 bg-card">
              <div className="mb-3 flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{alert.issueCount} related issues</strong> reported within a {alert.zone.radiusMeters}m radius.
                </p>
              </div>
              
              {alert.aiInsight && (
                <div className="rounded-md bg-primary/5 p-3 flex gap-2 items-start border border-primary/10">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <p className="text-sm text-primary/90 italic leading-relaxed">
                    {alert.aiInsight}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
