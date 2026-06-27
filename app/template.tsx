import PageTransition from '@/components/layout/PageTransition'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition
      skipPrefixes={[
        '/dashboard',
        '/issues',
        '/leaderboard',
        '/map',
        '/profile',
        '/report',
        '/login',
        '/register',
        '/request-reset',
        '/reset-password',
      ]}
    >
      {children}
    </PageTransition>
  )
}
