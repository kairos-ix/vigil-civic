'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CATEGORIES, formatCategory } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface CategoryChartProps {
  data: Record<string, number>
}

export function CategoryChart({ data }: CategoryChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => {
      const category = CATEGORIES.find(c => c.value === key)
      return {
        name: category?.label || formatCategory(key),
        value,
        color: category?.color || '#94a3b8'
      }
    })
    .sort((a, b) => b.value - a.value)
  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        No category data available yet
      </div>
    )
  }

  return (
    <div className="grid min-h-[300px] w-full gap-4 md:grid-cols-[1fr_180px]">
      <div className="relative h-[280px]">
        <div className="flex h-full w-full items-center justify-center">
          <PieChart width={260} height={260}>
            <Pie
              data={chartData}
              cx={130}
              cy={130}
              innerRadius={56}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={false}
              onMouseLeave={() => setActiveIndex(null)}
              label={({ percent }) => percent && percent > 0.08 ? `${Math.round(percent * 100)}%` : ''}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.28}
                  stroke={activeIndex === index ? 'var(--foreground)' : 'var(--card)'}
                  strokeWidth={activeIndex === index ? 2 : 1}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const count = Number(value ?? 0)
                const percentage = total ? Math.round((count / total) * 100) : 0
                return [`${count} issues (${percentage}%)`, name ?? 'Count']
              }}
              contentStyle={{ borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-floating)' }}
            />
          </PieChart>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs font-medium text-muted-foreground">tracked</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-2">
        {chartData.map((entry, index) => {
          const percentage = total ? Math.round((entry.value / total) * 100) : 0
          return (
            <button
              key={entry.name}
              type="button"
              className={cn(
                'focus-ring flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted',
                activeIndex === index && 'bg-primary/10'
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{entry.name}</span>
                <span className="block text-xs text-muted-foreground">{entry.value} - {percentage}%</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
