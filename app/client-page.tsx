'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera } from '@/components/camera'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { Sparkles, Stars, Wand2 } from 'lucide-react'

interface Movie {
  title: string
  description: string
  matchReason: string
  posterUrl: string
  streamingPlatforms: string[]
}

interface EmotionData {
  anger: number
  disgust: number
  fear: number
  happiness: number
  neutral: number
  sadness: number
  surprise: number
}

export default function ClientPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleImageCapture = useCallback(async (imageData: string) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || t('movies.error'))
      }

      // Store the data in sessionStorage
      sessionStorage.setItem('movieData', JSON.stringify(data))
      sessionStorage.setItem('emotions', JSON.stringify(data.emotions))
      sessionStorage.setItem('previousMovies', JSON.stringify(data.movies.map((m: Movie) => m.title)))

      // Start the transition animation
      setIsTransitioning(true)

      // Wait for the animation to complete before navigating
      setTimeout(() => {
        router.push('/movie-reveal')
      }, 2000)
    } catch (err) {
      console.error('Error:', err)
      setIsLoading(false)
    }
  }, [router, t])

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="h-full flex items-center justify-center relative overflow-hidden">
              {/* Magic circle */}
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.5, 3], rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute w-32 h-32 rounded-full border-2 border-primary/30"
              />
              
              {/* Inner circle with sparkles */}
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.2, 2], rotate: -360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute w-24 h-24 rounded-full border-2 border-primary/50"
              />

              {/* Center sparkle */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.5, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  times: [0, 0.5, 1],
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <Wand2 className="w-16 h-16 text-primary animate-pulse absolute -left-8 -top-8" />
                <Stars className="w-16 h-16 text-purple-500 animate-pulse absolute -right-8 -top-8" />
                <Sparkles className="w-16 h-16 text-yellow-500 animate-pulse" />
              </motion.div>

              {/* Floating particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    opacity: 0 
                  }}
                  animate={{ 
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: Math.random() * 0.5,
                    ease: "easeInOut"
                  }}
                  className="absolute w-1 h-1 bg-primary rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen p-6 space-y-12">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          MoodFlix ✨
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto space-y-12"
        >
          <Camera onCapture={handleImageCapture} isLoading={isLoading} />
        </motion.div>
      </div>
    </>
  )
} 