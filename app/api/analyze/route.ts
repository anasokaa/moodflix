import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions as getGeminiSuggestions } from '@/lib/gemini-api'
import { getMovieSuggestions as getOmdbSuggestions } from '@/lib/omdb-api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('API: Received request body:', body)

    let emotions
    if (body.image === 'regenerate') {
      console.log('API: Processing regeneration request')
      emotions = body.emotions
      if (!emotions) {
        return NextResponse.json(
          { error: 'No emotions provided for regeneration' },
          { status: 400 }
        )
      }
    } else {
      // Process new image analysis
      if (!body.image || !body.image.startsWith('data:image')) {
        return NextResponse.json(
          { error: 'Invalid image data' },
          { status: 400 }
        )
      }

      console.log('API: Analyzing face...')
      const faceAnalysis = await analyzeFace(body.image)
      
      if (!faceAnalysis) {
        return NextResponse.json(
          { error: 'No face detected in the image' },
          { status: 400 }
        )
      }

      emotions = faceAnalysis.emotion
    }

    console.log('API: Getting movie suggestions for emotions:', emotions)
    
    try {
      // Try Gemini API first
      console.log('API: Attempting to get suggestions from Gemini...')
      const geminiMovies = await getGeminiSuggestions(emotions, body.language || 'en')
      console.log('API: Gemini suggestions:', geminiMovies)
      
      // Filter out any previously suggested movies if this is a regeneration request
      let filteredMovies = geminiMovies
      if (body.previousMovies && Array.isArray(body.previousMovies)) {
        filteredMovies = geminiMovies.filter(
          movie => !body.previousMovies.includes(movie.title)
        )
      }
      
      if (filteredMovies && filteredMovies.length >= 3) {
        console.log('API: Successfully got suggestions from Gemini')
        return NextResponse.json({
          movies: filteredMovies.slice(0, 3),
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

    // Filter out any previously suggested movies if this is a regeneration request
    let filteredOmdbMovies = omdbMovies
    if (body.previousMovies && Array.isArray(body.previousMovies)) {
      filteredOmdbMovies = omdbMovies.filter(
        movie => !body.previousMovies.includes(movie.title)
      )
    }

    if (!filteredOmdbMovies || filteredOmdbMovies.length === 0) {
      console.log('API: No movie suggestions found from either source')
      return NextResponse.json(
        { error: 'Could not find movie suggestions. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      movies: filteredOmdbMovies.slice(0, 3),
      emotion: emotions
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
} 