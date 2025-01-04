import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/omdb-api'

export async function POST(request: Request) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      )
    }

    // Analyze emotions using Face++ API
    const faceAnalysis = await analyzeFace(image)
    
    if (!faceAnalysis) {
      return NextResponse.json(
        { error: 'No face detected in the image' },
        { status: 400 }
      )
    }

    // Get movie suggestions based on emotions
    const movies = await getMovieSuggestions(faceAnalysis.emotion)

    return NextResponse.json({
      movies,
      emotion: faceAnalysis.emotion
    })
  } catch (error) {
    console.error('Error in analyze route:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
} 