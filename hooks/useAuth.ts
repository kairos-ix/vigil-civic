'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { toast } from 'sonner'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me')
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
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setUser(data.user)
        toast.success('Account created successfully')
        router.push('/dashboard')
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

  const logout = async () => {
    try {
      // Clear cookie
      document.cookie = 'vigil_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      setUser(null)
      toast.success('Logged out successfully')
      router.push('/')
    } catch (err) {
      console.error(err)
    }
  }

  return { user, isLoading, login, register, logout }
}
