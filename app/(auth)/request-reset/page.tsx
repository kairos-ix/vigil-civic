'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function RequestResetPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.status === 503) {
        toast.error(data.error || 'Email service not configured')
        return
      }

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong')
        return
      }

      setSubmitted(true)
      toast.success(data.message)
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-black/95 p-4">
      <div className="auth-surface w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />

        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2 ring-1 ring-primary/20">
            <img src="/logo.png" alt="Vigil" className="h-7 w-7 object-contain drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Reset Password
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Enter your email and we&apos;ll send you a reset code.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, a reset code has been sent.
              Check your inbox and spam folder.
            </p>
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
              <Button variant="outline" className="w-full">
                Enter reset code
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2 relative">
              <label
                className="text-sm font-semibold text-foreground ml-1"
                htmlFor="email"
              >
                Email
              </label>
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

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Send reset code'
              )}
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
