import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions as getGeminiSuggestions } from '@/lib/gemini-api'
import { getMovieSuggestions as getOmdbSuggestions } from '@/lib/omdb-api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('API: Received request with image data:', !!body.image)

    let emotions
    if (body.image === 'regenerate') {
      console.log('API: Processing regeneration request')
      emotions = body.emotions
      if (!emotions) {
        console.log('API: No emotions provided for regeneration')
        return NextResponse.json(
          { error: 'No emotions provided for regeneration' },
          { status: 400 }
        )
      }
    } else {
      // Process new image analysis
      if (!body.image || !body.image.startsWith('data:image')) {
        console.log('API: Invalid image data received')
        return NextResponse.json(
          { error: 'Invalid image data' },
          { status: 400 }
        )
      }

      console.log('API: Analyzing face...')
      try {
        const faceAnalysis = await analyzeFace(body.image)
        
        if (!faceAnalysis) {
          console.log('API: No face detected in the image')
          return NextResponse.json(
            { error: 'No face detected in the image' },
            { status: 400 }
          )
        }

        emotions = faceAnalysis.emotion
        console.log('API: Face analysis successful, emotions:', emotions)
      } catch (faceError) {
        console.error('API: Face analysis error:', faceError)
        return NextResponse.json(
          { error: 'Error analyzing face. Please try again.' },
          { status: 500 }
        )
      }
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
          emotions: emotions
        })
      }
      
      console.log('API: Gemini failed or returned insufficient results, falling back to OMDB...')
    } catch (geminiError) {
      console.error('API: Gemini error:', geminiError)
      console.log('API: Falling back to OMDB...')
    }

    // Fallback to OMDB if Gemini fails
    try {
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
        emotions: emotions
      })
    } catch (omdbError) {
      console.error('API: OMDB error:', omdbError)
      return NextResponse.json(
        { error: 'Error getting movie suggestions. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
} 