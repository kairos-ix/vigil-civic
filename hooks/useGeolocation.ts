'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useGeolocation() {
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getLocation = useCallback(() => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      toast.error('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude)
        setLng(position.coords.longitude)
        setLoading(false)
      },
      (err) => {
        let errorMessage = 'Failed to get location'
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case err.TIMEOUT:
            errorMessage = 'The request to get user location timed out'
            break
        }
        setError(errorMessage)
        setLoading(false)
        toast.error(errorMessage)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [])

  return { lat, lng, error, loading, getLocation }
}
