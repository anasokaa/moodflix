import { NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/face-api'
import { getMovieSuggestions } from '@/lib/gemini-api'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { image, platforms = [], previousMovies = [], analyzeOnly = false, groupEmotions = null } = data

    // Group mode with all emotions collected
    if (groupEmotions) {
      console.log('Group mode: Getting movie suggestions for group emotions')
      const movies = await getMovieSuggestions(groupEmotions, 'en', previousMovies, platforms)
      
      // Calculate average emotions for display
      const averageEmotions = groupEmotions.reduce((acc: any, curr: any) => {
        Object.keys(curr).forEach(key => {
          acc[key] = (acc[key] || 0) + curr[key]
        })
        return acc
      }, {})
      
      Object.keys(averageEmotions).forEach(key => {
        averageEmotions[key] /= groupEmotions.length
      })

      return NextResponse.json({
        success: true,
        movies,
        emotions: averageEmotions
      })
    }

    // Regenerate suggestions for existing emotions
    if (image === 'regenerate' && data.emotions) {
      console.log('Regenerating movie suggestions for existing emotions')
      const movies = await getMovieSuggestions(data.emotions, 'en', previousMovies, platforms)
      return NextResponse.json({
        success: true,
        movies,
        emotions: data.emotions
      })
    }

    // New image analysis
    if (!image || typeof image !== 'string') {
      throw new Error('Invalid image data')
    }

    console.log('Analyzing new image')
    const emotions = await analyzeImage(image)
    
    // If analyzeOnly is true, return just the emotions (for group mode)
    if (analyzeOnly) {
      console.log('Analyze only mode: returning emotions')
      return NextResponse.json({
        success: true,
        emotions
      })
    }

    // Get movie suggestions for solo mode
    console.log('Solo mode: Getting movie suggestions')
    const movies = await getMovieSuggestions(emotions, 'en', previousMovies, platforms)

    return NextResponse.json({
      success: true,
      movies,
      emotions
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    )
  }
} 