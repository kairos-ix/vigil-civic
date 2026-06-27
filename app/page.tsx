import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, Bell, Brain, Camera, CheckCircle, MapPin, Route, ShieldCheck, Sparkles } from 'lucide-react'
import LandingWrapper from '@/components/layout/LandingWrapper'
import { DashboardStats } from '@/types'

function CivicMapConsole() {
  const reports = [
    { label: 'Pothole', x: 70, y: 76, fill: '#075f82' },
    { label: 'Leak', x: 216, y: 104, fill: '#0787b7' },
    { label: 'Light', x: 330, y: 190, fill: '#76c3d6' },
  ]

  return (
    <div className="relative mx-auto w-full max-w-[560px] rounded-[var(--radius-panel)] border bg-card p-4 surface-floating">
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ward command</p>
          <h2 className="text-lg font-bold">Live civic signal</h2>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">AI triage online</div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-neutral-50 p-4">
        <svg viewBox="0 0 420 260" className="h-auto w-full" role="img" aria-label="Abstract city map with civic issue markers">
          <rect width="420" height="260" rx="20" fill="#f7fbfd" />
          <path d="M26 84 C110 42 146 45 218 75 S334 114 394 70" stroke="#dcebf2" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M18 190 C92 164 140 174 210 146 S320 114 404 144" stroke="#dcebf2" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M116 18 L152 244" stroke="#eef7fb" strokeWidth="10" strokeLinecap="round" />
          <path d="M286 20 L250 244" stroke="#eef7fb" strokeWidth="10" strokeLinecap="round" />
          <path d="M42 32 L376 226" stroke="#eef7fb" strokeWidth="8" strokeLinecap="round" />
          <path d="M46 222 L382 32" stroke="#eef7fb" strokeWidth="8" strokeLinecap="round" />
          <circle cx="210" cy="132" r="48" fill="#e8f6fb" />
          <circle cx="210" cy="132" r="23" fill="#0787b7" opacity="0.9" />
          {reports.map((report) => {
            return (
              <g key={report.label}>
                <circle cx={report.x} cy={report.y} r="18" fill="#ffffff" />
                <circle cx={report.x} cy={report.y} r="10" fill={report.fill} />
              </g>
            )
          })}
        </svg>

        <div className="absolute left-6 top-6 rounded-xl bg-white/95 p-3 surface-raised">
          <p className="text-xs font-semibold text-muted-foreground">AI severity triage</p>
          <p className="text-sm font-bold text-primary">Active on upload</p>
        </div>
        <div className="absolute bottom-6 right-6 rounded-xl bg-white/95 p-3 surface-raised">
          <p className="text-xs font-semibold text-muted-foreground">Duplicate detection</p>
          <p className="text-sm font-bold text-foreground">Geo-merge enabled</p>
        </div>
      </div>
    </div>
  )
}

export default async function LandingPage() {
  let stats: DashboardStats | null = null
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/stats`, { cache: 'no-store' })
    if (res.ok) stats = await res.json()
  } catch (error) {
    console.error('Failed to fetch stats for landing page', error)
  }

  const statsAvailable = stats != null
  const activeReports = stats
    ? stats.reported + stats.community_verified + stats.in_progress
    : null
  const resolvedReports = stats ? stats.resolved : null
  const totalTracked = stats ? stats.total : null

  return (
    <LandingWrapper>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link className="flex items-center justify-center gap-2 focus-ring rounded-md" href="/">
              <img src="/logo.png" alt="Vigil Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
              <span className="text-xl font-bold tracking-normal text-primary">Vigil</span>
            </Link>
            <nav className="flex items-center gap-3 sm:gap-5">
              <Link href="/about" className="focus-ring rounded-md px-2 py-2 text-sm font-semibold hover:text-primary">About</Link>
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <section className="w-full border-b bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfd_100%)] py-20 md:py-28">
            <div className="container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-bold text-primary">
                  <Sparkles className="h-4 w-4" />
                  Civic intelligence for Indian wards
                </div>
                <h1 className="mt-6 text-display text-foreground">
                  Report civic issues with the confidence of a modern city dashboard.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                  Snap a photo, let AI classify the issue, and follow the report from community verification through resolution.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="min-h-12 px-6 font-bold surface-raised" asChild>
                    <Link href="/register">Report an issue <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" size="lg" className="min-h-12 px-6 font-bold" asChild>
                    <Link href="/issues">Explore live reports</Link>
                  </Button>
                </div>
              </div>
              <CivicMapConsole />
            </div>
          </section>

          <section className="border-b bg-card py-10">
            <div className="container grid gap-3 px-4 md:grid-cols-3 md:px-6">
              {[
                { label: 'Active reports', value: activeReports, icon: MapPin, note: 'Open, verified, or in progress' },
                { label: 'Resolved reports', value: resolvedReports, icon: CheckCircle, note: 'Completed civic fixes' },
                { label: 'Total tracked', value: totalTracked, icon: AlertTriangle, note: 'All issues in the system' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-[var(--radius-card)] border bg-background p-5 surface-flat">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="animate-count-soft text-3xl font-extrabold">
                      {item.value != null ? item.value.toLocaleString() : '—'}
                    </p>
                    <h3 className="mt-1 font-bold">{item.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.value != null ? item.note : 'Live stats unavailable — sign in to explore reports'}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="w-full py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:items-start">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">How Vigil works</p>
                  <h2 className="mt-3 text-title">A report becomes a city-ready ticket.</h2>
                  <p className="mt-4 text-muted-foreground">
                    The workflow is designed for trust: evidence first, machine triage second, transparent civic follow-through after that.
                  </p>
                </div>
                <div className="rounded-[var(--radius-panel)] border bg-card p-4 surface-raised">
                  {[
                    { title: 'Capture evidence', text: 'Photo, category hint, and location are bundled into a structured report.', icon: Camera },
                    { title: 'Classify and score', text: 'AI assigns type, severity, confidence, and duplicate signals.', icon: Brain },
                    { title: 'Verify in public', text: 'Nearby citizens add confirmations so noise becomes signal.', icon: ShieldCheck },
                    { title: 'Route and resolve', text: 'The ticket can be tracked until it is fixed or rejected with context.', icon: Route },
                  ].map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div key={step.title} className="grid gap-4 border-b p-4 last:border-b-0 md:grid-cols-[56px_1fr_80px] md:items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold">{step.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
                        </div>
                        <div className="text-sm font-black text-neutral-300 md:text-right">0{index + 1}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </LandingWrapper>
  )
}
