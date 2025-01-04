'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Sparkles, PartyPopper, Popcorn } from 'lucide-react'

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
  const { t, currentLanguage } = useLanguage()

  const emotionTranslations = {
    en: {
      happiness: '😊 Super Happy',
      sadness: '😢 Feeling Blue',
      anger: '😠 Spicy Mood',
      fear: '😱 Spooked',
      surprise: '🤯 Mind Blown',
      disgust: '🤢 Not Vibing',
      neutral: '😐 Chilling'
    },
    fr: {
      happiness: '😊 Super Content',
      sadness: '😢 Mélancolique',
      anger: '😠 Pimenté',
      fear: '😱 Effrayé',
      surprise: '🤯 Stupéfait',
      disgust: '🤢 Pas d\'Humeur',
      neutral: '😐 Tranquille'
    },
    es: {
      happiness: '😊 Súper Feliz',
      sadness: '😢 Melancólico',
      anger: '😠 Picante',
      fear: '😱 Asustado',
      surprise: '🤯 Flipando',
      disgust: '🤢 Sin Vibra',
      neutral: '😐 Relajado'
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
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div 
        variants={item}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 text-2xl md:text-3xl font-bold">
          <PartyPopper className="w-8 h-8 text-yellow-500" />
          <h2>{t('movies.title')}</h2>
          <Popcorn className="w-8 h-8 text-red-500" />
        </div>
        {dominantEmotion && (
          <p className="text-xl text-muted-foreground">
            {t('movies.dominantEmotion')} {getEmotionName(dominantEmotion)}
          </p>
        )}
      </motion.div>

      {error ? (
        <motion.div 
          variants={item}
          className="text-center text-destructive bg-destructive/10 p-4 rounded-lg"
        >
          {error}
        </motion.div>
      ) : (
        <div className="grid gap-6 md:gap-8">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.title}
              variants={item}
              whileHover={{ scale: 1.02 }}
              className="transform transition-all duration-200"
            >
              <Card className="overflow-hidden bg-card hover:bg-card/80 transition-colors">
                <div className="grid md:grid-cols-[200px,1fr] gap-4">
                  <div className="aspect-[2/3] relative group">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-lg font-bold">#{index + 1} Pick</span>
                    </div>
                  </div>
                  <div className="p-4 md:p-6 space-y-4">
                    <h3 className="text-xl md:text-2xl font-bold">{movie.title}</h3>
                    <p className="text-muted-foreground">{movie.description}</p>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="italic text-primary">{movie.matchReason}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {t('movies.availableOn')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {movie.streamingPlatforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="animate-in fade-in-50">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!error && movies.length > 0 && (
        <motion.div 
          variants={item}
          className="flex justify-center"
        >
          <Button
            onClick={onGenerateMore}
            size="lg"
            className="gap-2 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <PartyPopper className="w-5 h-5" />
            {t('movies.generateMore')}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
} 