'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'
import { EmotionDisplay } from '@/components/emotion-display'
import { Sparkles, Loader2 } from 'lucide-react'

interface Movie {
  title: string
  description: string
  matchReason: string
  posterUrl: string
  streamingPlatforms: string[]
}

interface MovieData {
  movies: Movie[]
  emotions: Record<string, number>
}

const MovieCard = ({ movie }: { movie: Movie }) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[2/3] bg-muted">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">{movie.title}</h2>
        <p className="text-muted-foreground">{movie.description}</p>
        <p className="text-sm italic">{movie.matchReason}</p>
        <div className="flex flex-wrap gap-2">
          {movie.streamingPlatforms.map(platform => (
            <span
              key={platform}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default function MovieRevealPage() {
  const [movieData, setMovieData] = useState<MovieData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  // Load initial data
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedMovieData = sessionStorage.getItem('movieData')
    const storedEmotions = sessionStorage.getItem('emotions')
    
    if (!storedMovieData || !storedEmotions) {
      router.push('/')
      return
    }

    try {
      setMovieData(JSON.parse(storedMovieData))
    } catch (err) {
      console.error('Error parsing movie data:', err)
      router.push('/')
    }
  }, [router])

  const handleGenerateMore = useCallback(async () => {
    if (isLoading || typeof window === 'undefined') return
    
    try {
      setIsLoading(true)
      setError(null)

      const selectedPlatforms = sessionStorage.getItem('selectedPlatforms')
      const storedEmotions = sessionStorage.getItem('emotions')
      const storedPreviousMovies = sessionStorage.getItem('previousMovies')

      const platforms = selectedPlatforms ? JSON.parse(selectedPlatforms) : []
      const emotions = storedEmotions ? JSON.parse(storedEmotions) : null
      const previousMovies = storedPreviousMovies ? JSON.parse(storedPreviousMovies) : []

      if (!emotions) {
        throw new Error('No emotion data found')
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotions,
          platforms,
          previousMovies
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || t('movies.error'))
      }

      setMovieData(data)
      sessionStorage.setItem('movieData', JSON.stringify(data))
      sessionStorage.setItem('previousMovies', JSON.stringify([
        ...previousMovies,
        ...data.movies.map((m: Movie) => m.title)
      ]))
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, t])

  if (!movieData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-background to-primary/5 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-12"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Your Perfect Movie Match! ✨</h1>
            {movieData.emotions && (
              <EmotionDisplay emotions={movieData.emotions} />
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={movieData.movies[0].title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <MovieCard movie={movieData.movies[0]} />
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={handleGenerateMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Show me another movie
            </Button>
          </motion.div>

          {error && (
            <div className="text-center text-destructive">
              {error}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 