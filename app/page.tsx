'use client'

import { useState } from 'react'
import ClientPage from './client-page'
import { WelcomeScreen } from '@/components/welcome-screen'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <div className="min-h-screen w-full gradient-bg">
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WelcomeScreen onStart={() => setShowWelcome(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="client"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ClientPage onBack={() => setShowWelcome(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 