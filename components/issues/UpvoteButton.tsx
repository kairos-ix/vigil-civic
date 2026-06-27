'use client'

import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { POINTS } from '@/lib/constants'
import { motion } from 'framer-motion'
import { Issue } from '@/types'

interface UpvoteButtonProps {
  issueId: string
  upvotes: string[]
  onUpdate: (issue: Issue) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  showLabel?: boolean
}

export function UpvoteButton({
  issueId,
  upvotes,
  onUpdate,
  className,
  variant = 'outline',
  showLabel = false,
}: UpvoteButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const hasUpvoted = user
    ? upvotes.map(String).includes(String(user._id))
    : false

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('Please login to upvote')
      router.push('/login')
      return
    }

    const wasUpvoted = hasUpvoted
    setIsLoading(true)

    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'PATCH',
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to upvote')
      } else {
        onUpdate(data.issue)
        if (!wasUpvoted) {
          toast.success(`Upvoted! +${POINTS.UPVOTE} points awarded.`)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={hasUpvoted ? 'default' : variant}
      size="sm"
      className={cn(
        'gap-2 transition-all active:scale-95',
        hasUpvoted && 'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
      onClick={handleUpvote}
      disabled={isLoading}
      asChild
    >
      <motion.button whileTap={{ scale: 0.9 }}>
        <ArrowUp className={cn('h-4 w-4 shrink-0', hasUpvoted && 'animate-bounce')} />
        {showLabel && (
          <span className="whitespace-nowrap">
            {hasUpvoted ? 'Seen' : "I've seen this too"}
          </span>
        )}
        <span className="font-semibold">{upvotes.length}</span>
      </motion.button>
    </Button>
  )
}
