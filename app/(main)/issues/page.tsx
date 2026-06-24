'use client'

import { useIssues } from '@/hooks/useIssues'
import { IssueCard } from '@/components/issues/IssueCard'
import { Button } from '@/components/ui/button'
import { CATEGORIES, STATUS_CONFIG } from '@/lib/constants'
import { Loader2, Search, SlidersHorizontal } from 'lucide-react'

export default function IssuesPage() {
  const { issues, loading, filters, updateFilters, pagination, setPage } = useIssues()

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">All Issues</h1>
          <p className="text-muted-foreground mt-1">
            Browse and support community reports.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              className="h-10 appearance-none rounded-md border bg-background pl-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={filters.category || ''}
              onChange={(e) => updateFilters({ category: e.target.value || undefined })}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <select
              className="h-10 appearance-none rounded-md border bg-background pl-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value || undefined })}
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && issues.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : issues.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
          <Search className="mb-4 h-8 w-8 opacity-20" />
          <p>No issues found matching your filters.</p>
          {(filters.category || filters.status) && (
            <Button 
              variant="link" 
              onClick={() => updateFilters({ category: undefined, status: undefined })}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {issues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground font-medium px-4">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPage(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
