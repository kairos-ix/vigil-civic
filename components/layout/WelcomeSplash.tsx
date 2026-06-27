'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WelcomeSplash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [splashComplete, setSplashComplete] = useState(false)

  const dismiss = useCallback(() => {
    setShowSplash(false)
    try { sessionStorage.setItem('vigil-splash-seen', 'true') } catch {}
    setTimeout(() => setSplashComplete(true), 100)
  }, [])

  useEffect(() => {
    try {
      if (sessionStorage.getItem('vigil-splash-seen')) {
        queueMicrotask(() => {
          setShowSplash(false)
          setSplashComplete(true)
        })
        return
      }
    } catch {}

    const timer = setTimeout(dismiss, 2800)
    return () => clearTimeout(timer)
  }, [dismiss])

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer overflow-hidden"
            style={{ background: 'oklch(0.99 0.01 250)' }}
            onClick={dismiss}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex flex-col items-center justify-center gap-6 p-4">
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              >
                <img
                  src="/logo.png"
                  alt="Vigil"
                  className="w-20 h-20 object-contain"
                />
              </motion.div>

              <motion.span
                className="text-3xl font-bold tracking-tight"
                style={{ color: 'oklch(0.15 0.02 250)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >
                Vigil
              </motion.span>

              <motion.div
                className="h-px rounded-full"
                style={{ background: 'oklch(0.45 0.12 250)' }}
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ duration: 0.5, delay: 0.55, ease: [0.4, 0, 0.2, 1] }}
              />

              <motion.p
                className="text-base font-medium"
                style={{ color: 'oklch(0.5 0.05 250)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
              >
                Civic Issue Reporting
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={!splashComplete ? "h-[100dvh] overflow-hidden" : ""}
        style={{
          opacity: splashComplete ? 1 : 0,
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
      </div>
    </>
  )
}