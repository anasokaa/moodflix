'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WelcomeScreen } from '@/components/welcome-screen'
import ClientPage from './client-page'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSelector } from '@/components/language-selector'

export default function Home() {
  const [started, setStarted] = useState(false)

  return (
    <main className="relative min-h-screen">
      {/* Fixed controls */}
      <motion.div 
        className="fixed top-4 right-4 flex items-center gap-2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <LanguageSelector />
        <ThemeToggle />
      </motion.div>

      <AnimatePresence mode="wait">
        {started ? (
          <motion.div
            key="client"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ClientPage />
            <motion.button
              className="fixed top-4 left-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors"
              onClick={() => setStarted(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <WelcomeScreen onStart={() => setStarted(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
} 