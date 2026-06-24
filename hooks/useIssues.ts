'use client'

import { useState, useEffect, useCallback } from 'react'
import { Issue } from '@/types'
import { toast } from 'sonner'

interface UseIssuesProps {
  lat?: number
  lng?: number
  radius?: number
  category?: string
  status?: string
  page?: number
  limit?: number
}

export function useIssues(initialFilters?: UseIssuesProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<UseIssuesProps>(initialFilters || {})
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })

  const fetchIssues = useCallback(async (currentFilters: UseIssuesProps) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (currentFilters.lat !== undefined) params.append('lat', currentFilters.lat.toString())
      if (currentFilters.lng !== undefined) params.append('lng', currentFilters.lng.toString())
      if (currentFilters.radius) params.append('radius', currentFilters.radius.toString())
      if (currentFilters.category) params.append('category', currentFilters.category)
      if (currentFilters.status) params.append('status', currentFilters.status)
      if (currentFilters.page) params.append('page', currentFilters.page.toString())
      if (currentFilters.limit) params.append('limit', currentFilters.limit.toString())

      const res = await fetch(`/api/issues?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setIssues(data.issues)
        setPagination({
          total: data.total,
          page: data.page,
          pages: data.pages
        })
      } else {
        setError(data.error || 'Failed to fetch issues')
        toast.error(data.error || 'Failed to fetch issues')
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIssues(filters)
  }, [filters, fetchIssues])

  const updateFilters = (newFilters: Partial<UseIssuesProps>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })) // Reset to page 1 on filter change
  }

  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const refetch = () => fetchIssues(filters)

  return { issues, loading, error, pagination, filters, updateFilters, setPage, refetch }
}
