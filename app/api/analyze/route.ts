import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/omdb-api'

export async function POST(request: Request) {
  try {
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
    const movies = await getMovieSuggestions(emotions)
    console.log('API: Movie suggestions:', movies)

    if (!movies || movies.length === 0) {
      console.log('API: No movie suggestions found')
      return NextResponse.json(
        { error: 'Could not find movie suggestions. Please try again.' },
        { status: 500 }
      )
    }

    const response = {
      movies: movies.slice(0, 3),
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