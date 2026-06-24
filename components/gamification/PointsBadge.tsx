import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PointsBadgeProps {
  points: number
  className?: string
}

export function PointsBadge({ points, className }: PointsBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-500", className)}>
      <Trophy className="h-3.5 w-3.5" />
      {points} pts
    </div>
  )
}
