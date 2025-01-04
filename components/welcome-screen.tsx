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
      className="space-y-8"
    >
      <div className="flex justify-center gap-4 text-4xl">
        {['🍿', '🎬', '❤️'].map((emoji, i) => (
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

      <motion.div
        className="relative bg-card/50 backdrop-blur-sm p-8 rounded-xl space-y-4"
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

        <motion.h2
          className="text-2xl font-bold text-center relative"
          whileHover={{ scale: 1.05 }}
        >
          {t('welcome.title')}
        </motion.h2>

        <motion.p
          className="text-center text-muted-foreground"
          whileHover={{ scale: 1.05 }}
        >
          {t('welcome.subtitle')}
        </motion.p>

        <motion.div
          className="space-y-3 mt-6 max-w-sm mx-auto"
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
          <div className="flex flex-col gap-3">
            {[
              { icon: Camera, text: t('welcome.features.express') },
              { icon: Film, text: t('welcome.features.picks') },
              { icon: Sparkles, text: t('welcome.features.discover') }
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 cursor-pointer"
                whileHover={{ x: 10, scale: 1.02 }}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-lg">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            className="gap-2 relative px-8 py-6 text-lg"
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.span>
            <span>{t('welcome.startButton')}</span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 