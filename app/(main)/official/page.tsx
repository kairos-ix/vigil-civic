'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Issue } from '@/types'
import { STATUS_CONFIG, SEVERITY_COLORS, formatCategory } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/ui/custom-select'
import { Loader2, ExternalLink, Shield, Filter } from 'lucide-react'
import { toast } from 'sonner'

const VALID_STATUSES = Object.keys(STATUS_CONFIG)

export default function OfficialControlPanel() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    try {
      const url = statusFilter
        ? `/api/issues?limit=100&status=${statusFilter}`
        : '/api/issues?limit=100'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setIssues(data.issues || [])
      }
    } catch (error) {
      console.error('Failed to fetch issues', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    if (user.role !== 'official') {
      router.push('/dashboard')
      return
    }
    fetchIssues()
  }, [user, authLoading, router, fetchIssues])

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    setUpdatingId(issueId)
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const data = await res.json()
        setIssues(prev =>
          prev.map(i => (i._id === issueId ? { ...i, status: data.issue.status } : i))
        )
        toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to update status')
        fetchIssues()
      }
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Control Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage all reported issues — official only
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: '', label: 'All Statuses' },
              ...VALID_STATUSES.map((s) => ({
                value: s,
                label: STATUS_CONFIG[s].label,
              })),
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : issues.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-card text-sm text-muted-foreground">
          {statusFilter
            ? `No issues with status "${STATUS_CONFIG[statusFilter]?.label ?? statusFilter}"`
            : 'No issues found'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card -mx-4 md:mx-0">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Issue</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell whitespace-nowrap">Reporter</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Severity</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => {
                const reporter = typeof issue.reportedBy === 'object' ? issue.reportedBy : null
                const statusColor = STATUS_CONFIG[issue.status]?.color
                const severityColor = SEVERITY_COLORS[issue.severity]

                return (
                  <tr key={issue._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="max-w-[250px]">
                        <Link
                          href={`/issues/${issue._id}`}
                          className="font-medium truncate block hover:text-primary transition-colors"
                        >
                          {issue.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {reporter ? (
                        <Link href={`/profile/${reporter._id}`} className="hover:text-primary hover:underline">
                          {reporter.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium">{formatCategory(issue.category)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: severityColor }}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                          }}
                        >
                          {STATUS_CONFIG[issue.status]?.label ?? issue.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <CustomSelect
                          value=""
                          onChange={(val) => handleStatusUpdate(issue._id, val)}
                          options={VALID_STATUSES
                            .filter((s) => s !== issue.status)
                            .map((s) => ({ value: s, label: STATUS_CONFIG[s].label }))}
                          placeholder="Change to..."
                          disabled={updatingId === issue._id}
                        />
                        {updatingId === issue._id && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                        )}
                        <Link
                          href={`/issues/${issue._id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors shrink-0"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground text-center">
        Total: {issues.length} issue{issues.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
