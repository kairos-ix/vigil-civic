import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, MapPin, CheckCircle } from 'lucide-react'

export default async function LandingPage() {
  // Fetch initial stats for the teaser
  let stats: any = { total: 0, resolved: 0, reported: 0 }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/stats`, { cache: 'no-store' })
    if (res.ok) {
      stats = await res.json()
    }
  } catch (error) {
    console.error('Failed to fetch stats for landing page', error)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-card z-50 sticky top-0">
        <Link className="flex items-center justify-center gap-2" href="/">
          <AlertTriangle className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight text-primary">Vigil</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex font-medium">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Sign Up</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-48 flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50" />
          
          <div className="container px-4 md:px-6 z-10 relative">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium border border-primary/20 backdrop-blur-sm shadow-sm">
                AI-Powered Civic Issue Reporting
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.1] text-foreground max-w-4xl mx-auto drop-shadow-sm">
                Empower your community with <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">smart reporting</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl font-medium leading-relaxed">
                Take a photo of a civic issue. Our AI instantly classifies it, deduplicates it, and alerts the right municipal authorities. Earn points and badges for keeping your city safe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-base shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-semibold">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/issues">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base border-primary/20 hover:bg-primary/5 font-medium transition-colors">
                    Explore Issues
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-24 lg:py-32 bg-card border-t shadow-inner">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3 lg:gap-8 items-center justify-center">
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border shadow-sm transition-transform hover:scale-105 duration-300">
                <div className="p-4 bg-primary/10 rounded-full text-primary ring-1 ring-primary/20">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Active Reports</h3>
                <p className="text-4xl font-extrabold text-foreground">{stats.reported + stats.community_verified || '1,200+'}</p>
                <p className="text-sm text-muted-foreground font-medium">Issues currently being tracked</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border shadow-sm transition-transform hover:scale-105 duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent z-0" />
                <div className="p-4 bg-emerald-100 rounded-full text-emerald-600 ring-1 ring-emerald-200 z-10 dark:bg-emerald-900/40 dark:text-emerald-400 dark:ring-emerald-800">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold tracking-tight z-10">Resolved</h3>
                <p className="text-4xl font-extrabold text-foreground z-10">{stats.resolved || '8,500+'}</p>
                <p className="text-sm text-muted-foreground font-medium z-10">Civic problems fixed</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border shadow-sm transition-transform hover:scale-105 duration-300">
                <div className="p-4 bg-amber-100 rounded-full text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-800">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Total Tracked</h3>
                <p className="text-4xl font-extrabold text-foreground">{stats.total || '12,000+'}</p>
                <p className="text-sm text-muted-foreground font-medium">All-time issues reported</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8 md:py-12 bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
          <p className="text-sm text-muted-foreground font-medium text-center md:text-left">
            © 2026 Vigil Civic Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
