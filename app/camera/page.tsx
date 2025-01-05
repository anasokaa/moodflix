'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera } from '@/components/camera'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { Sparkles, Stars, Wand2, Users } from 'lucide-react'

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

export default function CameraPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentPerson, setCurrentPerson] = useState(0)
  const [totalPeople, setTotalPeople] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    const viewingMode = sessionStorage.getItem('viewingMode')
    const numberOfPeople = sessionStorage.getItem('numberOfPeople')
    const currentPersonIndex = sessionStorage.getItem('currentPersonIndex')

    if (viewingMode === 'group' && numberOfPeople) {
      setTotalPeople(parseInt(numberOfPeople))
      setCurrentPerson(currentPersonIndex ? parseInt(currentPersonIndex) : 0)
    }
  }, [])

  const handleImageCapture = useCallback(async (imageData: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Get selected platforms and viewing mode
      const selectedPlatforms = sessionStorage.getItem('selectedPlatforms')
      const viewingMode = sessionStorage.getItem('viewingMode')
      const platforms = selectedPlatforms ? JSON.parse(selectedPlatforms) : []

      if (viewingMode === 'solo') {
        // Solo mode - direct analysis
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: imageData,
            platforms
          })
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || t('movies.error'))
        }

        // Store the data in sessionStorage
        sessionStorage.setItem('movieData', JSON.stringify(data))
        sessionStorage.setItem('emotions', JSON.stringify(data.emotions))
        sessionStorage.setItem('previousMovies', JSON.stringify(data.movies.map((m: Movie) => m.title)))

      } else {
        // Group mode - collect emotions from all users
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: imageData,
            analyzeOnly: true
          })
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || t('movies.error'))
        }

        // Get existing group emotions
        const storedEmotions = sessionStorage.getItem('groupEmotions')
        const groupEmotions = storedEmotions ? JSON.parse(storedEmotions) : []
        
        // Add new emotions to the group
        groupEmotions.push(data.emotions)
        sessionStorage.setItem('groupEmotions', JSON.stringify(groupEmotions))
        
        // Update current person index
        const newIndex = currentPerson + 1
        sessionStorage.setItem('currentPersonIndex', newIndex.toString())

        if (newIndex < totalPeople) {
          // More people to capture
          setCurrentPerson(newIndex)
          setIsLoading(false)
          return
        } else {
          // All emotions collected, get movie suggestions
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              groupEmotions,
              platforms
            })
          })

          const movieData = await response.json()
          
          if (!response.ok) {
            throw new Error(movieData.error || t('movies.error'))
          }

          // Store the final data
          sessionStorage.setItem('movieData', JSON.stringify(movieData))
          sessionStorage.setItem('emotions', JSON.stringify(movieData.emotions))
          sessionStorage.setItem('previousMovies', JSON.stringify(movieData.movies.map((m: Movie) => m.title)))
        }
      }

      // Start the transition animation
      setIsTransitioning(true)

      // Wait for the animation to complete before navigating
      setTimeout(() => {
        router.push('/movie-reveal')
      }, 2000)
    } catch (err) {
      console.error('Error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [router, t, currentPerson, totalPeople])

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex items-center justify-center"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 1 }}
                className="relative"
              >
                <Wand2 className="w-16 h-16 text-primary animate-pulse" />
                <Stars className="w-8 h-8 text-primary absolute -top-4 -right-4 animate-bounce" />
                <Sparkles className="w-8 h-8 text-primary absolute -bottom-4 -left-4 animate-bounce" />
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

        {totalPeople > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-lg font-medium">
                Person {currentPerson + 1} of {totalPeople}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Let's capture your mood!
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto space-y-12"
        >
          <Camera onCapture={handleImageCapture} isLoading={isLoading} />
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-destructive"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  )
} 