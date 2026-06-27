import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Activity, ArrowRight, Clock, Copy, Eye, EyeOff, GitMerge, Lock, MapPin, Shield, Sparkles, Target, Trophy, Users } from 'lucide-react'

function TrustStackVisual() {
  return (
    <div className="mx-auto w-full max-w-[640px] rounded-[var(--radius-panel)] border bg-card p-5 surface-floating">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Civic trust model</p>
          <h2 className="text-lg font-bold">Evidence to resolution</h2>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">transparent by default</div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.9fr] md:gap-6">
        <div className="grid gap-2">
          {[
            { title: 'Citizen evidence', note: 'Photo + GPS + timestamp', icon: Users, tone: 'text-primary bg-primary/10' },
            { title: 'AI triage', note: 'Category, severity, duplicate signal', icon: Sparkles, tone: 'text-primary bg-primary/10' },
            { title: 'Community proof', note: 'Upvotes and verification', icon: Shield, tone: 'text-primary bg-primary/10' },
            { title: 'Resolution history', note: 'Status changes stay visible', icon: Trophy, tone: 'text-primary bg-primary/10' },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="grid grid-cols-[44px_1fr_36px] items-center gap-2 rounded-xl border bg-background p-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
                <div className="text-right text-sm font-black text-neutral-300">0{index + 1}</div>
              </div>
            )
          })}
        </div>
        <div className="relative w-full overflow-hidden rounded-[var(--radius-card)] md:self-center" style={{ aspectRatio: "1055 / 1491" }}>
          <Image
            src="/images/status-timeline.png"
            alt="Public issue page showing status timeline with submission, verification, and resolution steps"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <>
      <section className="border-b bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfd_100%)] py-14 md:py-20" data-motion-surface>
        <div className="container grid items-center gap-10 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-bold text-primary">
              <Target className="mr-2 h-4 w-4" /> Our mission
            </div>
            <h1 className="mt-5 text-display">Make civic reporting feel accountable again.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Vigil turns scattered complaints into structured civic intelligence: visible to citizens, legible to city teams, and measurable over time.
            </p>
          </div>
          <TrustStackVisual />
        </div>
      </section>

      <section className="border-b bg-card py-14 md:py-20" data-motion-surface>
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
                  <div key={item.label} className="grid gap-4 border-b p-4 last:border-b-0 sm:grid-cols-[52px_1fr_auto] sm:items-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
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

      <section className="py-14 md:py-20" data-motion-surface>
        <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="rounded-[var(--radius-panel)] border bg-primary p-8 text-primary-foreground surface-floating">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/75">The belief</p>
            <blockquote className="mt-4 text-3xl font-extrabold leading-tight">
              A city improves faster when its residents can see what happened after they cared enough to report.
            </blockquote>
          </div>
          <div>
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-title">Power back to the community.</h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Every pothole, broken light, or leaking pipe becomes part of a shared operating record. Vigil rewards useful reports and turns local attention into clear civic momentum.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y bg-secondary/70 py-14 md:py-20" data-motion-surface>
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">How we fix it</p>
              <h2 className="mt-3 text-title">AI helps, but accountability is the product.</h2>
              <p className="mt-4 text-muted-foreground">
                Image analysis, geospatial clustering, and email-verified accounts — every layer is built to restore trust.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius-card)] border bg-card p-4 surface-flat">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="mt-3 font-bold">Instant AI Triage</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Upload a photo and Gemini Vision AI extracts the category, severity, and title automatically. Images are stored securely on Cloudinary.
                </p>
                <div className="relative mt-3 w-full overflow-hidden rounded-[var(--radius-card)]" style={{ aspectRatio: "1774 / 887" }}>
                  <Image
                    src="/images/ai-reporting-flow.png"
                    alt="Report form showing photo upload with auto-generated category and severity fields"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="rounded-[var(--radius-card)] border bg-card p-4 surface-flat">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GitMerge className="h-4 w-4" />
                </div>
                <h3 className="mt-3 font-bold">Smart Grouping</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Duplicate reports within 200 metres are merged automatically. Clusters of three or more issues in 30 days trigger an infrastructure alert.
                </p>
                <div className="relative mt-3 w-full overflow-hidden rounded-[var(--radius-card)]" style={{ aspectRatio: "1536 / 1024" }}>
                  <Image
                    src="/images/cluster-detection.png"
                    alt="Map view with clustered issue pins and an infrastructure alert"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="rounded-[var(--radius-card)] border bg-card p-4 surface-flat md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold">Secure authentication</span>
                    <p className="text-xs text-muted-foreground">Email verification via Resend, JWT sessions, bcrypt hashing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20" data-motion-surface>
        <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Incentive, not charity</p>
            <h2 className="mt-3 text-title">Earn points for civic action.</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Reporting an issue earns 10 points. Verifying someone else's report earns 5. Badges unlock automatically as you hit point thresholds.
            </p>
            <div className="mt-6 grid gap-2">
              {[
                { action: 'Submit a report', points: '+10 points', icon: Trophy },
                { action: 'Verify an issue', points: '+5 points', icon: Users },
                { action: 'Level thresholds', points: 'Badges unlock automatically', icon: Target },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.action} className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-xl border bg-background p-3">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold leading-tight">{item.action}</span>
                    </div>
                    <span className="text-xs font-bold text-primary text-right sm:text-left">{item.points}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="relative w-full max-w-[400px] overflow-hidden rounded-[var(--radius-panel)] justify-self-center" style={{ aspectRatio: "1 / 1" }}>
            <Image
              src="/images/gamification-badges.png"
              alt="Vigil civic achievement badges for community participation"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      <section className="border-y bg-secondary/70 py-14 md:py-20" data-motion-surface>
        <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">See the bigger picture</p>
            <h2 className="mt-3 text-title">Live city-wide visibility.</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Every issue is plotted on a Leaflet-powered map fed by real-time GeoJSON coordinates from the database. Switch between a trending feed and the geographic view to see where problems are concentrated.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold">Real-time plotting with Leaflet.js</span>
            </div>
          </div>
          <div className="relative w-full overflow-hidden rounded-[var(--radius-panel)] surface-floating" style={{ aspectRatio: "4 / 3" }}>
            <Image
              src="/images/live-map-dashboard.png"
              alt="Map dashboard with issue pins across a neighbourhood and a sidebar feed"
              fill
              className="object-contain bg-background"
            />
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20" data-motion-surface>
        <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div className="relative w-full overflow-hidden rounded-[var(--radius-panel)] surface-floating" style={{ aspectRatio: "1672 / 941" }}>
            <Image
              src="/images/official-control-panel.png"
              alt="Official dashboard listing prioritized issues with status controls"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">For the city side</p>
            <h2 className="mt-3 text-title">Built for officials too.</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              A dedicated dashboard surfaces AI-prioritized issues sorted by severity and cluster density. Mark reports as In Progress or Resolved — every status change is pushed to the public timeline.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold">Role-gated dashboard with status controls</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20" data-motion-surface>
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
    </>
  )
}
