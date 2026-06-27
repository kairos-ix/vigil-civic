'use client'

import WelcomeSplash from '@/components/layout/WelcomeSplash'

export default function LandingWrapper({ children }: { children: React.ReactNode }) {
  return <WelcomeSplash>{children}</WelcomeSplash>
}
