import { Shield, ShieldAlert, ShieldCheck, ShieldHalf, ShieldBan, Crown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  level: string
  className?: string
}

const levelConfig: Record<string, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  newcomer: { label: 'Newcomer', icon: ShieldBan, color: 'text-muted-foreground', bg: 'bg-muted' },
  reporter: { label: 'Reporter', icon: ShieldHalf, color: 'text-primary', bg: 'bg-primary/10' },
  verifier: { label: 'Verifier', icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
  guardian: { label: 'Guardian', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
  hero: { label: 'Vigil Hero', icon: ShieldAlert, color: 'text-primary', bg: 'bg-primary/10' },
  developer: { label: 'Developer', icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const config = levelConfig[level.toLowerCase()] || levelConfig.newcomer
  const Icon = config.icon

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", config.bg, config.color, className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  )
}
