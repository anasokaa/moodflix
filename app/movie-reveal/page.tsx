'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MovieSuggestions } from '@/components/movie-suggestions'
import { useLanguage } from '@/lib/language-context'

export default function MovieRevealPage() {
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    // If there's no movie data in sessionStorage, redirect back to home
    const movieData = sessionStorage.getItem('movieData')
    if (!movieData) {
      router.push('/')
    }
  }, [router])

  const handleGenerateMore = async () => {
    try {
      const storedEmotions = sessionStorage.getItem('emotions')
      const storedMovies = sessionStorage.getItem('previousMovies')
      
      if (!storedEmotions) {
        throw new Error('No emotion data found')
      }

      const emotions = JSON.parse(storedEmotions)
      const previousMovies = storedMovies ? JSON.parse(storedMovies) : []

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: 'regenerate',
          emotions,
          previousMovies
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || t('movies.error'))
      }

      // Store the new movie data
      sessionStorage.setItem('movieData', JSON.stringify(data))
      if (data.movies) {
        const updatedPreviousMovies = [...previousMovies, ...data.movies.map((m: any) => m.title)]
        sessionStorage.setItem('previousMovies', JSON.stringify(updatedPreviousMovies))
      }

      // Force a re-render by reloading the page
      window.location.reload()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const storedData = typeof window !== 'undefined' ? sessionStorage.getItem('movieData') : null
  const data = storedData ? JSON.parse(storedData) : { movies: [], emotions: null }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
        >
          Your Perfect Movie Match ✨
        </motion.h1>

        <MovieSuggestions
          movies={data.movies}
          emotions={data.emotions}
          onGenerateMore={handleGenerateMore}
        />

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={() => router.push('/')}
          className="mt-8 mx-auto block px-6 py-3 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300"
        >
          ← Take Another Photo
        </motion.button>
      </motion.div>
    </div>
  )
} 