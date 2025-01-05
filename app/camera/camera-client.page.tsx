'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
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

const TransitionAnimation = ({ isTransitioning }: { isTransitioning: boolean }) => {
  const particles = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      left: `${50 + Math.cos(i * Math.PI / 4) * 100}%`,
      top: `${50 + Math.sin(i * Math.PI / 4) * 100}%`,
      delay: i * 0.1
    }))
  }, [])

  if (!isTransitioning) return null

  return (
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
          transition={{ type: "spring", duration: 0.5 }}
          className="relative"
        >
          <Wand2 className="w-16 h-16 text-primary animate-pulse" />
          <Stars className="w-8 h-8 text-primary absolute -top-4 -right-4 animate-bounce" />
          <Sparkles className="w-8 h-8 text-primary absolute -bottom-4 -left-4 animate-bounce" />
        </motion.div>

        {particles.map((particle, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1,
              delay: particle.delay,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: particle.left,
              top: particle.top
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function CameraClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentPerson, setCurrentPerson] = useState(0)
  const [totalPeople, setTotalPeople] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const viewingMode = sessionStorage.getItem('viewingMode')
    const numberOfPeople = sessionStorage.getItem('numberOfPeople')
    const currentPersonIndex = sessionStorage.getItem('currentPersonIndex')
    const selectedPlatforms = sessionStorage.getItem('selectedPlatforms')

    if (!viewingMode) {
      router.push('/')
      return
    }

    if (!selectedPlatforms) {
      router.push('/streaming-platforms')
      return
    }

    if (viewingMode === 'group' && !numberOfPeople) {
      router.push('/group-setup')
      return
    }

    if (viewingMode === 'group' && numberOfPeople) {
      setTotalPeople(parseInt(numberOfPeople))
      setCurrentPerson(currentPersonIndex ? parseInt(currentPersonIndex) : 0)
    }
  }, [router])

  const handleImageCapture = useCallback(async (imageData: string, emotions: EmotionData) => {
    if (isLoading || typeof window === 'undefined') return
    
    try {
      setIsLoading(true)
      setError(null)

      const viewingMode = sessionStorage.getItem('viewingMode')
      const selectedPlatforms = sessionStorage.getItem('selectedPlatforms')
      const platforms = selectedPlatforms ? JSON.parse(selectedPlatforms) : []

      if (viewingMode === 'solo') {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emotions, platforms })
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || t('movies.error'))
        }

        sessionStorage.setItem('movieData', JSON.stringify(data))
        sessionStorage.setItem('emotions', JSON.stringify(data.emotions))
        sessionStorage.setItem('previousMovies', JSON.stringify(data.movies.map((m: Movie) => m.title)))
      } else {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emotions, analyzeOnly: true })
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || t('movies.error'))
        }

        const storedEmotions = sessionStorage.getItem('groupEmotions')
        const groupEmotions = storedEmotions ? JSON.parse(storedEmotions) : []
        
        groupEmotions.push(data.emotions)
        sessionStorage.setItem('groupEmotions', JSON.stringify(groupEmotions))
        
        const newIndex = currentPerson + 1
        sessionStorage.setItem('currentPersonIndex', newIndex.toString())

        if (newIndex < totalPeople) {
          setCurrentPerson(newIndex)
          setIsLoading(false)
          return
        } else {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupEmotions, platforms })
          })

          const movieData = await response.json()
          
          if (!response.ok) {
            throw new Error(movieData.error || t('movies.error'))
          }

          sessionStorage.setItem('movieData', JSON.stringify(movieData))
          sessionStorage.setItem('emotions', JSON.stringify(movieData.emotions))
          sessionStorage.setItem('previousMovies', JSON.stringify(movieData.movies.map((m: Movie) => m.title)))
        }
      }

      setIsTransitioning(true)
      setTimeout(() => {
        router.push('/movie-reveal')
      }, 2000)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
    }
  }, [router, t, currentPerson, totalPeople, isLoading])

  return (
    <div className="h-screen flex flex-col p-4 bg-gradient-to-b from-black via-background to-primary/5">
      <AnimatePresence mode="wait">
        <TransitionAnimation isTransitioning={isTransitioning} />
      </AnimatePresence>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full gap-4">
        <motion.h1
          className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          MoodFlix ✨
        </motion.h1>

        {totalPeople > 1 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-lg font-medium">
                Person {currentPerson + 1} of {totalPeople}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Let's capture your mood!
            </p>
          </div>
        )}

        <div className="flex-1 flex items-center">
          <div className="w-full max-h-[70vh]">
            <Camera onCapture={handleImageCapture} isLoading={isLoading} />
          </div>
        </div>

        {error && (
          <div className="text-center text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 