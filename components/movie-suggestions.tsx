'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Share2, ExternalLink } from 'lucide-react'

interface MovieSuggestionsProps {
  movies: Array<{
    title: string
    description: string
    matchReason: string
    posterUrl: string
    streamingPlatforms: string[]
  }>
  onGenerateMore: () => void
}

const platformEmojis: Record<string, string> = {
  'Netflix': '🎬',
  'Disney+': '👸',
  'Prime Video': '📦',
  'Apple TV+': '🍎',
  'HBO Max': '🎭'
}

const platformUrls: Record<string, string> = {
  'Netflix': 'https://www.netflix.com/search?q=',
  'Disney+': 'https://www.disneyplus.com/search?q=',
  'Prime Video': 'https://www.amazon.com/s?k=',
  'Apple TV+': 'https://tv.apple.com/search?term=',
  'HBO Max': 'https://play.hbomax.com/search?q='
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
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

export function MovieSuggestions({ movies, onGenerateMore }: MovieSuggestionsProps) {
  const [favorites, setFavorites] = useState<string[]>([])

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

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {movies.map((movie, index) => (
            <motion.div 
              key={movie.title} 
              variants={item}
              layout
              layoutId={movie.title}
            >
              <Card className="h-full group transform hover:scale-105 transition-all duration-300 bg-card/50 backdrop-blur-sm border-2 hover:border-primary relative overflow-hidden">
                {/* Movie poster overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-primary">
                      {movie.title} ✨
                    </CardTitle>
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
                        <Heart className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => shareMovie(movie)}
                        className="p-2 rounded-full text-muted-foreground hover:text-primary"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  <CardDescription className="text-sm mt-2 line-clamp-2">
                    {movie.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 italic text-muted-foreground">
                    "{movie.matchReason}"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {movie.streamingPlatforms.map((platform) => (
                      <motion.div
                        key={platform}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Badge
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1"
                          onClick={() => openStreamingService(platform, movie.title)}
                        >
                          {platformEmojis[platform] || '🎥'} {platform}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(var(--primary), 0.3)" }}
        whileTap={{ scale: 0.95 }}
        onClick={onGenerateMore}
        className="mt-8 mx-auto block px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
      >
        <span className="relative z-10">✨ Show Me More Movies! 🍿</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-600/80"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    </div>
  )
} 