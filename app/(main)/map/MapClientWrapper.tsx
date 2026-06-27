'use client'

import { useIssues } from '@/hooks/useIssues'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false })

export function MapClientWrapper() {
  const { issues, updateIssue } = useIssues({ limit: 100 })
  const router = useRouter()

  return (
    <IssueMap
      issues={issues}
      onIssueUpdate={updateIssue}
      onViewIssue={(issue) => router.push(`/issues/${issue._id}`)}
      className="h-full w-full z-0"
      showLocateButton={true}
      autoLocate={true}
      showAddButton={true}
      onAddClick={() => router.push('/report')}
    />
  )
}
