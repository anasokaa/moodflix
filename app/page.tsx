'use client'

import { useState } from 'react'
import ClientPage from './client-page'
import { useLanguage } from '@/lib/language-context'
import { WelcomeScreen } from '@/components/welcome-screen'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { t } = useLanguage()
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl" suppressHydrationWarning>
      <div className="space-y-8" suppressHydrationWarning>
        <div className="text-center space-y-2" suppressHydrationWarning>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent inline-block cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWelcome(true)}
          >
            {t('title')}
          </motion.h1>
        </div>

        <AnimatePresence mode="wait">
          {showWelcome ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <WelcomeScreen onStart={() => setShowWelcome(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="client"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ClientPage onBack={() => setShowWelcome(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
} 