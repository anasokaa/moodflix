'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

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
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {movies.map((movie, index) => (
          <motion.div key={movie.title} variants={item}>
            <Card className="h-full transform hover:scale-105 transition-transform duration-200 bg-card/50 backdrop-blur-sm border-2 hover:border-primary">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary">
                  {movie.title} ✨
                </CardTitle>
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
                    <Badge
                      key={platform}
                      variant="secondary"
                      className="text-xs animate-pulse"
                    >
                      {platformEmojis[platform] || '🎥'} {platform}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGenerateMore}
        className="mt-8 mx-auto block px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-primary/90"
      >
        ✨ Show Me More Movies! 🍿
      </motion.button>
    </div>
  )
} 