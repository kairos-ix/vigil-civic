'use client'

import { STATUS_CONFIG } from '@/lib/constants'
import { format } from 'date-fns'
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusTimelineProps {
  history: Array<{ status: string; changedAt: string }>
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  const flow = ['reported', 'community_verified', 'in_progress', 'resolved']
  const currentStatus = history[history.length - 1]?.status || 'reported'

  if (currentStatus === 'rejected') {
    const rejectedStatus = history.find(h => h.status === 'rejected')
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-medium text-destructive">Issue rejected</h4>
            <p className="text-sm text-muted-foreground">
              {rejectedStatus ? format(new Date(rejectedStatus.changedAt), 'PPp') : 'Unknown time'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const currentIndex = flow.indexOf(currentStatus)

  return (
    <div className="relative ml-3 space-y-8 pb-4 before:absolute before:left-0 before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-border">
      {flow.map((status, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isDone = index <= currentIndex
        const historyRecord = history.find(h => h.status === status)
        const config = STATUS_CONFIG[status]

        let Icon = Circle
        if (isCompleted) Icon = CheckCircle2
        if (isCurrent) Icon = status === 'resolved' ? CheckCircle2 : Clock

        return (
          <div key={status} className={cn('relative pl-8', !isDone && 'opacity-60')}>
            <div
              className={cn(
                'absolute -left-[13px] z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background transition-colors duration-500',
                isDone && 'ring-4 ring-background',
                isCurrent && 'ring-4 ring-primary/15'
              )}
            >
              <Icon
                className={cn('h-6 w-6', isDone ? 'text-white' : 'text-muted-foreground')}
                style={isDone ? { fill: config?.color } : undefined}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold" style={{ color: isCurrent ? config?.color : undefined }}>
                  {config?.label}
                </h4>
                {isCurrent && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                    Current step
                  </span>
                )}
              </div>
              {historyRecord ? (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(historyRecord.changedAt), 'MMM d, yyyy - h:mm a')}
                </span>
              ) : (
                <span className="text-sm italic text-muted-foreground">Pending</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
