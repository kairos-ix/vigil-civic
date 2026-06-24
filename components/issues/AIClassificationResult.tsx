'use client'

import { ClassificationResult } from '@/lib/gemini'
import { CATEGORIES, SEVERITY_COLORS } from '@/lib/constants'
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIResultProps {
  result: ClassificationResult | null
  isLoading: boolean
}

export function AIClassificationResult({ result, isLoading }: AIResultProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-primary/20" />
          <div className="h-4 w-48 rounded bg-primary/20" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="h-8 rounded bg-primary/10" />
          <div className="h-8 rounded bg-primary/10" />
        </div>
      </div>
    )
  }

  if (!result) return null

  if (!result.issueDetected) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-500" />
          <div>
            <h4 className="font-medium text-amber-900 dark:text-amber-300">No civic issue detected</h4>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              Our AI couldn't clearly identify a civic issue in this image. You can still proceed with manual details.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const categoryLabel = CATEGORIES.find(c => c.value === result.category)?.label || result.category
  const severityColor = SEVERITY_COLORS[result.severity] || SEVERITY_COLORS.low

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-primary">AI Analysis Complete</h4>
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(result.confidence * 100)}% Match
            </span>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-background/50 p-2 text-sm border shadow-sm">
              <span className="block text-xs text-muted-foreground mb-1">Category</span>
              <span className="font-medium">{categoryLabel}</span>
            </div>
            <div className="rounded-md bg-background/50 p-2 text-sm border shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs text-muted-foreground mb-1">Severity</span>
                <span className="font-medium capitalize">{result.severity}</span>
              </div>
              <ShieldAlert className="h-5 w-5 opacity-80" style={{ color: severityColor }} />
            </div>
          </div>

          <div className="mt-3 text-sm">
            <span className="font-medium block mb-1">Suggested Title:</span>
            <p className="text-muted-foreground italic">{result.title}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
