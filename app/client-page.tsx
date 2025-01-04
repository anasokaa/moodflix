'use client'

import { useState, useRef } from 'react'
import { Camera } from '@/components/camera'
import { MovieSuggestions } from '@/components/movie-suggestions'
import { useLanguage } from '@/lib/language-context'
import { AnimatedContainer } from '@/components/ui/animated-container'
import { MoodProgress } from '@/components/ui/mood-progress'
import { Confetti } from '@/components/ui/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

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

interface AnalysisResult {
  movies: Movie[]
  emotion: EmotionData
}

interface ClientPageProps {
  onBack: () => void
}

export default function ClientPage({ onBack }: ClientPageProps) {
  const { t } = useLanguage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [emotions, setEmotions] = useState<EmotionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const analyzeCount = useRef(0)

  const handleImageCapture = async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      setError(null)
      
      console.log('Starting image analysis...')
      console.log('Image data length:', imageData.length)
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const responseData = await response.json()
      console.log('Response data:', JSON.stringify(responseData, null, 2))

      if (!response.ok) {
        console.error('API error:', responseData)
        throw new Error(responseData.error || t('movies.error'))
      }

      // Validate movies array
      if (!responseData.movies || !Array.isArray(responseData.movies)) {
        console.error('Invalid movies data (not an array):', JSON.stringify(responseData, null, 2))
        throw new Error(t('movies.error'))
      }

      // Validate each movie object
      const validMovies = responseData.movies.every((movie: Movie) => 
        movie.title && 
        movie.description && 
        movie.matchReason && 
        movie.posterUrl && 
        Array.isArray(movie.streamingPlatforms)
      )

      if (!validMovies) {
        console.error('Invalid movie object structure:', JSON.stringify(responseData.movies, null, 2))
        throw new Error(t('movies.error'))
      }

      // Validate emotions object
      if (!responseData.emotion || typeof responseData.emotion !== 'object') {
        console.error('Invalid emotion data:', JSON.stringify(responseData, null, 2))
        throw new Error(t('movies.error'))
      }

      const requiredEmotions = ['anger', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']
      const hasAllEmotions = requiredEmotions.every(emotion => 
        typeof responseData.emotion[emotion] === 'number'
      )

      if (!hasAllEmotions) {
        console.error('Missing required emotions:', JSON.stringify(responseData.emotion, null, 2))
        throw new Error(t('movies.error'))
      }

      console.log('Setting movies:', JSON.stringify(responseData.movies, null, 2))
      console.log('Setting emotions:', JSON.stringify(responseData.emotion, null, 2))
      
      // Only update state if we have valid data
      setMovies(responseData.movies)
      setEmotions(responseData.emotion)
      setShowConfetti(true)
      analyzeCount.current += 1
      
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      console.error('Error in handleImageCapture:', error)
      setError(error instanceof Error ? error.message : t('movies.error'))
      // Only reset movies and emotions if we actually have an error
      if (error instanceof Error) {
        setMovies([])
        setEmotions(null)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateMore = async () => {
    if (!emotions) return
    
    try {
      setIsAnalyzing(true)
      setError(null)
      
      console.log('Generating more movies with emotions:', emotions)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotions })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || t('movies.error'))
      }

      const result = await response.json()
      console.log('Generate more result:', result)

      if (!result.movies || !result.emotion) {
        console.error('Invalid response format:', result)
        throw new Error(t('movies.error'))
      }

      setMovies(result.movies)
      setShowConfetti(true)
      analyzeCount.current += 1
      
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      console.error('Error in handleGenerateMore:', error)
      setError(error instanceof Error ? error.message : t('movies.error'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTryAgain = () => {
    console.log('Resetting state for new capture')
    setMovies([])
    setEmotions(null)
    setError(null)
    setShowConfetti(false)
    analyzeCount.current = 0
  }

  return (
    <AnimatePresence mode="wait">
      <div className="relative min-h-screen w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="fixed top-4 left-4 z-50 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <ThemeToggle />

        <Confetti trigger={showConfetti} />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {isAnalyzing ? (
            <MoodProgress
              message={analyzeCount.current === 0 ? t('loading.analyzing') : t('loading.regenerating')}
              isLoading={true}
            />
          ) : movies.length > 0 ? (
            <AnimatedContainer>
              <MovieSuggestions
                movies={movies}
                emotions={emotions || undefined}
                error={error || undefined}
                onGenerateMore={handleGenerateMore}
              />
              <motion.div 
                className="mt-8 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={handleTryAgain}
                  className="gap-2"
                  variant="outline"
                  size="lg"
                >
                  {t('buttons.tryAgain')}
                </Button>
              </motion.div>
            </AnimatedContainer>
          ) : (
            <AnimatedContainer>
              <Camera onCapture={handleImageCapture} />
            </AnimatedContainer>
          )}
        </div>
      </div>
    </AnimatePresence>
  )
} 