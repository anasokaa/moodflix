'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { analyzeEmotionAndGetMovies } from '@/app/actions'

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
    <div className="space-y-8">
      {significantEmotions && Object.keys(significantEmotions).length > 0 && (
        <div className="grid gap-4 p-6 bg-card rounded-lg">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Your Emotional Spectrum</h2>
          <div className="grid gap-2">
            {Object.entries(significantEmotions).map(([emotion, value]) => (
              <div key={emotion} className="grid gap-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{t(`emotions.${emotion}`)}</span>
                  <span>{(value * 100).toFixed(1)}%</span>
                </div>
                <Progress value={value * 100} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <Card 
            key={`${movie.title}-${movie.description.substring(0, 20)}`} 
            className="overflow-hidden bg-card"
          >
            <div className="relative aspect-[2/3] overflow-hidden">
              <Image
                src={movie.posterUrl || '/movie-placeholder.jpg'}
                alt={`${movie.title} poster`}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4 space-y-4">
              <h3 className="text-xl font-bold">{movie.title}</h3>
              <p className="text-sm text-muted-foreground">{movie.description}</p>
              <p className="text-sm italic text-muted-foreground">{movie.matchReason}</p>
              {movie.streamingPlatforms.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Available:</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.streamingPlatforms.map((platform) => {
                      const baseClass = "px-3 py-1.5 text-xs rounded-full text-white font-medium"
                      const colorClass = platformColors[platform] || 'bg-gray-600'
                      return (
                        <span
                          key={`${movie.title}-${platform}`}
                          className={`${baseClass} ${colorClass} transition-transform hover:scale-105`}
                        >
                          {platform}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={onGenerateMore}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90"
        >
          Generate More Movies
        </Button>
      </div>
    </div>
  )
} 