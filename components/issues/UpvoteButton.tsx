'use client'

import { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface UpvoteButtonProps {
  issueId: string
  initialUpvotes: string[] // Array of user IDs
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
}

export function UpvoteButton({ issueId, initialUpvotes, className, variant = 'outline' }: UpvoteButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [upvotes, setUpvotes] = useState<string[]>(initialUpvotes)
  const [isLoading, setIsLoading] = useState(false)

  const hasUpvoted = user ? upvotes.includes(user._id) : false

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('Please login to upvote')
      router.push('/login')
      return
    }

    setIsLoading(true)

    // Optimistic update
    if (hasUpvoted) {
      setUpvotes(prev => prev.filter(id => id !== user._id))
    } else {
      setUpvotes(prev => [...prev, user._id])
    }

    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'PATCH',
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        // Revert optimistic update on error
        setUpvotes(initialUpvotes)
        toast.error(data.error || 'Failed to upvote')
      } else {
        // Sync with server state
        setUpvotes(data.issue.upvotes)
        if (!hasUpvoted) {
          toast.success('Upvoted! +5 points awarded.')
        }
      }
    } catch (error) {
      console.error(error)
      // Revert optimistic update on error
      setUpvotes(initialUpvotes)
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
        "gap-2 transition-all active:scale-95",
        hasUpvoted && "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
      onClick={handleUpvote}
      disabled={isLoading}
      asChild
    >
      <motion.button whileTap={{ scale: 0.9 }}>
        <ArrowUp className={cn("h-4 w-4", hasUpvoted && "animate-bounce")} />
        <span className="font-semibold">{upvotes.length}</span>
      </motion.button>
    </Button>
  )
}
