'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { Camera, Popcorn, Sparkles } from 'lucide-react'

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/5" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-2xl mx-auto text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo and Title */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            MoodFlix <Sparkles className="inline-block w-8 h-8 text-primary" />
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            {t('welcome.subtitle')}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-primary/10 space-y-3">
            <Camera className="w-8 h-8 text-primary mx-auto" />
            <p className="text-lg font-medium">Take a Selfie</p>
            <p className="text-sm text-muted-foreground">Let us analyze your mood through your expression</p>
          </div>
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-primary/10 space-y-3">
            <Sparkles className="w-8 h-8 text-primary mx-auto" />
            <p className="text-lg font-medium">AI Magic</p>
            <p className="text-sm text-muted-foreground">Our AI matches your mood with perfect movies</p>
          </div>
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-primary/10 space-y-3">
            <Popcorn className="w-8 h-8 text-primary mx-auto" />
            <p className="text-lg font-medium">Movie Time</p>
            <p className="text-sm text-muted-foreground">Get personalized movie suggestions just for you</p>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          onClick={onStart}
          className="mt-12 px-8 py-4 text-lg font-medium bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {t('welcome.start')} <Sparkles className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  )
} 