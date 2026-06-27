'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { User } from '@/types'
import { toast } from 'sonner'
import {
  getSession,
  setSession,
  removeSession,
  clearAllSessions,
  SESSION_KEYS,
} from '@/lib/sessionStorage'

const SKIP_ME_PATHS = [
  '/login',
  '/register',
  '/request-reset',
  '/reset-password',
]

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const shouldSkipMe = SKIP_ME_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(!shouldSkipMe)

  // Hydrate from sessionStorage after initial mount to prevent SSR hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = getSession<User>(SESSION_KEYS.USER)
      if (cached) {
        setUserState(cached)
        setIsLoading(false)
      }
    }
  }, [])

  // Wrapper that syncs to sessionStorage on every update
  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    if (u) {
      setSession(SESSION_KEYS.USER, u)
    } else {
      removeSession(SESSION_KEYS.USER)
    }
  }, [])

  useEffect(() => {
    if (shouldSkipMe) {
      return
    }

    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch user', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMe()
  }, [shouldSkipMe])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
        toast.success('Logged in successfully')
        router.push('/dashboard')
        return true
      } else {
        toast.error(data.error || 'Failed to login')
        return false
      }
    } catch (error) {
      console.error('Login error', error)
      toast.error('An unexpected error occurred')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Verification code sent')
        return true
      } else {
        toast.error(data.error || 'Failed to register')
        return false
      }
    } catch (error) {
      console.error('Register error', error)
      toast.error('An unexpected error occurred')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (
    email: string,
    code: string
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
        toast.success('Email verified')
        router.push('/dashboard')
        return true
      } else {
        toast.error(data.error || 'Failed to verify email')
        return false
      }
    } catch (error) {
      console.error('Verify email error', error)
      toast.error('An unexpected error occurred')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (
    updates: Partial<Pick<User, 'name' | 'avatar' | 'city' | 'ward'>>
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
        return true
      } else {
        toast.error(data.error || 'Failed to update profile')
        return false
      }
    } catch (error) {
      console.error('Update profile error', error)
      toast.error('An unexpected error occurred')
      return false
    }
  }

  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        return data.user
      }
    } catch {
      console.error('Failed to refresh user')
    }
    return null
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      clearAllSessions()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (err) {
      console.error(err)
      toast.error('Failed to log out')
    }
  }

  return { user, isLoading, login, register, verifyEmail, updateUser, refreshUser, logout }
}
