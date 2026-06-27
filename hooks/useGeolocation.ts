'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { getSession, setSession, SESSION_KEYS } from '@/lib/sessionStorage'

export type GeolocationState = 'idle' | 'loading' | 'success' | 'error' | 'denied' | 'unsupported'

export function useGeolocation() {
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<GeolocationState>('idle')

  const getLocation = useCallback(() => {
    // Check session cache first
    const cached = getSession<{lat: number, lng: number, accuracy: number}>(SESSION_KEYS.USER_LOCATION)
    if (cached) {
      setLat(cached.lat)
      setLng(cached.lng)
      setAccuracy(cached.accuracy)
      setState('success')
      return
    }

    setLoading(true)
    setError(null)
    setState('loading')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setState('unsupported')
      setLoading(false)
      toast.error('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords
        setLat(latitude)
        setLng(longitude)
        setAccuracy(acc)
        setLoading(false)
        setState('success')
        
        // Cache in session
        setSession(SESSION_KEYS.USER_LOCATION, { lat: latitude, lng: longitude, accuracy: acc })
      },
      (err) => {
        let errorMessage = 'Failed to get location'
        let newState: GeolocationState = 'error'
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied'
            newState = 'denied'
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
        setState(newState)
        toast.error(errorMessage)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [])

  const reset = useCallback(() => {
    setLat(null)
    setLng(null)
    setAccuracy(null)
    setError(null)
    setLoading(false)
    setState('idle')
  }, [])

  return { lat, lng, accuracy, error, loading, state, getLocation, reset }
}
