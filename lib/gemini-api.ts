import { GoogleGenerativeAI } from '@google/generative-ai'
import { getMovieDetails } from './omdb-api'

interface EmotionData {
  anger: number
  disgust: number
  fear: number
  happiness: number
  neutral: number
  sadness: number
  surprise: number
}

interface Movie {
  title: string
  description: string
  matchReason: string
  posterUrl: string
  streamingPlatforms: string[]
}

export async function getMovieSuggestions(emotions: EmotionData, language: string = 'en'): Promise<Movie[]> {
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

  // Create a simple, direct prompt
  const prompt = `You are a movie expert. Based on the emotion "${dominantEmotion}", suggest 3 unique movies that would be perfect to watch.

Requirements:
- Each movie MUST be unique (no duplicates)
- Include at least one movie from 2024
- Movies should be highly rated (IMDb 7+ or critically acclaimed)
- Mix of mainstream hits and interesting lesser-known films
- Each movie from a different genre
- Must be available on major streaming platforms

For each movie, provide:
- Title
- A brief, engaging description (2-3 sentences)
- Why it matches the emotion (1 sentence)
- List of streaming platforms where it's available

Format the response as a JSON array with this structure:
[{
  "title": "Movie Title",
  "description": "Movie description",
  "matchReason": "Why it matches the emotion",
  "streamingPlatforms": ["Platform1", "Platform2"]
}]`

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

    const suggestions = JSON.parse(cleanedText)
    
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('Invalid response format')
    }

    // Validate each suggestion
    const validSuggestions = suggestions.filter(movie => 
      movie.title && 
      movie.description && 
      movie.matchReason && 
      Array.isArray(movie.streamingPlatforms) &&
      movie.streamingPlatforms.length > 0
    )

    if (validSuggestions.length === 0) {
      throw new Error('No valid movie suggestions')
    }

    return validSuggestions
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
} 