'use client'

import { Issue } from '@/types'
import { IssueCard } from '@/components/issues/IssueCard'

interface TrendingIssuesProps {
  issues: Issue[]
  isLoading?: boolean
}

export function TrendingIssues({ issues, isLoading }: TrendingIssuesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-xl border bg-card p-4 animate-pulse">
            <div className="aspect-[4/3] w-full rounded-md bg-muted mb-4" />
            <div className="h-5 w-3/4 bg-muted rounded mb-2" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        No trending issues at the moment
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {issues.map(issue => (
        <IssueCard key={issue._id} issue={issue} />
      ))}
    </div>
  )
}
