'use client'

import { useState } from 'react'
import ClientPage from './client-page'
import { WelcomeScreen } from '@/components/welcome-screen'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen"
            >
              <WelcomeScreen onStart={() => setShowWelcome(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="client"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen"
            >
              <ClientPage onBack={() => setShowWelcome(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
} 