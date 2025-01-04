'use client'

import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center gradient-bg"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
            animate={{ 
              backgroundPosition: ["0%", "100%"],
              color: ["hsl(var(--primary))", "hsl(var(--primary))"] 
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            MoodFlix ✨
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t('welcome.description')}
          </motion.p>
        </div>

        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {t('welcome.start')} 🎬
          </motion.button>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { emoji: '📸', text: t('welcome.feature1') },
              { emoji: '🎭', text: t('welcome.feature2') },
              { emoji: '🍿', text: t('welcome.feature3') }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border shadow-sm"
              >
                <span className="text-2xl mb-2 block">{feature.emoji}</span>
                <p className="text-sm text-muted-foreground">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 