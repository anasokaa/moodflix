'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MovieSuggestions } from '@/components/movie-suggestions'
import { EmotionDisplay } from '@/components/emotion-display'
import { useLanguage } from '@/lib/language-context'

interface Movie {
  title: string
  description: string
  matchReason: string
  posterUrl: string
  streamingPlatforms: string[]
  funFact?: string
  rating?: string
  genre?: string
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

interface StoredData {
  movies: Movie[]
  emotions: EmotionData
  success?: boolean
}

export default function MovieRevealPage() {
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    // If there's no movie data in sessionStorage, redirect back to home
    const movieData = sessionStorage.getItem('movieData')
    if (!movieData) {
      router.push('/')
    }
  }, [router])

  const handleGenerateMore = async () => {
    try {
      const storedEmotions = sessionStorage.getItem('emotions')
      const storedMovies = sessionStorage.getItem('previousMovies')
      
      if (!storedEmotions) {
        throw new Error('No emotion data found')
      }

      const emotions = JSON.parse(storedEmotions) as EmotionData
      const previousMovies = storedMovies ? JSON.parse(storedMovies) as string[] : []

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: 'regenerate',
          emotions,
          previousMovies
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || t('movies.error'))
      }

      // Store the new movie data
      sessionStorage.setItem('movieData', JSON.stringify(data))
      if (data.movies) {
        const updatedPreviousMovies = [...previousMovies, ...data.movies.map((m: Movie) => m.title)]
        sessionStorage.setItem('previousMovies', JSON.stringify(updatedPreviousMovies))
      }

      // Force a re-render by reloading the page
      window.location.reload()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const storedData = typeof window !== 'undefined' ? sessionStorage.getItem('movieData') : null
  const data: StoredData = storedData ? JSON.parse(storedData) : { movies: [], emotions: {} as EmotionData }

  // Get the dominant emotion
  const dominantEmotion = data.emotions ? 
    Object.entries(data.emotions).reduce((a, b) => a[1] > b[1] ? a : b)[0] 
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-background to-primary/5 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container mx-auto px-4 space-y-8"
      >
        {/* Emotion Display */}
        {dominantEmotion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-md mx-auto"
          >
            <EmotionDisplay emotion={dominantEmotion} />
          </motion.div>
        )}

        {/* Movie Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <MovieSuggestions
            movies={data.movies}
            emotions={data.emotions}
            onGenerateMore={handleGenerateMore}
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={() => router.push('/')}
          className="mx-auto block px-6 py-3 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300"
        >
          ← Take Another Photo
        </motion.button>
      </motion.div>
    </div>
  )
} 