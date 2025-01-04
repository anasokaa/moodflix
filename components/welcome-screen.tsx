'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { Film, Camera, Sparkles, Star } from 'lucide-react'
import { useState } from 'react'

interface WelcomeScreenProps {
  onStart: () => void
}

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut"
  }
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen space-y-12 px-4 text-center"
    >
      {/* Logo and Emojis */}
      <motion.div className="space-y-4">
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          MoodFlix
        </motion.h1>
        <div className="flex justify-center gap-4 text-3xl">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            🍿
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            🎬
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            ❤️
          </motion.span>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            Ready for Movie Magic? ✨
          </h2>
          <p className="text-muted-foreground">
            Show us your mood, unlock your perfect movie match!
          </p>
        </div>

        <div className="space-y-4 text-left">
          <motion.div
            className="flex items-center gap-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span>📸</span>
            <span>Express yourself</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span>🎯</span>
            <span>Get personalized picks</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span>✨</span>
            <span>Discover hidden gems</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          onClick={onStart}
          size="lg"
          className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg rounded-full"
        >
          Start Your Journey! ✨
        </Button>
      </motion.div>
    </motion.div>
  )
} 