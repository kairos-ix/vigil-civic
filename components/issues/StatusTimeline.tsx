'use client'

import { STATUS_CONFIG } from '@/lib/constants'
import { format } from 'date-fns'
import { CheckCircle2, Circle, Clock, MapPin, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusTimelineProps {
  history: Array<{ status: string; changedAt: string }>
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  // Define the standard progression flow
  const flow = ['reported', 'community_verified', 'in_progress', 'resolved']
  
  // Find current status index based on history
  const currentStatus = history[history.length - 1]?.status || 'reported'
  
  // If rejected, it breaks the normal flow
  if (currentStatus === 'rejected') {
    const rejectedStatus = history.find(h => h.status === 'rejected')
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive">
            <XCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-medium text-destructive">Issue Rejected</h4>
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
    <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
      {flow.map((status, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        const historyRecord = history.find(h => h.status === status)
        const config = STATUS_CONFIG[status]

        let Icon = Circle
        if (isCompleted && !isCurrent) Icon = CheckCircle2
        if (isCurrent) Icon = status === 'resolved' ? CheckCircle2 : Clock

        return (
          <div key={status} className={cn("relative pl-8", !isCompleted && "opacity-50")}>
            <div 
              className={cn(
                "absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full bg-background transition-colors duration-500",
                isCompleted && "ring-4 ring-background"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5", 
                  isCompleted ? "fill-primary text-primary-foreground" : "text-muted-foreground"
                )} 
                style={isCompleted ? { fill: config?.color } : undefined}
              />
            </div>
            
            <div className="flex flex-col">
              <h4 className="font-semibold" style={{ color: isCurrent ? config?.color : undefined }}>
                {config?.label}
              </h4>
              {historyRecord ? (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(historyRecord.changedAt), 'MMM d, yyyy • h:mm a')}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground italic">Pending</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
