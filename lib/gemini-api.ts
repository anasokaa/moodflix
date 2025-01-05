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

const PLATFORM_NAMES = {
  netflix: 'Netflix',
  disney: 'Disney+',
  prime: 'Prime Video',
  apple: 'Apple TV+',
  hbo: 'HBO Max',
  shudder: 'Shudder'
}

export async function getMovieSuggestions(
  emotions: EmotionData, 
  language: string = 'en', 
  previousMovies: string[] = [],
  availablePlatforms: string[] = []
): Promise<Movie[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Gemini API: API key not configured')
    throw new Error('API key not configured')
  }

  // Convert platform IDs to names
  const platformNames = availablePlatforms.map(id => PLATFORM_NAMES[id as keyof typeof PLATFORM_NAMES])

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Find the dominant emotion and its intensity
  const emotionEntry = Object.entries(emotions).reduce((a, b) => a[1] > b[1] ? a : b)
  const dominantEmotion = emotionEntry[0]
  const intensity = emotionEntry[1]

  // Create a more engaging and specific prompt
  const prompt = `You are an empathetic movie expert with deep knowledge of cinema's emotional impact. Looking at someone experiencing "${dominantEmotion}" with an intensity of ${(intensity * 100).toFixed(0)}%, suggest ONE perfect movie that would genuinely resonate with and enhance their emotional state.

${previousMovies.length > 0 ? `\nTo keep suggestions fresh and exciting, please DO NOT recommend any of these previously suggested movies: ${previousMovies.join(', ')}` : ''}

The user has access to these streaming platforms: ${platformNames.join(', ')}
You MUST only suggest movies available on these platforms.

Consider these aspects when choosing the movie:
1. How the movie's themes and emotional journey align with ${dominantEmotion}
2. What specific scenes or elements would be particularly impactful
3. Why this movie would be especially meaningful in their current emotional state
4. How the movie could help process or complement their feelings

Requirements:
- Choose a highly-rated movie (IMDb 7+ or critically acclaimed)
- Can be any genre that fits emotionally (mainstream hits or hidden gems)
- MUST be available on one or more of the user's streaming platforms
- Should have a compelling emotional arc that resonates with their mood
- Include a fascinating behind-the-scenes fact that adds depth to the viewing experience

Format your response EXACTLY as follows (do not include any other text):
{
  "title": "Movie Title (Year)",
  "matchReason": "A thoughtful explanation of why this movie is perfect for their emotional state",
  "emotionalImpact": "How this movie could positively influence their current mood",
  "streamingPlatforms": ["Platform1", "Platform2"],
  "funFact": "An interesting production fact or trivia"
}`

  try {
    console.log('Gemini API: Sending request for emotion:', dominantEmotion)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('Gemini API raw response:', text)

    // Clean and parse the response
    let cleanedText = text
      .replace(/```json\s*/g, '')
      .replace(/```/g, '')
      .trim()

    // Try to find JSON object in the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Gemini API: No JSON object found in response')
      throw new Error('Invalid response format')
    }

    cleanedText = jsonMatch[0]
    console.log('Gemini API cleaned response:', cleanedText)

    try {
      const suggestion = JSON.parse(cleanedText)
      console.log('Gemini API parsed suggestion:', suggestion)

      // Validate the suggestion
      if (!suggestion.title || 
          !suggestion.matchReason || 
          !suggestion.emotionalImpact ||
          !Array.isArray(suggestion.streamingPlatforms) ||
          suggestion.streamingPlatforms.length === 0 ||
          !suggestion.streamingPlatforms.some((platform: string) => platformNames.includes(platform))) {
        console.error('Gemini API: Invalid suggestion format:', suggestion)
        throw new Error('Invalid movie suggestion format or no matching platforms')
      }

      // Get movie details from OMDB
      const movieDetails = await getMovieDetails(suggestion.title)
      if (!movieDetails) {
        throw new Error('Could not fetch movie details')
      }

      // Filter streaming platforms to only include available ones
      const availablePlatformsSet = new Set(platformNames)
      const filteredPlatforms = suggestion.streamingPlatforms.filter((platform: string) => 
        availablePlatformsSet.has(platform)
      )

      // Combine Gemini and OMDB data
      const completeMovie = {
        ...movieDetails,
        matchReason: `${suggestion.matchReason} ${suggestion.emotionalImpact}`,
        streamingPlatforms: filteredPlatforms,
        funFact: suggestion.funFact
      }

      return [completeMovie]
    } catch (parseError) {
      console.error('Gemini API: Error parsing JSON:', parseError)
      console.error('Attempted to parse:', cleanedText)
      throw new Error('Failed to parse movie suggestion')
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
} 