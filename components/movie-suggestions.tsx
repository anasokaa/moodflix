'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

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

interface MovieSuggestionsProps {
  movies: Movie[]
  emotions?: EmotionData
  error?: string
  onGenerateMore: () => void
}

export function MovieSuggestions({ movies, emotions, error, onGenerateMore }: MovieSuggestionsProps) {
  const { t, currentLanguage } = useLanguage()

  const emotionTranslations = {
    en: {
      anger: 'Anger',
      disgust: 'Disgust',
      fear: 'Fear',
      happiness: 'Joy',
      neutral: 'Neutral',
      sadness: 'Sadness',
      surprise: 'Surprise'
    },
    fr: {
      anger: 'Colère',
      disgust: 'Dégoût',
      fear: 'Peur',
      happiness: 'Joie',
      neutral: 'Neutre',
      sadness: 'Tristesse',
      surprise: 'Surprise'
    },
    es: {
      anger: 'Ira',
      disgust: 'Asco',
      fear: 'Miedo',
      happiness: 'Alegría',
      neutral: 'Neutral',
      sadness: 'Tristeza',
      surprise: 'Sorpresa'
    }
  }

  const getEmotionName = (emotion: string) => {
    return emotionTranslations[currentLanguage as keyof typeof emotionTranslations]?.[emotion as keyof typeof emotionTranslations['en']] || emotion
  }

  const dominantEmotion = emotions ? 
    Object.entries(emotions)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : null

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold">{t('movies.title')}</h2>
        {dominantEmotion && (
          <p className="text-muted-foreground">
            {t('movies.dominantEmotion')} {getEmotionName(dominantEmotion)}
          </p>
        )}
      </div>

      {error ? (
        <div className="text-center text-destructive">{error}</div>
      ) : (
        <div className="grid gap-6 md:gap-8">
          {movies.map((movie, index) => (
            <Card key={movie.title} className="overflow-hidden bg-card">
              <div className="grid md:grid-cols-[200px,1fr] gap-4">
                <div className="aspect-[2/3] relative">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 md:p-6 space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold">{movie.title}</h3>
                  <p className="text-muted-foreground">{movie.description}</p>
                  <p className="italic">{movie.matchReason}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{t('movies.availableOn')}</p>
                    <div className="flex flex-wrap gap-2">
                      {movie.streamingPlatforms.map((platform) => (
                        <Badge key={platform} variant="secondary">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!error && movies.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={onGenerateMore}
            size="lg"
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t('movies.generateMore')}
          </Button>
        </div>
      )}
    </div>
  )
} 