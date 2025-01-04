import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/omdb-api'

export async function POST(request: Request) {
  try {
    console.log('Received analyze request')
    const { image } = await request.json()
    
    if (!image) {
      console.error('No image data provided')
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      )
    }

    console.log('Analyzing face with Face++ API...')
    // Analyze emotions using Face++ API
    const faceAnalysis = await analyzeFace(image)
    
    if (!faceAnalysis) {
      console.error('No face detected in the image')
      return NextResponse.json(
        { error: 'No face detected in the image' },
        { status: 400 }
      )
    }

    console.log('Face analysis successful:', faceAnalysis)
    console.log('Getting movie suggestions...')
    // Get movie suggestions based on emotions
    const movies = await getMovieSuggestions(faceAnalysis.emotion)
    console.log('Got movie suggestions:', movies)

    const response = {
      movies,
      emotion: faceAnalysis.emotion
    }
    console.log('Sending response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in analyze route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze image' },
      { status: 500 }
    )
  }
} 