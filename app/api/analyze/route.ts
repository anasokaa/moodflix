import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/omdb-api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    let emotions

    if (body.emotions) {
      emotions = body.emotions
    } else if (body.image) {
      const faceAnalysis = await analyzeFace(body.image)
      
      if (!faceAnalysis) {
        return NextResponse.json(
          { error: 'No face detected. Please try again with a clearer photo.' },
          { status: 400 }
        )
      }

      emotions = faceAnalysis.emotion
    } else {
      return NextResponse.json(
        { error: 'Please provide a photo to analyze.' },
        { status: 400 }
      )
    }

    const movies = await getMovieSuggestions(emotions)

    if (!movies || movies.length === 0) {
      return NextResponse.json(
        { error: 'Could not find movie suggestions. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      movies: movies.slice(0, 3),
      emotion: emotions
    })
  } catch (error) {
    console.error('Error in analyze route:', error)
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