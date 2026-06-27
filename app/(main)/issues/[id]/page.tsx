'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/hooks/useAuth'
import { Issue } from '@/types'
import { CATEGORIES, STATUS_CONFIG, SEVERITY_COLORS, formatCategory, POINTS } from '@/lib/constants'
import { formatDistanceToNow, format } from 'date-fns'
import { UpvoteButton } from '@/components/issues/UpvoteButton'
import { StatusTimeline } from '@/components/issues/StatusTimeline'
import { MapPin, User as UserIcon, Calendar, MessageSquare, ShieldCheck, Loader2, Edit3, Save, X, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/ui/custom-select'
import { toast } from 'sonner'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper').then(mod => mod.MapWrapper), { ssr: false })

export default function IssueDetailPage() {
  const { id } = useParams()
  const { user, refreshUser } = useAuth()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [issueRemoved, setIssueRemoved] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [pendingStatus, setPendingStatus] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'other',
    severity: 'low',
    address: '',
    lat: '',
    lng: '',
    images: '',
  })
  const issueStatus = issue?.status
  const issueId = issue?._id

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await fetch(`/api/issues/${id}`)
        if (res.status === 410) {
          setIssueRemoved(true)
          return
        }
        if (res.ok) {
          const data = await res.json()
          setIssue(data.issue)
        }
      } catch (error) {
        console.error('Failed to fetch issue', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) fetchIssue()
  }, [id])

  // Refresh user stats on mount so nav/profile shows latest data
  useEffect(() => {
    refreshUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (issueStatus) {
      queueMicrotask(() => setPendingStatus(issueStatus))
    }
  }, [issueStatus, issueId])

  const handleIssueUpdate = (updated: Issue) => {
    setIssue((prev) => {
      if (!prev) return updated
      return {
        ...prev,
        upvotes: updated.upvotes,
        status: updated.status,
        statusHistory: updated.statusHistory,
        verifiedBy: updated.verifiedBy,
        title: updated.title,
        description: updated.description,
        category: updated.category,
        severity: updated.severity,
        location: updated.location,
        images: updated.images,
        editedAt: updated.editedAt,
        priorityScore: updated.priorityScore,
        resolvedAt: updated.resolvedAt,
        updatedAt: updated.updatedAt,
        reporterBonusAwarded: updated.reporterBonusAwarded,
        mergedReportsCount: updated.mergedReportsCount,
      }
    })
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/issues/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText })
      })
      const data = await res.json()
      if (res.ok) {
        setIssue(data.issue)
        setCommentText('')
        toast.success('Comment added')
      } else {
        toast.error(data.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error(error)
      toast.error('Unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditing = () => {
    if (!issue) return
    setEditForm({
      title: issue.title,
      description: issue.description,
      category: issue.category,
      severity: issue.severity,
      address: issue.location.address || '',
      lat: String(issue.location.coordinates[1] ?? ''),
      lng: String(issue.location.coordinates[0] ?? ''),
      images: issue.images.join('\n'),
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issue) return

    const lat = Number(editForm.lat)
    const lng = Number(editForm.lng)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast.error('Enter valid latitude and longitude')
      return
    }

    setIsSavingEdit(true)
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          severity: editForm.severity,
          location: {
            type: 'Point',
            coordinates: [lng, lat],
            address: editForm.address,
            ward: issue.location.ward,
            city: issue.location.city,
          },
          images: editForm.images
            .split('\n')
            .map((image) => image.trim())
            .filter(Boolean),
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setIssue(data.issue)
        setIsEditing(false)
        toast.success('Issue updated')
      } else {
        toast.error(data.error || 'Failed to update issue')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to update issue')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const promptDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId)
  }

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/issues/${id}/comment?commentId=${commentToDelete}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        const data = await res.json()
        setIssue(data.issue)
        toast.success('Comment deleted')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete comment')
      }
    } catch (error) {  
      console.error(error)
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
      setCommentToDelete(null)
    }
  }

  const handleVerify = async () => {
    if (!user) {
      toast.error('Please login to verify')
      return
    }

    setIsVerifying(true)
    try {
      const res = await fetch(`/api/issues/${id}/verify`, { method: 'PATCH' })
      const data = await res.json()
      
      if (res.ok) {
        handleIssueUpdate(data.issue)
        refreshUser()
        toast.success(`Issue verified! +${POINTS.VERIFY} points awarded.`)
      } else {
        toast.error(data.error || 'Failed to verify')
      }
    } catch (error) {
      console.error(error)
      toast.error('Unexpected error occurred')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!user || user.role !== 'official' || !pendingStatus) return

    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus }),
      })
      const data = await res.json()

      if (res.ok) {
        handleIssueUpdate(data.issue)
        refreshUser()
        toast.success(`Status updated to ${STATUS_CONFIG[pendingStatus]?.label ?? pendingStatus}`)
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error(error)
      toast.error('Unexpected error occurred')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!issue) {
    if (issueRemoved) {
      return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">This issue was removed.</p>
        </div>
      )
    }
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Issue not found</p>
      </div>
    )
  }

  const category = CATEGORIES.find(c => c.value === issue.category)
  const statusConfig = STATUS_CONFIG[issue.status]
  const severityColor = SEVERITY_COLORS[issue.severity]
  
  const reporter = typeof issue.reportedBy === 'object' ? issue.reportedBy : null
  const reporterId = String(reporter?._id ?? issue.reportedBy)
  const canVerify =
    user &&
    reporterId !== String(user._id) &&
    !issue.verifiedBy.map(String).includes(String(user._id))
  const isReporter = user && reporterId === String(user._id)
  const isEditLocked = issue.upvotes.length > 0 || issue.verifiedBy.length > 0
  const canEdit = Boolean(isReporter && !isEditLocked)

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image, Details, Map */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header & Image */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span 
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: `${statusConfig?.bg}`, color: statusConfig?.color }}
              >
                {statusConfig?.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                {category ? <category.icon className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                {category?.label || formatCategory(issue.category)}
              </span>
              <span 
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white capitalize shadow-sm"
                style={{ backgroundColor: severityColor }}
              >
                Severity: {issue.severity}
              </span>
              
              {(issue.mergedReportsCount ?? 1) > 1 && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Reported by {issue.mergedReportsCount} people
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{issue.title}</h1>
                {issue.editedAt && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Edited {format(new Date(issue.editedAt), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>

              {canEdit && !isEditing && (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>

            {isReporter && isEditLocked && (
              <div className="flex items-start gap-2 rounded-[var(--radius-card)] border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Locked after first verification or upvote.</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground pb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(issue.createdAt), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {issue.location.ward || issue.location.city || 'Location Details'}
              </div>
            </div>

            {isEditing && (
              <form
                onSubmit={handleEditSubmit}
                className="space-y-5 rounded-[var(--radius-panel)] border border-primary/20 bg-card p-5 surface-raised"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold" htmlFor="edit-title">
                      Title
                    </label>
                    <input
                      id="edit-title"
                      required
                      maxLength={100}
                      className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Category</label>
                    <CustomSelect
                      value={editForm.category}
                      onChange={(category) =>
                        setEditForm((prev) => ({ ...prev, category }))
                      }
                      options={CATEGORIES.map((category) => ({
                        value: category.value,
                        label: category.label,
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Severity</label>
                    <CustomSelect
                      value={editForm.severity}
                      onChange={(severity) =>
                        setEditForm((prev) => ({ ...prev, severity }))
                      }
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'critical', label: 'Critical' },
                      ]}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold" htmlFor="edit-description">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      required
                      rows={4}
                      className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold" htmlFor="edit-address">
                      Address
                    </label>
                    <input
                      id="edit-address"
                      className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, address: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="edit-lat">
                      Latitude
                    </label>
                    <input
                      id="edit-lat"
                      required
                      inputMode="decimal"
                      className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editForm.lat}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, lat: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="edit-lng">
                      Longitude
                    </label>
                    <input
                      id="edit-lng"
                      required
                      inputMode="decimal"
                      className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editForm.lng}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, lng: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold" htmlFor="edit-images">
                      Image URLs
                    </label>
                    <textarea
                      id="edit-images"
                      rows={3}
                      className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editForm.images}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, images: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={cancelEditing}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSavingEdit}>
                    {isSavingEdit ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save changes
                  </Button>
                </div>
              </form>
            )}

            {issue.images && issue.images.length > 0 && !issue.images[0].includes('placehold.co') && (
              <div className="relative aspect-video overflow-hidden rounded-[var(--radius-panel)] border bg-muted surface-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={issue.images[0]} 
                  alt={issue.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            
            <div className="prose prose-sm md:prose-base dark:prose-invert mt-6 max-w-none rounded-[var(--radius-panel)] border bg-card p-6 surface-raised">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{issue.description}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-panel)] border bg-card p-4 surface-flat">
            <UpvoteButton
              issueId={issue._id}
              upvotes={issue.upvotes}
              onUpdate={(updated) => { handleIssueUpdate(updated); refreshUser() }}
              variant="default"
              className="h-10 px-6"
              showLabel
            />
            
            {canVerify && (
              <Button 
                variant="outline" 
                className="h-10 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                I&apos;m here — confirm this issue
              </Button>
            )}

            <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2">
              <span className="font-semibold text-foreground">{issue.verifiedBy.length}</span> verifications
            </div>
          </div>

          {/* Map Location */}
          <div className="overflow-hidden rounded-[var(--radius-panel)] border bg-card surface-flat">
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Reported Location
              </h3>
              {issue.location.address && (
                <p className="text-sm text-muted-foreground mt-1">{issue.location.address}</p>
              )}
            </div>
            <div className="h-[300px] w-full">
              <MapWrapper issues={[issue]} zoom={16} />
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Community Comments ({issue.comments.length})
            </h3>

            {user ? (
              <form onSubmit={handleComment} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="You" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    required
                    className="min-h-[80px] w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    placeholder="Add an update or comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="sm">
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                Please log in to add a comment.
              </div>
            )}

            <div className="space-y-4">
              {issue.comments.map((comment, index) => {
                const author = typeof comment.user === 'object' ? comment.user : null
                const isCommentOwner = user && author && String(author._id) === String(user._id)
                return (
                  <div key={index} className="flex gap-4 rounded-[var(--radius-card)] border bg-card p-4 surface-flat">
                    {author ? (
                      <Link href={`/profile/${author._id}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary overflow-hidden">
                        {author.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Link>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary overflow-hidden">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {author ? (
                            <Link href={`/profile/${author._id}`} className="font-semibold text-sm hover:underline">{author.name}</Link>
                          ) : (
                            <span className="font-semibold text-sm">Unknown User</span>
                          )}
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{author?.level || 'user'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                          {isCommentOwner && (
                            <button
                              onClick={() => promptDeleteComment(comment._id)}
                              className="text-xs text-destructive hover:underline"
                              disabled={isSubmitting}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Reporter info */}
        <div className="space-y-6">
          <div className="sticky top-24 overflow-hidden rounded-[var(--radius-panel)] border bg-card surface-flat">
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-semibold">Issue Timeline</h3>
            </div>
            <div className="p-6">
              <StatusTimeline history={issue.statusHistory} />
            </div>
            
            <div className="border-t p-4 bg-muted/10">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Reported By</h4>
              {reporter ? (
                <Link href={`/profile/${reporter._id}`} className="flex items-center gap-3 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                    {reporter.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={reporter.avatar} alt={reporter.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm group-hover:underline">{reporter.name}</div>
                    <div className="text-xs text-primary font-medium capitalize">{reporter.level || 'Newcomer'}</div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Anonymous</div>
                    <div className="text-xs text-primary font-medium capitalize">Newcomer</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {user?.role === 'official' && (
            <div className="overflow-hidden rounded-[var(--radius-panel)] border border-primary/20 bg-card surface-flat">
              <div className="border-b bg-primary/5 p-4">
                <h3 className="font-semibold text-primary">Status Controls</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Official actions — updates persist to the database immediately.
                </p>
              </div>
              <div className="space-y-3 p-4">
                <CustomSelect
                  value={pendingStatus}
                  onChange={setPendingStatus}
                  options={Object.entries(STATUS_CONFIG).map(([value, config]) => ({
                    value,
                    label: config.label,
                  }))}
                />
                <Button
                  className="w-full"
                  onClick={handleStatusUpdate}
                  disabled={
                    isUpdatingStatus ||
                    !pendingStatus ||
                    pendingStatus === issue.status
                  }
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    'Update Status'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>

      {commentToDelete && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="w-full max-w-sm rounded-[var(--radius-panel)] border bg-card p-6 shadow-xl surface-raised" style={{ animation: 'modalIn 0.2s ease-out' }}>
            <h3 className="text-lg font-bold">Delete Comment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setCommentToDelete(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={confirmDeleteComment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete
              </Button>
            </div>
          </div>
          <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
        </div>,
        document.body
      )}

    </div>
  )}