import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions as getGeminiSuggestions } from '@/lib/gemini-api'
import { getMovieSuggestions as getOmdbSuggestions } from '@/lib/omdb-api'

export async function POST(request: Request) {
  try {
    // Verify environment variables
    const envCheck = {
      FACE_API_KEY: !!process.env.FACE_API_KEY,
      FACE_API_SECRET: !!process.env.FACE_API_SECRET,
      OMDB_API_KEY: !!process.env.OMDB_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY
    }
    
    console.log('API: Environment variables check:', envCheck)
    
    if (!envCheck.FACE_API_KEY || !envCheck.FACE_API_SECRET || 
        !envCheck.OMDB_API_KEY || !envCheck.GEMINI_API_KEY) {
      console.error('API: Missing environment variables:', 
        Object.entries(envCheck)
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      )
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    console.log('API: Received request')
    const body = await request.json()
    console.log('API: Request body type:', typeof body)
    console.log('API: Request body keys:', Object.keys(body))
    
    let emotions

    if (body.emotions) {
      console.log('API: Using provided emotions:', body.emotions)
      emotions = body.emotions
    } else if (body.image) {
      console.log('API: Analyzing face from image data')
      console.log('API: Image data length:', body.image.length)
      
      const faceAnalysis = await analyzeFace(body.image)
      console.log('API: Face analysis result:', faceAnalysis)
      
      if (!faceAnalysis) {
        console.log('API: No face detected')
        return NextResponse.json(
          { error: 'No face detected. Please try again with a clearer photo.' },
          { status: 400 }
        )
      }

      console.log('API: Face analysis successful')
      emotions = faceAnalysis.emotion
    } else {
      console.log('API: No image or emotions provided')
      return NextResponse.json(
        { error: 'Please provide a photo to analyze.' },
        { status: 400 }
      )
    }

    console.log('API: Getting movie suggestions for emotions:', emotions)
    
    try {
      // Try Gemini API first
      console.log('API: Attempting to get suggestions from Gemini...')
      const geminiMovies = await getGeminiSuggestions(emotions)
      console.log('API: Gemini suggestions:', geminiMovies)
      
      if (geminiMovies && geminiMovies.length >= 3) {
        console.log('API: Successfully got suggestions from Gemini')
        return NextResponse.json({
          movies: geminiMovies.slice(0, 3),
          emotion: emotions
        })
      }
      
      console.log('API: Gemini failed or returned insufficient results, falling back to OMDB...')
    } catch (error) {
      console.error('API: Gemini error:', error)
      console.log('API: Falling back to OMDB...')
    }

    // Fallback to OMDB if Gemini fails
    const omdbMovies = await getOmdbSuggestions(emotions)
    console.log('API: OMDB suggestions:', omdbMovies)

    if (!omdbMovies || omdbMovies.length === 0) {
      console.log('API: No movie suggestions found from either source')
      return NextResponse.json(
        { error: 'Could not find movie suggestions. Please try again.' },
        { status: 500 }
      )
    }

    const response = {
      movies: omdbMovies.slice(0, 3),
      emotion: emotions
    }
    console.log('API: Sending response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('API Error:', error)
    console.error('API Error details:', error instanceof Error ? error.stack : 'Unknown error')
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Something went wrong. Please try again.'
      },
      { status: 500 }
    )
  }
} 