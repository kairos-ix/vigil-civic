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
  const primaryImage = rawImage && !rawImage.includes('placehold.co') ? rawImage : undefined
  const locationLabel = issue.location?.address || issue.location?.ward || issue.location?.city

  return (
    <Link href={`/issues/${issue._id}`} className="group block focus-ring rounded-[var(--radius-card)]">
      <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border bg-card text-card-foreground surface-flat hover-lift">
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={issue.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div
            className={`${primaryImage ? 'hidden' : 'flex'} h-full w-full items-center justify-center transition-all duration-500`}
            style={{ backgroundColor: categoryConfig?.color || '#62899b' }}
          >
            <span className="text-white/90 transition-transform duration-500 group-hover:scale-110">
              {categoryConfig ? <categoryConfig.icon size={48} /> : <MapPin size={48} />}
            </span>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          
          <div className="absolute left-2 top-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-105"
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
              className="rounded-full px-2 py-1 text-xs font-semibold text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: severityColor }}
            >
              {issue.severity}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2 mb-2">
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:scale-110" style={{ color: categoryConfig?.color || '#62899b' }}>
              {categoryConfig ? <categoryConfig.icon className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {categoryConfig?.label || formatCategory(issue.category)}
            </span>
          </div>
          
          <h3 className="line-clamp-2 text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
            {issue.title}
          </h3>
          
          {locationLabel ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-auto mb-4">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </div>
          ) : (
            <div className="mt-auto mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Location pending
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-3 mt-auto">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium transition-colors duration-200 hover:text-primary" style={{ color: issue.upvotes.length > 0 ? 'var(--primary)' : undefined }}>
                <ArrowUp className="h-4 w-4" />
                <span>{issue.upvotes.length}</span>
              </div>
              <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-primary">
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
