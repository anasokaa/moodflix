import { NextResponse } from 'next/server'
import { analyzeFace } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/gemini-api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate request
    if (!body.image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Analyze face
    const faceAnalysis = await analyzeFace(body.image)
    if (!faceAnalysis) {
      return NextResponse.json({ error: 'No face detected' }, { status: 400 })
    }

    // Get movie suggestions
    const movies = await getMovieSuggestions(faceAnalysis.emotion, 'en')
    if (!movies || movies.length === 0) {
      return NextResponse.json({ error: 'Could not generate movie suggestions' }, { status: 500 })
    }

    // Return results
    return NextResponse.json({
      movies: movies.slice(0, 3),
      emotions: faceAnalysis.emotion
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
} 