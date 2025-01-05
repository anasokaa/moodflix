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
    <Card className="overflow-hidden h-full">
      <div className="grid grid-cols-[1fr,2fr] h-full">
        <div className="relative bg-muted">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-4 space-y-3 overflow-auto">
          <h2 className="text-2xl font-bold">{movie.title}</h2>
          <p className="text-muted-foreground text-sm line-clamp-4">{movie.description}</p>
          <p className="text-sm italic text-primary">{movie.matchReason}</p>
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
      </div>
    </Card>
  )
}

export default function MovieRevealClient() {
  const [movieData, setMovieData] = useState<MovieData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  // Load initial data
  useEffect(() => {
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
    if (isLoading) return
    
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
    <div className="h-screen flex flex-col p-6 bg-gradient-to-b from-black via-background to-primary/5">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full gap-6">
        <div className="text-center space-y-2">
          <motion.h1
            className="text-3xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Your Perfect Movie Match! ✨
          </motion.h1>
          {movieData.emotions && (
            <EmotionDisplay emotions={movieData.emotions} />
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={movieData.movies[0].title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full h-[calc(100vh-300px)]"
            >
              <MovieCard movie={movieData.movies[0]} />
            </motion.div>
          </AnimatePresence>
        </div>

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
      </div>
    </div>
  )
} 