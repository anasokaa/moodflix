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
import { analyzeEmotionAndGetMovies } from '@/app/actions'

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
      
      console.log('Sending image for analysis...')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || 'Failed to analyze image')
      }

      const result = await response.json()
      console.log('Analysis result:', result)

      if (!result.movies || !result.emotion) {
        console.error('Invalid response format:', result)
        throw new Error('Invalid response from server')
      }

      console.log('Setting movies:', result.movies)
      setMovies(result.movies)
      console.log('Setting emotions:', result.emotion)
      setEmotions(result.emotion)
      setShowConfetti(true)
      analyzeCount.current += 1
      
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      console.error('Error in handleImageCapture:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while analyzing the image')
      setMovies([])
      setEmotions(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateMore = async () => {
    console.log('Generating more movies...')
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const result = await analyzeEmotionAndGetMovies('regenerate')
      console.log('Generate more result:', result)

      if (!result.success) {
        console.error('Generate more failed:', result.error)
        throw new Error(result.error)
      }

      setMovies(result.movies ?? [])
      setShowConfetti(true)
      analyzeCount.current += 1
      
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (err: any) {
      console.error('Error in handleGenerateMore:', err)
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTryAgain = () => {
    console.log('Resetting state for new capture')
    setMovies([])
    setEmotions(null)
    setError(null)
  }

  return (
    <AnimatePresence mode="wait">
      <div className="relative min-h-screen">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="fixed top-4 left-4 z-50 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <Confetti trigger={showConfetti} />

        <div className="pt-8">
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
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleTryAgain}
                  className="animate-bounce gap-2"
                  variant="outline"
                >
                  <span>Mood Changed? 🎭</span>
                </Button>
              </div>
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