import { GoogleGenerativeAI } from '@google/generative-ai'
import { getMoviePoster } from './omdb-api'

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

export async function getMovieSuggestions(emotions: EmotionData) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Find dominant emotions (those above 20%)
  const dominantEmotions = Object.entries(emotions)
    .filter(([_, value]) => value > 0.2)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(1)}%`)
    .join(', ')

  console.log('Dominant emotions:', dominantEmotions)

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
  "title": "Exact movie title with year - e.g., 'Inside Out (2015)'",
  "description": "A vivid, engaging plot summary that captures the essence of the film (2-3 sentences)",
  "matchReason": "A psychologically insightful explanation of why this film resonates with the current emotional state (1-2 impactful sentences)",
  "streamingPlatforms": ["Array of major platforms", "Netflix", "Amazon Prime", "Disney+", "HBO Max", "Hulu", "Apple TV+"]
}

Ensure each recommendation:
- Serves a distinct emotional purpose
- Represents a different genre or style
- Offers a unique perspective or approach
- Has strong emotional intelligence in its storytelling

Format Example:
[
  {
    "title": "Good Will Hunting (1997)",
    "description": "A janitor at MIT with a genius-level IQ begins a transformative journey of self-discovery through therapy sessions. As he confronts his past trauma and fear of vulnerability, he learns to open himself to genuine connections and his own potential.",
    "matchReason": "The film's profound exploration of emotional barriers and the healing power of human connection speaks directly to the mixture of vulnerability and growth potential in the current emotional state.",
    "streamingPlatforms": ["Amazon Prime", "HBO Max"]
  }
]

Return ONLY the JSON array. No additional text or explanations.`

  try {
    console.log('Sending request to Gemini API...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    console.log('Raw Gemini response:', text)
    
    // Clean the response text to ensure it's valid JSON
    const cleanedText = text.trim()
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .replace(/^\s*\[\s*\n*/, '[')
      .replace(/\s*\]\s*$/, ']')
    
    try {
      const suggestions = JSON.parse(cleanedText)
      
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        console.error('Invalid response format: not an array or empty array')
        throw new Error('Invalid response format: not an array or empty array')
      }

      // Validate each suggestion has required properties
      for (const suggestion of suggestions) {
        if (!suggestion.title || !suggestion.description || !suggestion.matchReason || 
            !Array.isArray(suggestion.streamingPlatforms)) {
          console.error('Invalid movie suggestion:', suggestion)
          throw new Error('Invalid movie suggestion: missing required properties')
        }
      }

      console.log('Valid movie suggestions:', suggestions)

      // Get posters for each movie
      console.log('Fetching movie posters...')
      const moviesWithPosters = await Promise.all(
        suggestions.map(async (movie) => {
          try {
            const posterUrl = await getMoviePoster(movie.title)
            return {
              ...movie,
              posterUrl
            }
          } catch (error) {
            console.error(`Error getting poster for ${movie.title}:`, error)
            // Use a default movie poster if we can't find one
            return {
              ...movie,
              posterUrl: '/movie-placeholder.jpg'
            }
          }
        })
      )

      console.log('Final movie suggestions with posters:', moviesWithPosters)
      return moviesWithPosters

    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      console.error('Raw response:', text)
      throw new Error('Failed to parse movie suggestions')
    }
  } catch (error) {
    console.error('Error getting movie suggestions from Gemini:', error)
    throw error
  }
} 