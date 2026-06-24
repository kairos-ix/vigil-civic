'use client'

import Link from 'next/link'
import { Issue } from '@/types'
import { CATEGORIES, STATUS_CONFIG, SEVERITY_COLORS, formatCategory } from '@/lib/constants'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUp, MessageSquare, MapPin } from 'lucide-react'

export function IssueCard({ issue }: { issue: Issue }) {
  const categoryConfig = CATEGORIES.find(c => c.value === issue.category)
  const statusConfig = STATUS_CONFIG[issue.status]
  const severityColor = SEVERITY_COLORS[issue.severity]
  const rawImage = issue.images?.[0]
  // Filter out placeholder URLs (seed data) so the category icon fallback renders instead
  const primaryImage = rawImage && !rawImage.includes('placehold.co') ? rawImage : undefined

  return (
    <Link href={`/issues/${issue._id}`} className="group block">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50">
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={issue.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div
            className={`${primaryImage ? 'hidden' : 'flex'} h-full w-full items-center justify-center`}
            style={{ backgroundColor: categoryConfig?.color || '#6B7280' }}
          >
            <span className="text-4xl">
              {categoryConfig?.icon || '📍'}
            </span>
          </div>
          
          <div className="absolute left-2 top-2">
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
          
          <div className="absolute top-2 right-2">
            <span
              className="rounded-full px-2 py-1 text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: severityColor }}
            >
              {issue.severity}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">{categoryConfig?.icon}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {categoryConfig?.label || formatCategory(issue.category)}
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
