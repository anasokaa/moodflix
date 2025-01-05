'use server'

import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/gemini-api'

// Store the last analyzed emotions
let lastAnalyzedEmotions: any = null

export async function analyzeEmotionAndGetMovies(imageData: string) {
  try {
    let emotions;

    // If it's a regenerate request, use the last analyzed emotions
    if (imageData === 'regenerate') {
      if (!lastAnalyzedEmotions) {
        console.log('No previous emotions found for regeneration')
        return {
          success: false,
          error: "No previous emotions found. Please take a new photo."
        }
      }
      emotions = lastAnalyzedEmotions
      console.log('Using last analyzed emotions for regeneration:', emotions)
    } else {
      // Analyze emotions using Face API
      console.log('Starting face analysis...')
      const faceAnalysis = await analyzeFace(imageData)
      
      if (!faceAnalysis) {
        console.log('No face detected in the image')
        return {
          success: false,
          error: "No face detected in the image. Please ensure your face is clearly visible and try again."
        }
      }

      console.log('Face analysis successful:', faceAnalysis.emotion)
      emotions = faceAnalysis.emotion

      // Store the emotions for potential regeneration
      lastAnalyzedEmotions = emotions
    }

    // Validate emotion data
    const hasValidEmotions = Object.values(emotions).some(value => !isNaN(value as number) && (value as number) > 0)
    
    if (!hasValidEmotions) {
      console.log('Invalid emotion values detected:', emotions)
      return {
        success: false,
        error: "Could not detect emotions clearly. Please try again with better lighting."
      }
    }

    // Get personalized movie suggestions using Gemini
    console.log('Getting movie suggestions...')
    try {
      const movies = await getMovieSuggestions(emotions)
      console.log('Got movie suggestions:', movies)

      if (!movies || movies.length === 0) {
        console.log('No movie suggestions returned')
        return {
          success: false,
          error: "Could not generate movie suggestions. Please try again."
        }
      }

      return {
        success: true,
        emotion: emotions,
        movies
      }
    } catch (movieError) {
      console.error('Error getting movie suggestions:', movieError)
      return {
        success: false,
        error: "Error processing movie suggestions. Please try again."
      }
    }
  } catch (error) {
    console.error('Error in analyzeEmotionAndGetMovies:', error)
    
    // More specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('face')) {
        return {
          success: false,
          error: "Could not detect a face clearly. Please ensure good lighting and try again."
        }
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        return {
          success: false,
          error: "Network error. Please check your connection and try again."
        }
      }
    }
    
    return {
      success: false,
      error: "An error occurred while processing your image. Please try again."
    }
  }
} 