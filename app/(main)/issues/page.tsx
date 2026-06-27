'use client'

import { useIssues } from '@/hooks/useIssues'
import { IssueCard } from '@/components/issues/IssueCard'
import { Button } from '@/components/ui/button'
import { CATEGORIES, STATUS_CONFIG } from '@/lib/constants'
import { Search, SlidersHorizontal } from 'lucide-react'
import { CustomSelect } from '@/components/ui/custom-select'

export default function IssuesPage() {
  const { issues, loading, filters, updateFilters, pagination, setPage } = useIssues()

  return (
    <div className="relative flex flex-col gap-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">All Issues</h1>
          <p className="text-muted-foreground mt-1">
            Browse and support community reports.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-card)] border bg-card p-2 surface-flat">
          <div className="hidden h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary md:flex">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div className="w-[180px]">
            <CustomSelect
              value={filters.category || ''}
              onChange={(val) => updateFilters({ category: val || undefined })}
              options={[
                { value: '', label: 'All Categories' },
                ...CATEGORIES.map(c => ({ value: c.value, label: c.label }))
              ]}
              placeholder="All Categories"
            />
          </div>
          
          <div className="w-[180px]">
            <CustomSelect
              value={filters.status || ''}
              onChange={(val) => updateFilters({ status: val || undefined })}
              options={[
                { value: '', label: 'All Statuses' },
                ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({ value: key, label: config.label }))
              ]}
              placeholder="All Statuses"
            />
          </div>
        </div>
      </div>

      {loading && issues.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-[360px] rounded-[var(--radius-card)] border bg-card p-4 surface-flat">
              <div className="mb-4 h-44 rounded-xl bg-muted animate-shimmer" />
              <div className="mb-3 h-5 w-3/4 rounded bg-muted animate-shimmer" />
              <div className="h-4 w-1/2 rounded bg-muted animate-shimmer" />
            </div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[var(--radius-panel)] border bg-card p-8 text-center surface-flat">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Search className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold">No reports match this view.</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">Try a broader filter, or start a report if you are seeing an issue on the ground.</p>
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
