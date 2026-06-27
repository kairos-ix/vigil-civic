'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await login(email, password)
    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-black/95 p-4">
      <div className="auth-surface w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl border relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
        
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2 ring-1 ring-primary/20">
            <img src="/logo.png" alt="Vigil" className="h-7 w-7 object-contain drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-4">
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-foreground ml-1" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-input bg-background/50 pl-10 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                />
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-foreground" htmlFor="password">Password</label>
                <Link href="/request-reset" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full rounded-lg border border-input bg-background/50 pl-10 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0" disabled={isSubmitting || isLoading}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Log In'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">For Hackathon Judges</span>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline"
            className="w-full h-11 text-base font-semibold transition-transform hover:-translate-y-0.5 active:translate-y-0 border-primary/20 hover:bg-primary/5" 
            onClick={async () => {
              setIsSubmitting(true)
              await login('demoauthority@vigil.com', 'demoauthority')
              setIsSubmitting(false)
            }}
            disabled={isSubmitting || isLoading}
          >
            <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
            1-Click Authority Login
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground font-medium">
            Do not have an account?{' '}
            <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors hover:underline">
              Sign Up.
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
