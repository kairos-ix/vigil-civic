import { Shield, ShieldAlert, ShieldCheck, ShieldHalf, ShieldBan } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  level: string
  className?: string
}

const levelConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  newcomer: { label: 'Newcomer', icon: ShieldBan, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-900' },
  reporter: { label: 'Reporter', icon: ShieldHalf, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  verifier: { label: 'Verifier', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  guardian: { label: 'Guardian', icon: ShieldCheck, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  hero: { label: 'Vigil Hero', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
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
