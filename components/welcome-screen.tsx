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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center gradient-bg relative overflow-hidden"
    >
      {/* Floating movie elements background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              x: Math.random() * 100 - 50 + '%',
              y: Math.random() * 100 - 50 + '%',
              scale: 0.5,
              opacity: 0.3
            }}
            animate={{
              y: ['-20%', '20%'],
              x: ['-20%', '20%'],
              scale: [0.8, 1.2],
              opacity: [0.3, 0.6]
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            {['🎬', '🎭', '🍿', '🎪', '✨', '🎯'][i]}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="space-y-8 relative z-10 backdrop-blur-sm bg-background/50 p-8 rounded-2xl border shadow-xl max-w-3xl"
      >
        <div className="space-y-4">
          <motion.div
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
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
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 blur-xl"
              animate={{
                opacity: [0.5, 0.8],
                scale: [0.98, 1.02]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </motion.div>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground"
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
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(var(--primary), 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span className="relative z-10">{t('welcome.start')} 🎬</span>
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/80 to-purple-600/80"
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />
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
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 30px -10px rgba(var(--primary), 0.3)",
                  backgroundColor: "hsl(var(--primary) / 0.1)"
                }}
                className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border shadow-sm transition-colors duration-200"
              >
                <motion.span 
                  className="text-3xl mb-3 block"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.emoji}
                </motion.span>
                <p className="text-sm text-muted-foreground">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 