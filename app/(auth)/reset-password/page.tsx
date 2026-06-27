'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AUTH, PASSWORD_RESET } from '@/lib/constants'
import { AlertTriangle, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialEmail = searchParams.get('email') ?? ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const minPasswordLength = AUTH.MIN_PASSWORD_LENGTH
  const codeDigits = PASSWORD_RESET.CODE_DIGITS

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Email is required')
      return
    }

    if (!code) {
      toast.error('Reset code is required')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to reset password')
        return
      }

      toast.success(data.message)
      router.push('/login')
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
      <div className="space-y-4">
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

        <div className="space-y-2 relative">
          <label
            className="text-sm font-semibold text-foreground ml-1"
            htmlFor="code"
          >
            Reset code
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={codeDigits}
              maxLength={codeDigits}
              className="w-full rounded-lg border border-input bg-background/50 pl-10 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background transition-colors"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, codeDigits))
              }
              placeholder={`${codeDigits}-digit code`}
            />
          </div>
        </div>

        <div className="space-y-2 relative">
          <label
            className="text-sm font-semibold text-foreground ml-1"
            htmlFor="password"
          >
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              type="password"
              required
              minLength={minPasswordLength}
              className="w-full rounded-lg border border-input bg-background/50 pl-10 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`At least ${minPasswordLength} characters`}
            />
          </div>
        </div>

        <div className="space-y-2 relative">
          <label
            className="text-sm font-semibold text-foreground ml-1"
            htmlFor="confirmPassword"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={minPasswordLength}
              className="w-full rounded-lg border border-input bg-background/50 pl-10 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background transition-colors"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />
          </div>
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
          'Set new password'
        )}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-black/95 p-4">
      <div className="auth-surface w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />

        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2 ring-1 ring-primary/20">
            <img src="/logo.png" alt="Vigil" className="h-7 w-7 object-contain drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Choose a new password
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Enter the code from your email.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
