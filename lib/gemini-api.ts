import { GoogleGenerativeAI } from '@google/generative-ai'

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
  funFact?: string
  rating?: string
  genre?: string
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
- Must include a valid, working poster URL (use TMDB or official movie posters)
- Include an interesting fun fact about the movie
- Include the IMDb rating or Rotten Tomatoes score
- Specify the primary genre

Make it exciting! This is a game where we reveal the perfect movie for the viewer's mood.

Format the response as a JSON object with this structure:
{
  "title": "Movie Title (Year)",
  "description": "An engaging and descriptive summary (2-3 sentences)",
  "matchReason": "An enthusiastic explanation of why this movie perfectly matches their emotion",
  "posterUrl": "https://image.tmdb.org/t/p/w500/[poster_path]",
  "streamingPlatforms": ["Platform1", "Platform2"],
  "funFact": "An interesting or surprising fact about the movie",
  "rating": "IMDb rating or Rotten Tomatoes score",
  "genre": "Primary genre of the movie"
}

Note: Only include these streaming platforms: Netflix, Disney+, Prime Video, Apple TV+, HBO Max, Shudder.
Ensure the poster URL is valid and working using TMDB format (https://image.tmdb.org/t/p/w500/[poster_path]) or official movie poster URLs.`

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
        !suggestion.description || 
        !suggestion.matchReason || 
        !suggestion.posterUrl ||
        !suggestion.posterUrl.startsWith('http') ||
        !Array.isArray(suggestion.streamingPlatforms) ||
        suggestion.streamingPlatforms.length === 0) {
      throw new Error('Invalid movie suggestion format')
    }

    // Add fallback poster URL if needed
    const movieWithValidPoster = {
      ...suggestion,
      posterUrl: suggestion.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'
    }

    return [movieWithValidPoster]
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
} 