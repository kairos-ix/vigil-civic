'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCircle2, MessageSquare, ShieldCheck, MapPin, Award, ExternalLink, BellRing, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
  _id: string
  type: 'verified' | 'status_changed' | 'comment' | 'badge' | 'new_issue' | 'upvote_milestone' | 'upvote'
  message: string
  read: boolean
  createdAt: string
  issueId?: string
}

export function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    if (!user) return
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark notifications read', error)
    }
  }

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    
    // Optimistic update
    setNotifications((prev) => 
      prev.map((n) => n._id === id ? { ...n, read: true } : n)
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    } catch (error) {
      console.error('Failed to mark notification read', error)
      // Revert if failed
      fetchNotifications()
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
    if (notification.issueId) {
      setIsOpen(false)
      router.push(`/issues/${notification.issueId}`)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'verified':
        return <ShieldCheck className="h-5 w-5 text-emerald-500" />
      case 'status_changed':
        return <CheckCircle2 className="h-5 w-5 text-primary" />
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case 'new_issue':
        return <MapPin className="h-5 w-5 text-orange-500" />
      case 'upvote_milestone':
        return <Award className="h-5 w-5 text-amber-500" />
      case 'upvote':
        return <ThumbsUp className="h-5 w-5 text-pink-500" />
      case 'badge':
        return <Award className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative transition-all duration-200 hover:bg-primary/10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40"></span>
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed inset-x-4 top-20 z-50 max-h-[85vh] rounded-2xl border bg-card shadow-xl flex flex-col md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-[380px] md:max-h-[500px] md:rounded-xl overflow-hidden"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b px-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllRead}
                      className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Check className="mr-1 h-3 w-3" /> Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full md:hidden text-muted-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              {loading && notifications.length === 0 ? (
                <div className="flex h-40 items-center justify-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                    Loading...
                  </span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col h-48 items-center justify-center text-center p-6">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <BellRing className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-sm font-medium mb-1">All caught up!</h4>
                  <p className="text-xs text-muted-foreground">You don&apos;t have any notifications right now.</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {notifications.slice(0, 20).map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`group relative p-4 transition-colors cursor-pointer border-b last:border-b-0 hover:bg-muted/50 ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      {!notification.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                      )}
                      <div className="flex gap-3">
                        <div className="mt-0.5 shrink-0">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${!notification.read ? 'bg-background shadow-sm' : 'bg-muted'}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notification.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-[11px] font-medium text-muted-foreground/80">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                            
                            {!notification.read && (
                              <button 
                                onClick={(e) => markAsRead(notification._id, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-primary hover:underline flex items-center gap-1"
                              >
                                <Check className="h-3 w-3" /> Mark read
                              </button>
                            )}
                          </div>
                        </div>
                        {notification.issueId && (
                          <div className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}