'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Share2, ExternalLink, Star, Info } from 'lucide-react'

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
  const [isRevealed, setIsRevealed] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const movie = movies[0] // We now only show one movie

  const toggleFavorite = (title: string) => {
    setFavorites(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const shareMovie = async (movie: typeof movies[0]) => {
    try {
      await navigator.share({
        title: 'Check out this movie!',
        text: `${movie.title} - ${movie.description}`,
        url: window.location.href
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const openStreamingService = (platform: string, title: string) => {
    const baseUrl = platformUrls[platform]
    if (baseUrl) {
      window.open(baseUrl + encodeURIComponent(title), '_blank')
    }
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto p-6 text-center space-y-4"
      >
        <p className="text-lg text-destructive">{error}</p>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {!isRevealed && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRevealed(true)}
          className="w-full p-8 rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          🎬 Reveal Your Perfect Movie! ✨
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {isRevealed && movie && (
          <motion.div
            key="movie-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border border-primary/10">
              <div className="relative aspect-[2/3] w-full">
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-primary">
                      {movie.title}
                    </CardTitle>
                    {movie.genre && (
                      <Badge variant="secondary" className="text-xs">
                        {movie.genre}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(movie.title)}
                      className={`p-2 rounded-full ${
                        favorites.includes(movie.title)
                          ? 'text-red-500 bg-red-500/10'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => shareMovie(movie)}
                      className="p-2 rounded-full text-muted-foreground hover:text-primary"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <CardDescription className="text-base space-y-4">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {movie.description}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="italic text-primary/80"
                  >
                    {movie.matchReason}
                  </motion.p>

                  {movie.rating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-2 text-yellow-500"
                    >
                      <Star className="w-4 h-4" />
                      <span>{movie.rating}</span>
                    </motion.div>
                  )}

                  {movie.funFact && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-start gap-2 text-sm bg-primary/5 p-3 rounded-lg"
                    >
                      <Info className="w-4 h-4 mt-1 text-primary" />
                      <p>{movie.funFact}</p>
                    </motion.div>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap gap-2"
                >
                  {movie.streamingPlatforms.map((platform) => (
                    <motion.div
                      key={platform}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant="secondary"
                        className="text-sm cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1"
                        onClick={() => openStreamingService(platform, movie.title)}
                      >
                        {platformEmojis[platform] || '🎥'} {platform}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsRevealed(false)
                onGenerateMore()
              }}
              className="mt-8 w-full px-8 py-4 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300"
            >
              Try Another Movie! 🎲
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 