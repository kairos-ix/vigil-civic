'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function PageTransition({
  children,
  skipPrefixes = [],
}: {
  children: React.ReactNode
  skipPrefixes?: string[]
}) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const shouldSkip = skipPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (shouldSkip) {
    return <>{children}</>
  }

  if (reduceMotion) {
    return <div className="page-transition-root">{children}</div>
  }

  return (
    <motion.div
      key={pathname}
      className="page-transition-root"
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
