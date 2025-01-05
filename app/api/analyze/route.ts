import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/gemini-api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { image, emotions: previousEmotions, previousMovies } = body

    let emotions;

    // If it's a regenerate request, use the previous emotions
    if (image === 'regenerate') {
      if (!previousEmotions) {
        return NextResponse.json(
          { error: "No previous emotions found. Please take a new photo." },
          { status: 400 }
        )
      }
      emotions = previousEmotions
      console.log('Using previous emotions for regeneration:', emotions)
    } else {
      // Analyze emotions using Face API
      console.log('Starting face analysis...')
      const faceAnalysis = await analyzeFace(image)
      
      if (!faceAnalysis) {
        return NextResponse.json(
          { error: "No face detected in the image. Please ensure your face is clearly visible and try again." },
          { status: 400 }
        )
      }

      console.log('Face analysis successful:', faceAnalysis.emotion)
      emotions = faceAnalysis.emotion
    }

    // Validate emotion data
    const hasValidEmotions = Object.values(emotions).some(value => !isNaN(value as number) && (value as number) > 0)

    if (!hasValidEmotions) {
      console.log('Invalid emotion values detected:', emotions)
      return NextResponse.json(
        { error: "Could not detect emotions clearly. Please try again with better lighting." },
        { status: 400 }
      )
    }

    // Get personalized movie suggestions using Gemini
    console.log('Getting movie suggestions...')
    try {
      const movies = await getMovieSuggestions(emotions, 'en', previousMovies)
      console.log('Got movie suggestions:', movies)

      if (!movies || movies.length === 0) {
        return NextResponse.json(
          { error: "Could not generate movie suggestions. Please try again." },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        emotions,
        movies
      })
    } catch (movieError) {
      console.error('Error getting movie suggestions:', movieError)
      return NextResponse.json(
        { error: "Error processing movie suggestions. Please try again." },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in analyze route:', error)
    
    // More specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('face')) {
        return NextResponse.json(
          { error: "Could not detect a face clearly. Please ensure good lighting and try again." },
          { status: 400 }
        )
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: "Network error. Please check your connection and try again." },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "An error occurred while processing your image. Please try again." },
      { status: 500 }
    )
  }
} 