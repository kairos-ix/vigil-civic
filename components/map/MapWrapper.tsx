'use client'

import dynamic from 'next/dynamic'
import { Issue } from '@/types'

// Dynamically import the map component with SSR disabled
const IssueMap = dynamic(() => import('./IssueMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-muted/50 rounded-lg animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground font-medium">Loading Map...</p>
      </div>
    </div>
  )
})

interface MapWrapperProps {
  issues: Issue[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (issue: Issue) => void
  onLocationSelect?: (lat: number, lng: number) => void
  selectable?: boolean
  className?: string
}

export function MapWrapper(props: MapWrapperProps) {
  return <IssueMap {...props} />
}
