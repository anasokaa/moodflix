'use client'

import { useState } from 'react'
import ClientPage from './client-page'
import { WelcomeScreen } from '@/components/welcome-screen'
import { motion, AnimatePresence } from 'framer-motion'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  const [started, setStarted] = useState(false)

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-background to-background/50">
      {/* Controls - Fixed position with high z-index */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-[100]">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {started ? (
            <ClientPage onBack={() => setStarted(false)} />
          ) : (
            <WelcomeScreen onStart={() => setStarted(true)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 