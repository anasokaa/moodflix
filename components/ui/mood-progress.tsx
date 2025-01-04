'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MoodProgressProps {
  message: string
  isLoading: boolean
}

export function MoodProgress({ message, isLoading }: MoodProgressProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '✨'))
      }, 400)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-4 p-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <motion.div
        className="h-16 w-16 rounded-full border-4 border-primary"
        animate={{
          rotate: isLoading ? 360 : 0,
          borderRadius: ['50%', '40%', '50%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.p
        className="text-lg font-medium"
        animate={{ opacity: [0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {message}{dots}
      </motion.p>
    </motion.div>
  )
} 