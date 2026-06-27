import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

export function StatsCard({ title, value, icon, description, trend, className }: StatsCardProps) {
  return (
    <div className={cn(
      'group relative overflow-hidden rounded-[var(--radius-card)] border bg-card p-6 text-card-foreground surface-raised hover-lift cursor-default',
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium tracking-normal text-muted-foreground">
          {title}
        </h3>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/15 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </div>
      </div>

      <div className="relative">
        <div className="animate-count-soft text-3xl font-bold tracking-normal">{value}</div>

        {trend && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <span className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
              trend.positive === true && 'bg-primary/10 text-primary',
              trend.positive === false && 'bg-destructive/10 text-destructive'
            )}>
              {trend.value > 0 ? 'Up ' : 'Down '}{Math.abs(trend.value)}%
            </span>
            {trend.label}
          </p>
        )}

        {description && !trend && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
