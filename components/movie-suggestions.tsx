'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Share2, ExternalLink, Star, Info } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

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
  movies: Array<{
    title: string
    description: string
    matchReason: string
    posterUrl: string
    streamingPlatforms: string[]
    funFact?: string
    rating?: string
    genre?: string
  }>
  emotions?: EmotionData
  error?: string
  onGenerateMore: () => void
}

const platformEmojis: Record<string, string> = {
  'Netflix': '🎬',
  'Disney+': '👸',
  'Prime Video': '📦',
  'Apple TV+': '🍎',
  'HBO Max': '🎭',
  'Shudder': '👻'
}

const platformUrls: Record<string, string> = {
  'Netflix': 'https://www.netflix.com/search?q=',
  'Disney+': 'https://www.disneyplus.com/search?q=',
  'Prime Video': 'https://www.amazon.com/s?k=',
  'Apple TV+': 'https://tv.apple.com/search?term=',
  'HBO Max': 'https://play.hbomax.com/search?q=',
  'Shudder': 'https://www.shudder.com/search/'
}

export function MovieSuggestions({ movies, emotions, error, onGenerateMore }: MovieSuggestionsProps) {
  const { t } = useLanguage()
  
  if (!movies || movies.length === 0) return null

  const movie = movies[0] // We only show one movie now

  return (
    <div className="grid gap-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden bg-card/50 backdrop-blur-sm">
            <div className="grid md:grid-cols-[300px,1fr] gap-6">
              {/* Movie Poster */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-l-lg">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="absolute inset-0 object-cover w-full h-full"
                />
              </div>

              {/* Movie Details */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold">{movie.title}</CardTitle>
                  {movie.genre && (
                    <Badge variant="outline" className="text-sm">
                      {movie.genre}
                    </Badge>
                  )}
                  {movie.rating && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">{movie.rating}</span>
                    </div>
                  )}
                </div>

                <CardDescription className="text-base">{movie.description}</CardDescription>

                {movie.matchReason && (
                  <div className="flex items-start gap-2 p-4 rounded-lg bg-primary/5">
                    <Heart className="w-5 h-5 text-primary mt-1" />
                    <p className="text-sm">{movie.matchReason}</p>
                  </div>
                )}

                {movie.funFact && (
                  <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50">
                    <Info className="w-5 h-5 mt-1" />
                    <p className="text-sm">{movie.funFact}</p>
                  </div>
                )}

                {/* Streaming Platforms */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('movies.available_on')}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.streamingPlatforms.map((platform) => (
                      <a
                        key={platform}
                        href={`${platformUrls[platform]}${encodeURIComponent(movie.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                      >
                        <span>{platformEmojis[platform]}</span>
                        {t(`streaming.${platform.toLowerCase().replace(' ', '_')}`)}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Share Button */}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: t('share.title'),
                        text: t('share.text', { title: movie.title, description: movie.description }),
                        url: window.location.href
                      })
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  {t('share.button')}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <motion.button
        onClick={onGenerateMore}
        className="mx-auto block px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {t('movies.more')}
      </motion.button>
    </div>
  )
} 