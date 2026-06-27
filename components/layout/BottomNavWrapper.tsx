'use client'

import dynamic from 'next/dynamic'

const BottomNav = dynamic(() => import('@/components/layout/BottomNav').then(m => ({ default: m.BottomNav })), { ssr: false })

export default function BottomNavWrapper() {
  return <BottomNav />
}
