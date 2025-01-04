import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/omdb-api'

export async function POST(request: Request) {
  try {
    console.log('Received analyze request')
    const body = await request.json()
    console.log('Request body type:', typeof body)
    console.log('Request body keys:', Object.keys(body))
    
    let emotions

    if (body.emotions) {
      console.log('Regenerating suggestions with existing emotions:', JSON.stringify(body.emotions, null, 2))
      emotions = body.emotions
    } else if (body.image) {
      console.log('Received image data length:', body.image.length)
      console.log('Analyzing face with Face++ API...')
      
      const faceAnalysis = await analyzeFace(body.image)
      console.log('Face analysis result:', faceAnalysis ? JSON.stringify(faceAnalysis, null, 2) : 'null')
      
      if (!faceAnalysis) {
        console.error('No face detected in the image')
        return NextResponse.json(
          { error: 'No face detected. Please try again with a clearer photo.' },
          { status: 400 }
        )
      }

      console.log('Face analysis successful:', JSON.stringify(faceAnalysis, null, 2))
      emotions = faceAnalysis.emotion
    } else {
      console.error('Invalid request: no image or emotions provided')
      console.error('Request body:', JSON.stringify(body, null, 2))
      return NextResponse.json(
        { error: 'Please provide a photo to analyze.' },
        { status: 400 }
      )
    }

    console.log('Getting movie suggestions with emotions:', JSON.stringify(emotions, null, 2))
    const movies = await getMovieSuggestions(emotions)
    console.log('Got movie suggestions:', JSON.stringify(movies, null, 2))

    if (!movies || movies.length === 0) {
      console.error('No movie suggestions returned')
      return NextResponse.json(
        { error: 'Could not find movie suggestions. Please try again.' },
        { status: 500 }
      )
    }

    if (movies.length < 3) {
      console.error('Not enough movie suggestions returned:', movies.length)
      console.error('Movies:', JSON.stringify(movies, null, 2))
      return NextResponse.json(
        { error: 'Could not find enough movie suggestions. Please try again.' },
        { status: 500 }
      )
    }

    const response = {
      movies: movies.slice(0, 3),
      emotion: emotions
    }
    console.log('Sending response:', JSON.stringify(response, null, 2))
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in analyze route:', error)
    console.error('Error details:', error instanceof Error ? error.stack : 'Unknown error')
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