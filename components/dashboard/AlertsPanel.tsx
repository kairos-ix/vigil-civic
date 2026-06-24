'use client'

import { InfrastructureAlert } from '@/types'
import { SEVERITY_COLORS, CATEGORIES, formatCategory } from '@/lib/constants'
import { AlertTriangle, MapPin, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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
      <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-center">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No active infrastructure alerts</p>
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
            className="overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md"
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

// Add this import that was missed above
import { CheckCircle2 } from 'lucide-react'
