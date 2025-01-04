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
import { LanguageSelector } from '@/components/language-selector'

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

interface ClientPageProps {
  onBack: () => void
}

export default function ClientPage({ onBack }: ClientPageProps) {
  const { t, currentLanguage } = useLanguage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [emotions, setEmotions] = useState<EmotionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const analyzeCount = useRef(0)

  const handleImageCapture = async (imageData: string) => {
    try {
      console.log('Starting image capture process...')
      setIsAnalyzing(true)
      setError(null)
      
      console.log('Sending image to API...')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageData,
          language: currentLanguage
        }),
      })

      console.log('API Response Status:', response.status)
      const result = await response.json()
      console.log('API Response:', result)

      if (!response.ok) {
        console.error('API error:', result)
        throw new Error(result.error || t('movies.error'))
      }

      console.log('Setting movies:', result.movies)
      console.log('Setting emotions:', result.emotion)
      
      setMovies(result.movies)
      setEmotions(result.emotion)
      setShowConfetti(true)
      analyzeCount.current += 1
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      console.error('Error in handleImageCapture:', error)
      setError(error instanceof Error ? error.message : t('movies.error'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateMore = async () => {
    if (!emotions) return
    
    try {
      setIsAnalyzing(true)
      setError(null)
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: 'regenerate',
          emotions,
          previousMovies: movies.map(m => m.title),
          language: currentLanguage
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('movies.error'))
      }

      setMovies(result.movies)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      console.error('Error in handleGenerateMore:', error)
      setError(error instanceof Error ? error.message : t('movies.error'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTryAgain = () => {
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
        <LanguageSelector />

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