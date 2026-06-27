'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { AUTH, EMAIL_VERIFICATION } from '@/lib/constants'
import {
  AlertTriangle,
  Loader2,
  Mail,
  Lock,
  User,
  ShieldCheck,
} from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isAwaitingCode, setIsAwaitingCode] = useState(false)
  const { register, verifyEmail, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const codeDigits = EMAIL_VERIFICATION.CODE_DIGITS
  const minPasswordLength = AUTH.MIN_PASSWORD_LENGTH

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (isAwaitingCode) {
      await verifyEmail(email, verificationCode)
    } else {
      const sent = await register(name, email, password)
      if (sent) setIsAwaitingCode(true)
    }
    setIsSubmitting(false)
  }

  const resendCode = async () => {
    setIsSubmitting(true)
    const sent = await register(name, email, password)
    if (sent) setVerificationCode('')
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
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Join Vigil</h2>
          <p className="text-sm text-muted-foreground font-medium">
            {isAwaitingCode
              ? 'Enter the code sent to your email.'
              : 'Create an account to start reporting.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          <div className="space-y-4">
            {!isAwaitingCode ? (
              <>
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-foreground ml-1" htmlFor="name">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      required
                      className="w-full rounded-lg border border-input bg-background/50 pl-10 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background transition-colors"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                    />
                  </div>
                </div>

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
                  <label className="text-sm font-semibold text-foreground ml-1" htmlFor="password">Password</label>
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
                      placeholder="Password"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-foreground ml-1" htmlFor="verificationCode">Verification Code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    minLength={codeDigits}
                    maxLength={codeDigits}
                    className="w-full rounded-lg border border-input bg-background/50 pl-10 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background transition-colors"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, codeDigits))}
                    placeholder={`${codeDigits}-digit code`}
                  />
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0 mt-2" disabled={isSubmitting || isLoading}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : isAwaitingCode ? (
              'Verify Email'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {isAwaitingCode && (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              className="text-sm font-semibold text-primary"
              disabled={isSubmitting || isLoading}
              onClick={resendCode}
            >
              Send a new code
            </Button>
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors hover:underline">
              Log In.
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
