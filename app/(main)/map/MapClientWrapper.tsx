'use client'

import { useIssues } from '@/hooks/useIssues'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Issue } from '@/types'

const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false })

export function MapClientWrapper() {
  const { issues } = useIssues({ limit: 100 }) // Fetch more for map
  const router = useRouter()

  const handleMarkerClick = (issue: Issue) => {
    router.push(`/issues/${issue._id}`)
  }

  return (
    <IssueMap 
      issues={issues} 
      onMarkerClick={handleMarkerClick}
      className="h-full w-full z-0"
    />
  )
}
