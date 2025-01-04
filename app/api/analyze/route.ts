import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/omdb-api'

export async function POST(request: Request) {
  try {
    console.log('Received analyze request')
    const body = await request.json()
    let emotions

    if (body.emotions) {
      // This is a regeneration request
      console.log('Regenerating suggestions with existing emotions:', body.emotions)
      emotions = body.emotions
    } else if (body.image) {
      // This is a new analysis request
      console.log('Analyzing face with Face++ API...')
      const faceAnalysis = await analyzeFace(body.image)
      
      if (!faceAnalysis) {
        console.error('No face detected in the image')
        return NextResponse.json(
          { error: 'No face detected. Please try again with a clearer photo.' },
          { status: 400 }
        )
      }

      console.log('Face analysis successful:', faceAnalysis)
      emotions = faceAnalysis.emotion
    } else {
      console.error('Invalid request: no image or emotions provided')
      return NextResponse.json(
        { error: 'Please provide a photo to analyze.' },
        { status: 400 }
      )
    }

    console.log('Getting movie suggestions...')
    const movies = await getMovieSuggestions(emotions)
    console.log('Got movie suggestions:', movies)

    if (!movies || movies.length === 0) {
      console.error('No movie suggestions returned')
      return NextResponse.json(
        { error: 'Could not find movie suggestions. Please try again.' },
        { status: 500 }
      )
    }

    if (movies.length < 3) {
      console.error('Not enough movie suggestions returned')
      return NextResponse.json(
        { error: 'Could not find enough movie suggestions. Please try again.' },
        { status: 500 }
      )
    }

    const response = {
      movies: movies.slice(0, 3), // Ensure exactly 3 movies
      emotion: emotions
    }
    console.log('Sending response:', response)
    return NextResponse.json(response)
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