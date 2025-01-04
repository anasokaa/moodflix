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

export async function getMovieSuggestions(emotions: EmotionData): Promise<Movie[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Gemini API: API key not configured')
    return []
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Find dominant emotions (those above 20%)
  const dominantEmotions = Object.entries(emotions)
    .filter(([_, value]) => value > 0.2)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(1)}%`)
    .join(', ')

  console.log('Gemini API: Dominant emotions:', dominantEmotions)

  const prompt = `You are CineMood, an expert film curator with deep knowledge of cinema across all genres, cultures, and eras. Your mission is to recommend the perfect movies based on this emotional analysis: ${dominantEmotions}

Role: Act as a thoughtful film therapist who understands how movies can resonate with and help process different emotional states.

Task: Recommend 3 carefully curated films that will create a meaningful viewing experience based on the detected emotions.

Consider these advanced criteria:
1. Emotional Resonance:
   - How the film's themes and tone align with or complement the viewer's emotional state
   - The potential therapeutic or cathartic value of the story
   - The emotional journey the film takes the viewer on

2. Cinematic Diversity:
   - Mix of genres to provide different perspectives
   - Balance between mainstream and independent films
   - Variety in pacing and storytelling styles
   - Cultural diversity in storytelling

3. Viewer Experience:
   - Films that encourage emotional processing
   - Stories that offer hope, insight, or understanding
   - Movies that feel like a genuine emotional companion

4. Technical Excellence:
   - Strong character development
   - Compelling visual storytelling
   - Memorable performances
   - High production quality

CRITICAL: Respond ONLY with a JSON array of exactly 3 movie objects. Each object must have:
{
  "title": "Exact movie title - e.g., 'Inside Out'",
  "description": "A vivid, engaging plot summary that captures the essence of the film (2-3 sentences)",
  "matchReason": "A psychologically insightful explanation of why this film resonates with the current emotional state (1-2 impactful sentences)",
  "streamingPlatforms": ["Array of major platforms", "Netflix", "Amazon Prime", "Disney+", "HBO Max", "Hulu", "Apple TV+"]
}

Return ONLY the JSON array. No additional text or explanations.`

  try {
    console.log('Gemini API: Sending request...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    console.log('Gemini API: Raw response:', text)
    
    // Clean the response text to ensure it's valid JSON
    const cleanedText = text.trim()
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .replace(/^\s*\[\s*\n*/, '[')
      .replace(/\s*\]\s*$/, ']')
    
    try {
      const suggestions = JSON.parse(cleanedText)
      console.log('Gemini API: Parsed suggestions:', suggestions)
      
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        console.error('Gemini API: Invalid response format: not an array or empty array')
        return []
      }

      // Validate each suggestion has required properties
      const validSuggestions = suggestions.filter(suggestion => 
        suggestion.title && 
        suggestion.description && 
        suggestion.matchReason && 
        Array.isArray(suggestion.streamingPlatforms)
      )

      if (validSuggestions.length === 0) {
        console.error('Gemini API: No valid suggestions found')
        return []
      }

      console.log('Gemini API: Valid suggestions:', validSuggestions)

      // Get movie details from OMDB API
      console.log('Gemini API: Fetching movie details...')
      const moviesWithDetails = await Promise.all(
        validSuggestions.map(async (movie) => {
          try {
            const title = movie.title.replace(/\s*\(\d{4}\)$/, '') // Remove year from title
            const details = await getMovieDetails(title, 'Drama', 'neutral') // Genre and emotion are placeholders
            return {
              ...movie,
              posterUrl: details?.posterUrl || '/movie-placeholder.jpg'
            }
          } catch (error) {
            console.error(`Gemini API: Error getting details for ${movie.title}:`, error)
            return {
              ...movie,
              posterUrl: '/movie-placeholder.jpg'
            }
          }
        })
      )

      console.log('Gemini API: Final suggestions with details:', moviesWithDetails)
      return moviesWithDetails
    } catch (parseError) {
      console.error('Gemini API: Error parsing response:', parseError)
      console.error('Gemini API: Raw response:', text)
      return []
    }
  } catch (error) {
    console.error('Gemini API: Error getting suggestions:', error)
    return []
  }
} 