'use server'

import { getMovieSuggestions } from '@/lib/gemini-api'

// Store the last analyzed emotions
let lastEmotions: any = null

export async function analyzeAndGetMovies(emotions: any, platforms: string[] = []) {
  try {
    // Store the emotions for potential reuse
    lastEmotions = emotions

    // Get movie suggestions
    const movies = await getMovieSuggestions(emotions, 'en', [], platforms)

    return {
      success: true,
      movies,
      emotions
    }
  } catch (error) {
    console.error('Error in analyzeAndGetMovies:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

export async function regenerateMovies(platforms: string[] = [], previousMovies: string[] = []) {
  try {
    if (!lastEmotions) {
      throw new Error('No previous emotions found')
    }

    // Get new movie suggestions using the last emotions
    const movies = await getMovieSuggestions(lastEmotions, 'en', previousMovies, platforms)

    return {
      success: true,
      movies,
      emotions: lastEmotions
    }
  } catch (error) {
    console.error('Error in regenerateMovies:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 