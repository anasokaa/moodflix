import { GoogleGenerativeAI } from '@google/generative-ai'
import { getMovieDetails, Movie } from './omdb-api'

interface EmotionData {
  anger: number
  disgust: number
  fear: number
  happiness: number
  neutral: number
  sadness: number
  surprise: number
}

export async function getMovieSuggestions(emotions: EmotionData, language: string = 'en', previousMovies: string[] = []): Promise<Movie[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Gemini API: API key not configured')
    throw new Error('API key not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Find the dominant emotion
  const dominantEmotion = Object.entries(emotions)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0]

  // Create a more engaging prompt for a single movie
  const prompt = `You are a charismatic movie expert hosting a fun movie recommendation game. Based on the emotion "${dominantEmotion}", suggest ONE perfect movie that would be amazing to watch.
${previousMovies.length > 0 ? `\nDo NOT suggest any of these movies that were already recommended: ${previousMovies.join(', ')}` : ''}

Requirements:
- Must be a highly rated movie (IMDb 7+ or critically acclaimed)
- Can be either a mainstream hit or an interesting lesser-known gem
- Must be available on major streaming platforms
- Include an interesting fun fact about the movie
- Include the primary genre

Make it exciting! This is a game where we reveal the perfect movie for the viewer's mood.

Format the response as a JSON object with this structure:
{
  "title": "Movie Title (Year)",
  "matchReason": "An enthusiastic explanation of why this movie perfectly matches their emotion",
  "streamingPlatforms": ["Platform1", "Platform2"],
  "funFact": "An interesting or surprising fact about the movie"
}

Note: Only include these streaming platforms: Netflix, Disney+, Prime Video, Apple TV+, HBO Max, Shudder.`

  try {
    console.log('Gemini API: Sending request for emotion:', dominantEmotion)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean and parse the response
    const cleanedText = text
      .replace(/```json\s*/, '')
      .replace(/```/, '')
      .trim()

    const suggestion = JSON.parse(cleanedText)
    
    // Validate the suggestion
    if (!suggestion.title || 
        !suggestion.matchReason || 
        !Array.isArray(suggestion.streamingPlatforms) ||
        suggestion.streamingPlatforms.length === 0) {
      throw new Error('Invalid movie suggestion format')
    }

    // Get movie details from OMDB
    const movieDetails = await getMovieDetails(suggestion.title)
    if (!movieDetails) {
      throw new Error('Could not fetch movie details')
    }

    // Combine Gemini and OMDB data
    const completeMovie = {
      ...movieDetails,
      matchReason: suggestion.matchReason,
      streamingPlatforms: suggestion.streamingPlatforms,
      funFact: suggestion.funFact
    }

    return [completeMovie]
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
} 