'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { Film, Camera, Sparkles, Star } from 'lucide-react'
import { useState } from 'react'

interface WelcomeScreenProps {
  onStart: () => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
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
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center min-h-screen space-y-12 px-4 text-center"
    >
      {/* Logo and Title */}
      <motion.div 
        className="relative space-y-4"
        variants={item}
      >
        <motion.div
          className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl"
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.8 : 0.5
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.h1
          className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent relative"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
        >
          {t('welcome.title')}
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground"
          variants={item}
        >
          {t('welcome.subtitle')}
        </motion.p>
      </motion.div>

      {/* Features */}
      <motion.div 
        className="grid gap-6 md:grid-cols-3 max-w-3xl"
        variants={container}
      >
        <motion.div
          className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border shadow-lg"
          variants={item}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <motion.div animate={floatAnimation}>
            <Camera className="w-8 h-8 mb-4 text-pink-500" />
          </motion.div>
          <h3 className="font-semibold mb-2">{t('welcome.features.express')}</h3>
        </motion.div>

        <motion.div
          className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border shadow-lg"
          variants={item}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <motion.div animate={floatAnimation}>
            <Film className="w-8 h-8 mb-4 text-purple-500" />
          </motion.div>
          <h3 className="font-semibold mb-2">{t('welcome.features.picks')}</h3>
        </motion.div>

        <motion.div
          className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border shadow-lg"
          variants={item}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <motion.div animate={floatAnimation}>
            <Sparkles className="w-8 h-8 mb-4 text-yellow-500" />
          </motion.div>
          <h3 className="font-semibold mb-2">{t('welcome.features.discover')}</h3>
        </motion.div>
      </motion.div>

      {/* Description */}
      <motion.p
        className="max-w-xl text-lg text-muted-foreground"
        variants={item}
      >
        {t('welcome.description')}
      </motion.p>

      {/* Start Button */}
      <motion.div variants={item}>
        <Button
          onClick={onStart}
          size="lg"
          className="text-lg gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 shadow-lg"
        >
          {t('welcome.start')}
          <Star className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  )
} 