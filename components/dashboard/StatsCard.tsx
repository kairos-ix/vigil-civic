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
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm p-6", className)}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={cn(
              "font-medium mr-1",
              trend.positive === true && "text-emerald-500",
              trend.positive === false && "text-destructive",
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label}
          </p>
        )}
        
        {description && !trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
