import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Activity, ArrowRight, Clock, Copy, EyeOff, GitMerge, Shield, Sparkles, Target, Trophy, Users } from 'lucide-react'

function TrustStackVisual() {
  return (
    <div className="mx-auto w-full max-w-[560px] rounded-[var(--radius-panel)] border bg-card p-5 surface-floating">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Civic trust model</p>
          <h2 className="text-lg font-bold">Evidence to resolution</h2>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">transparent by default</div>
      </div>
      <div className="grid gap-3">
        {[
          { title: 'Citizen evidence', note: 'Photo + GPS + timestamp', icon: Users, tone: 'text-primary bg-primary/10' },
          { title: 'AI triage', note: 'Category, severity, duplicate signal', icon: Sparkles, tone: 'text-primary bg-primary/10' },
          { title: 'Community proof', note: 'Upvotes and verification', icon: Shield, tone: 'text-primary bg-primary/10' },
          { title: 'Resolution history', note: 'Status changes stay visible', icon: Trophy, tone: 'text-primary bg-primary/10' },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="grid grid-cols-[48px_1fr_42px] items-center gap-3 rounded-xl border bg-background p-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.note}</p>
              </div>
              <div className="text-right text-sm font-black text-neutral-300">0{index + 1}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link className="flex items-center justify-center gap-2 focus-ring rounded-md" href="/">
            <img src="/logo.png" alt="Vigil Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
            <span className="text-xl font-bold tracking-normal text-primary">Vigil</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5">
            <Link href="/about" className="focus-ring rounded-md px-2 py-2 text-sm font-semibold text-primary">About</Link>
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
        <section className="border-b bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfd_100%)] py-16 md:py-24">
          <div className="container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-bold text-primary">
                <Target className="mr-2 h-4 w-4" /> Our mission
              </div>
              <h1 className="mt-6 text-display">Make civic reporting feel accountable again.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Vigil turns scattered complaints into structured civic intelligence: visible to citizens, legible to city teams, and measurable over time.
              </p>
            </div>
            <TrustStackVisual />
          </div>
        </section>

        <section className="border-b bg-card py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">The old pattern</p>
                <h2 className="mt-3 text-title">Most civic reporting breaks after submission.</h2>
                <p className="mt-4 text-muted-foreground">
                  The problem is not just forms. It is the missing chain of evidence, routing, and feedback that makes citizens stop believing the process works.
                </p>
              </div>

              <div className="rounded-[var(--radius-panel)] border bg-background surface-raised">
                {[
                  { label: 'Invisible queue', metric: 'No public status trail for reports', icon: EyeOff },
                  { label: 'Manual triage', metric: 'Slow, manual categorization of issues', icon: Clock },
                  { label: 'Duplicate noise', metric: 'Multiple people reporting the same pothole', icon: Copy },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="grid gap-4 border-b p-5 last:border-b-0 sm:grid-cols-[52px_1fr_auto] sm:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.metric}</p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary surface-flat">trust leak</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container grid gap-12 px-4 md:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="rounded-[var(--radius-panel)] border bg-primary p-8 text-primary-foreground surface-floating">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/75">The belief</p>
              <blockquote className="mt-4 text-3xl font-extrabold leading-tight">
                A city improves faster when its residents can see what happened after they cared enough to report.
              </blockquote>
            </div>
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-title">Power back to the community.</h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Every pothole, broken light, or leaking pipe becomes part of a shared operating record. Vigil rewards useful reports and turns local attention into clear civic momentum.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y bg-secondary/70 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">How we fix it</p>
                <h2 className="mt-3 text-title">AI helps, but accountability is the product.</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Instant AI Triage', text: 'Upload a photo, and our AI automatically categorizes the issue and sets a severity level.', icon: Activity },
                  { title: 'Smart Grouping', text: 'If multiple people report the same issue nearby, the system automatically groups them together.', icon: GitMerge },
                  { title: 'Civic Rewards', text: 'Earn points and level up your profile by reporting real issues and verifying others.', icon: Trophy },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="rounded-[var(--radius-card)] border bg-card p-5 surface-flat hover-lift">
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container flex flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center md:px-6">
            <div>
              <h2 className="text-3xl font-extrabold">Ready to make the street-level signal visible?</h2>
              <p className="mt-2 text-muted-foreground">Join citizens turning everyday issues into tracked civic outcomes.</p>
            </div>
            <Button size="lg" className="min-h-12 font-bold" asChild>
              <Link href="/register">Start reporting <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
