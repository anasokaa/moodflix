'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface EmotionData {
  anger: number
  disgust: number
  fear: number
  happiness: number
  neutral: number
  sadness: number
  surprise: number
}

interface Movie {
  title: string
  description: string
  matchReason: string
  posterUrl: string
  streamingPlatforms: string[]
}

interface MovieSuggestionsProps {
  movies: Movie[]
  emotions?: EmotionData
  error?: string
  onGenerateMore: () => void
}

// Map of streaming platform names to their brand colors
const platformColors: Record<string, string> = {
  'Netflix': 'bg-red-600',
  'Amazon Prime': 'bg-blue-500',
  'Disney+': 'bg-blue-600',
  'Hulu': 'bg-green-500',
  'HBO Max': 'bg-purple-600',
  'Apple TV+': 'bg-gray-800',
  'Paramount+': 'bg-blue-700',
  'Peacock': 'bg-yellow-500'
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function MovieSuggestions({ movies, emotions, error, onGenerateMore }: MovieSuggestionsProps) {
  const { t } = useLanguage()

  if (error) {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!movies || movies.length === 0) {
    return null
  }

  // Filter emotions to only show those above 20%
  const significantEmotions = emotions ? 
    Object.entries(emotions)
      .filter(([_, value]) => value >= 0.2)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {} as EmotionData) 
    : null

  return (
    <motion.div 
      className="space-y-8 px-4 max-w-7xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Emotions Display */}
      {significantEmotions && Object.keys(significantEmotions).length > 0 && (
        <motion.div 
          className="grid gap-4 p-6 bg-card rounded-lg shadow-lg"
          variants={item}
        >
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            {t('movies.title')} 🎭
          </h2>
          <div className="grid gap-3">
            {Object.entries(significantEmotions).map(([emotion, value]) => (
              <motion.div 
                key={emotion} 
                className="grid gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between text-sm">
                  <span className="capitalize flex items-center gap-2">
                    {t(`emotions.${emotion}`)}
                    {value >= 0.5 && '🔥'}
                  </span>
                  <span>{(value * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={value * 100} 
                  className="h-2 bg-secondary"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Movies Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
      >
        {movies.map((movie, index) => (
          <motion.div
            key={`${movie.title}-${index}`}
            variants={item}
            whileHover={{ scale: 1.03 }}
            className="h-full"
          >
            <Card className="overflow-hidden bg-card h-full flex flex-col">
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                  src={movie.posterUrl || '/movie-placeholder.jpg'}
                  alt={`${movie.title} poster`}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 space-y-4 flex-1 flex flex-col">
                <h3 className="text-xl font-bold">{movie.title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{movie.description}</p>
                <p className="text-sm italic text-accent">{movie.matchReason}</p>
                {movie.streamingPlatforms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t('movies.watchOn')}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {movie.streamingPlatforms.map((platform) => {
                        const baseClass = "px-3 py-1.5 text-xs rounded-full text-white font-medium"
                        const colorClass = platformColors[platform] || 'bg-gray-600'
                        return (
                          <motion.span
                            key={`${movie.title}-${platform}`}
                            className={`${baseClass} ${colorClass}`}
                            whileHover={{ scale: 1.1 }}
                          >
                            {platform}
                          </motion.span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Generate More Button */}
      <motion.div 
        className="flex justify-center mt-8"
        variants={item}
      >
        <Button
          onClick={onGenerateMore}
          size="lg"
          className="bg-gradient-to-r from-purple-400 to-pink-600 text-white hover:opacity-90 gap-2"
        >
          {t('movies.generateMore')} ✨
        </Button>
      </motion.div>
    </motion.div>
  )
} 