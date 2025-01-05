'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera } from '@/components/camera'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { Sparkles } from 'lucide-react'

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
      }, 1000)
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
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="h-full flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 0] }}
                transition={{ duration: 1, times: [0, 0.5, 1] }}
                className="text-6xl"
              >
                <Sparkles className="w-16 h-16 text-primary animate-pulse" />
              </motion.div>
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