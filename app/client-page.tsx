'use client'

import { useCallback, useState } from 'react'
import { Camera } from '@/components/camera'
import { MovieSuggestions } from '@/components/movie-suggestions'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'

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
  const [movies, setMovies] = useState<Movie[]>([])
  const [emotions, setEmotions] = useState<EmotionData>()
  const [error, setError] = useState<string>()
  const { t } = useLanguage()

  const handleImageCapture = useCallback(async (imageData: string) => {
    try {
      setIsLoading(true)
      setError(undefined)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      })

      if (!response.ok) {
        throw new Error(t('movies.error'))
      }

      const data = await response.json()
      if (!data.movies || data.movies.length === 0) {
        throw new Error(t('movies.error'))
      }

      setMovies(data.movies)
      setEmotions(data.emotions)
    } catch (err) {
      console.error('Error analyzing image:', err)
      setError(err instanceof Error ? err.message : t('movies.error'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  const handleGenerateMore = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(undefined)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotions, previousMovies: movies.map(m => m.title) }),
      })

      if (!response.ok) {
        throw new Error(t('movies.error'))
      }

      const data = await response.json()
      if (!data.movies || data.movies.length === 0) {
        throw new Error(t('movies.error'))
      }

      setMovies(data.movies)
    } catch (err) {
      console.error('Error generating more movies:', err)
      setError(err instanceof Error ? err.message : t('movies.error'))
    } finally {
      setIsLoading(false)
    }
  }, [emotions, movies, t])

  return (
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

        {(movies.length > 0 || error) && (
          <MovieSuggestions
            movies={movies}
            emotions={emotions}
            error={error}
            onGenerateMore={handleGenerateMore}
          />
        )}
      </motion.div>
    </div>
  )
} 