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
      className="space-y-6 md:space-y-8 p-4 max-w-7xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Emotions Display */}
      {significantEmotions && Object.keys(significantEmotions).length > 0 && (
        <motion.div 
          className="grid gap-3 md:gap-4 p-4 md:p-6 bg-card rounded-lg shadow-lg backdrop-blur-sm border"
          variants={item}
        >
          <h2 className="text-xl md:text-2xl font-bold text-center mb-2">{t('movies.subtitle')}</h2>
          <div className="grid gap-3 md:gap-4">
            {Object.entries(significantEmotions).map(([emotion, value]) => (
              <div key={emotion} className="space-y-1.5 md:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base font-medium">{t(`emotions.${emotion}`)}</span>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {Math.round(value * 100)}%
                  </span>
                </div>
                <Progress value={value * 100} className="h-1.5 md:h-2" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Movies Grid */}
      <motion.div 
        className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        variants={item}
      >
        {movies.map((movie, index) => (
          <motion.div
            key={movie.title}
            variants={item}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="overflow-hidden h-full bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                <h3 className="text-lg md:text-xl font-bold leading-tight">{movie.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                  {movie.description}
                </p>
                <div className="space-y-2">
                  <p className="text-xs md:text-sm font-medium text-primary">
                    {movie.matchReason}
                  </p>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {movie.streamingPlatforms.map(platform => (
                      <span
                        key={platform}
                        className={`px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full text-white ${
                          platformColors[platform] || 'bg-gray-600'
                        }`}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Generate More Button */}
      <motion.div 
        className="flex justify-center pt-2 md:pt-4"
        variants={item}
      >
        <Button
          onClick={onGenerateMore}
          size="lg"
          className="text-sm md:text-base gap-2 bg-primary/90 hover:bg-primary/100 shadow-lg px-4 md:px-6 py-2 md:py-3 h-auto"
        >
          {t('movies.generateMore')}
        </Button>
      </motion.div>
    </motion.div>
  )
} 