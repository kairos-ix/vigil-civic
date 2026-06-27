'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { User, Issue } from '@/types'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { PointsBadge } from '@/components/gamification/PointsBadge'
import { IssueCard } from '@/components/issues/IssueCard'
import { User as UserIcon, Calendar, Activity, CheckCircle2, FileWarning, ThumbsUp, Shield, Edit2, Loader2, Camera } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { id } = useParams()
  const { user: currentUser, updateUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  const isOwner = currentUser?._id === id
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', city: '', ward: '' })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserAndIssues = async () => {
      try {
        const [userRes, issuesRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/issues?limit=50&reportedBy=${id}`)
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)
        }
        
        if (issuesRes.ok) {
          const issuesData = await issuesRes.json()
          setRecentIssues(issuesData.issues || [])
        }
      } catch (error) {
        console.error('Failed to fetch profile', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchUserAndIssues()
  }, [id])

  const startEditing = () => {
    setEditForm({
      name: user?.name || '',
      city: user?.city || '',
      ward: user?.ward || ''
    })
    setAvatarPreview(user?.avatar || null)
    setAvatarFile(null)
    setIsEditing(true)
  }

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!editForm.city.trim()) {
      toast.error('City is compulsory for city-wide notifications')
      return
    }

    setIsSaving(true)
    try {
      let avatarUrl = user?.avatar

      if (avatarFile) {
        const formData = new FormData()
        formData.append('image', avatarFile)
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadRes.ok) {
          throw new Error('Failed to upload image')
        }
        
        const uploadData = await uploadRes.json()
        avatarUrl = uploadData.url
      }

      const updates = {
        name: editForm.name,
        city: editForm.city,
        ward: editForm.ward,
        avatar: avatarUrl
      }

      const success = await updateUser(updates)
      if (success) {
        setUser(prev => prev ? { ...prev, ...updates } : null)
        setIsEditing(false)
        toast.success('Profile updated successfully')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading profile...</div>
  }

  if (!user) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">User not found</div>
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-in fade-in duration-500">
      
      {/* Profile Header */}
      <div className="rounded-2xl border bg-card p-6 md:p-10 shadow-sm mb-8 relative">
        {!isEditing && isOwner && (
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-4 right-4" 
            onClick={startEditing}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
        
        {isEditing ? (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Edit */}
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-md overflow-hidden cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover group-hover:opacity-50 transition-opacity" />
                  ) : (
                    <UserIcon className="h-16 w-16 text-primary group-hover:opacity-50 transition-opacity" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-primary drop-shadow-md" />
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageCapture}
                />
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Change Photo
                </Button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      City <span className="text-destructive">*</span>
                      <span className="text-[10px] text-muted-foreground ml-2 font-normal">(Compulsory for city-wide notifications)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.city}
                      onChange={e => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="e.g. Ahmedabad"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ward / Area</label>
                    <input
                      type="text"
                      value={editForm.ward}
                      onChange={e => setEditForm(prev => ({ ...prev, ward: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="e.g. Navrangpura"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-md overflow-hidden">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-16 w-16 text-primary" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight mb-2">{user.name}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <LevelBadge level={user.level} className="px-3 py-1 text-sm" />
                <PointsBadge points={user.points} className="px-3 py-1 text-sm" />
                {user.city && (
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                    {user.ward ? `${user.ward}, ` : ''}{user.city}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Stats & Badges */}
        <div className="space-y-8">
          
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <h3 className="font-semibold">{isOwner ? 'Your Impact' : `${user.name.split(' ')[0]}'s Impact`}</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
                <span className="text-2xl font-bold text-primary">{user.stats?.reportsSubmitted || 0}</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><FileWarning className="h-3 w-3" /> Reports</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
                <span className="text-2xl font-bold text-primary">{user.stats?.issuesVerified || 0}</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
                <span className="text-2xl font-bold text-primary">{user.stats?.upvotesReceived || 0}</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> Upvotes</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
                <span className="text-2xl font-bold text-primary">{user.stats?.issuesResolved || 0}</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Shield className="h-3 w-3" /> Fixed</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-semibold">Badges Earned ({user.badges?.length || 0})</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {user.badges && user.badges.length > 0 ? (
                user.badges.map((badge, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-3 rounded-lg border bg-muted/30 w-[80px] text-center" title={format(new Date(badge.earnedAt), 'MMM d, yyyy')}>
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <span className="text-[10px] font-medium leading-tight">{badge.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground w-full text-center py-4">No badges earned yet.</p>
              )}
            </div>
          </div>
          
        </div>

        {/* Right Col: Recent Issues */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Recent Reports</h2>
          
          {recentIssues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentIssues.map(issue => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-card text-muted-foreground text-sm">
              No issues reported yet.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
