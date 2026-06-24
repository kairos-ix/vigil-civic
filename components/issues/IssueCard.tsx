'use client'

import Link from 'next/link'
import { Issue } from '@/types'
import { CATEGORIES, STATUS_CONFIG, SEVERITY_COLORS } from '@/lib/constants'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUp, MessageSquare, MapPin } from 'lucide-react'

export function IssueCard({ issue }: { issue: Issue }) {
  const categoryConfig = CATEGORIES.find(c => c.value === issue.category)
  const statusConfig = STATUS_CONFIG[issue.status]
  const severityColor = SEVERITY_COLORS[issue.severity]

  return (
    <Link href={`/issues/${issue._id}`} className="group block">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {issue.images && issue.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={issue.images[0]}
              alt={issue.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary">
              <span className="text-4xl">{categoryConfig?.icon}</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute left-3 top-3">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-md"
              style={{
                backgroundColor: `${statusConfig?.bg}CC`,
                color: statusConfig?.color,
                border: `1px solid ${statusConfig?.color}33`
              }}
            >
              {statusConfig?.label}
            </span>
          </div>
          
          {/* Severity Indicator */}
          <div className="absolute right-3 top-3">
            <span
              className="flex h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: severityColor }}
              title={`Severity: ${issue.severity}`}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">{categoryConfig?.icon}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {categoryConfig?.label}
            </span>
          </div>
          
          <h3 className="line-clamp-2 text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
            {issue.title}
          </h3>
          
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-auto mb-4">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{issue.location?.address || issue.location?.ward || 'Location not specified'}</span>
          </div>

          <div className="flex items-center justify-between border-t pt-3 mt-auto">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium" style={{ color: issue.upvotes.length > 0 ? '#1D4ED8' : '' }}>
                <ArrowUp className="h-4 w-4" />
                <span>{issue.upvotes.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>{issue.comments?.length || 0}</span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
