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
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto px-4"
    >
      {/* Fun Emoji Header */}
      <div className="flex justify-center gap-4 text-4xl">
        {['🍿', '🎬', '🎭', '✨'].map((emoji, i) => (
          <motion.span
            key={emoji}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.6,
              delay: i * 0.2,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="cursor-pointer"
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* Main Content Card */}
      <motion.div
        className="relative bg-card/50 backdrop-blur-sm p-8 rounded-xl space-y-6"
        whileHover={{ scale: 1.02 }}
        animate={isHovered ? { y: 0 } : floatAnimation}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Floating stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [Math.random() * 100, Math.random() * 200],
                y: [Math.random() * 100, Math.random() * 200],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.6,
              }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </div>

        {/* Title and Subtitle */}
        <div className="text-center space-y-3">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
            whileHover={{ scale: 1.05 }}
          >
            {t('welcome.title')}
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground"
            whileHover={{ scale: 1.05 }}
          >
            {t('welcome.subtitle')}
          </motion.p>
        </div>

        {/* Description */}
        <motion.p
          className="text-center text-muted-foreground text-lg"
          whileHover={{ scale: 1.05 }}
        >
          {t('welcome.description')}
        </motion.p>

        {/* Features */}
        <motion.div
          className="space-y-4"
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {[
            { icon: Camera, text: t('welcome.features.express') },
            { icon: Film, text: t('welcome.features.picks') },
            { icon: Sparkles, text: t('welcome.features.discover') }
          ].map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/10 cursor-pointer transition-colors"
              whileHover={{ x: 10, scale: 1.02 }}
              variants={{
                hidden: { opacity: 0, x: -20 },
                show: { opacity: 1, x: 0 }
              }}
            >
              <Icon className="w-6 h-6 text-accent shrink-0" />
              <span className="text-lg">{text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Start Button */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            className="gap-2 relative px-8 py-6 text-lg font-semibold"
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.span>
            <span>{t('welcome.start')}</span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 