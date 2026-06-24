'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Issue } from '@/types'
import { CATEGORIES, STATUS_CONFIG, SEVERITY_COLORS, formatCategory } from '@/lib/constants'
import { formatDistanceToNow, format } from 'date-fns'
import { UpvoteButton } from '@/components/issues/UpvoteButton'
import { StatusTimeline } from '@/components/issues/StatusTimeline'
import { MapPin, User as UserIcon, Calendar, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper').then(mod => mod.MapWrapper), { ssr: false })

export default function IssueDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await fetch(`/api/issues/${id}`)
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
        setIssue(data.issue)
        toast.success('Issue verified! +5 points awarded.')
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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!issue) {
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
  const canVerify = user && issue.reportedBy !== user._id && !issue.verifiedBy.includes(user._id)

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
                <span>{category?.icon}</span>
                {category?.label || formatCategory(issue.category)}
              </span>
              <span 
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white capitalize shadow-sm"
                style={{ backgroundColor: severityColor }}
              >
                Severity: {issue.severity}
              </span>
              
              {issue.aiClassification?.isDuplicate && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  Merged Duplicate
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight">{issue.title}</h1>
            
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

            {issue.images && issue.images.length > 0 && !issue.images[0].includes('placehold.co') && (
              <div className="overflow-hidden rounded-xl border bg-muted shadow-sm aspect-video relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={issue.images[0]} 
                  alt={issue.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card p-6 rounded-xl border shadow-sm mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{issue.description}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border bg-card shadow-sm">
            <UpvoteButton issueId={issue._id} initialUpvotes={issue.upvotes} variant="default" className="h-10 px-6" />
            
            {canVerify && (
              <Button 
                variant="outline" 
                className="gap-2 h-10 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify Issue (+5 pts)
              </Button>
            )}

            <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2">
              <span className="font-semibold text-foreground">{issue.verifiedBy.length}</span> verifications
            </div>
          </div>

          {/* Map Location */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
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
              Updates & Comments ({issue.comments.length})
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
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[80px]"
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
                const author = (comment.user || {}) as any
                return (
                  <div key={index} className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary overflow-hidden">
                      {author.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{author.name || 'Unknown User'}</span>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{author.level || 'user'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
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
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-semibold">Status Tracker</h3>
            </div>
            <div className="p-6">
              <StatusTimeline history={issue.statusHistory} />
            </div>
            
            <div className="border-t p-4 bg-muted/10">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Reported By</h4>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                  {reporter?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={reporter.avatar} alt={reporter.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{reporter?.name || 'Anonymous'}</div>
                  <div className="text-xs text-primary font-medium capitalize">{reporter?.level || 'Newcomer'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
