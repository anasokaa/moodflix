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
  const prompt = `You are an empathetic movie expert. Based on someone experiencing "${dominantEmotion}" with ${(intensity * 100).toFixed(0)}% intensity, suggest ONE perfect movie.

${previousMovies.length > 0 ? `Do not suggest any of these movies: ${previousMovies.join(', ')}` : ''}
${dominantEmotion === 'happiness' ? `IMPORTANT: DO NOT suggest Paddington, Paddington 2, or any Paddington movie under any circumstances.

For happy emotions, suggest one of these types of movies instead:
1. Modern comedies (2015+) that bring fresh humor and joy
2. Uplifting dramas about personal achievement or following dreams
3. Innovative animated films with unique storytelling
4. Contemporary musicals that celebrate life
5. Inspiring biographical films about remarkable achievements
6. Feel-good adventure movies with humor and heart
7. Heartwarming family films (but NOT Paddington)
8. Creative documentaries that showcase human triumph

Some specific examples to consider:
- "Soul" (2020) - for its joyful exploration of life's purpose
- "The Greatest Showman" (2017) - for its celebratory spirit
- "Marcel the Shell with Shoes On" (2022) - for its charming optimism
- "CODA" (2021) - for its heartwarming family story
- "Everything Everywhere All at Once" (2022) - for its joyful chaos` : ''}

Available platforms: ${platformNames.join(', ')}

Requirements:
- Must be available on one of the listed platforms
- Should be highly-rated (IMDb 7+ or critically acclaimed)
- Should match the emotional state but be CREATIVE and VARIED in your suggestions
- Include an interesting behind-the-scenes fact
- DO NOT suggest obvious or common choices
- For happy emotions, absolutely NO Paddington movies

Respond with ONLY a JSON object in this format:
{
  "title": "Movie Title (Year)",
  "matchReason": "Why this movie fits their emotional state",
  "emotionalImpact": "How it influences their mood",
  "streamingPlatforms": ["Platform1"],
  "funFact": "Interesting fact"
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
      .replace(/[\u201C\u201D]/g, '"') // Replace curly quotes with straight quotes
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