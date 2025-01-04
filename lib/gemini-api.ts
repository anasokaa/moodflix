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
    return []
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  // Find dominant emotions (those above 20%)
  const emotionTranslations = {
    en: {
      happiness: '😊 Super Happy',
      sadness: '😢 Feeling Blue',
      anger: '😠 Spicy Mood',
      fear: '😱 Spooked',
      surprise: '🤯 Mind Blown',
      disgust: '🤢 Not Vibing',
      neutral: '😐 Chilling'
    },
    fr: {
      happiness: '😊 Super Content',
      sadness: '😢 Mélancolique',
      anger: '😠 Pimenté',
      fear: '😱 Effrayé',
      surprise: '🤯 Stupéfait',
      disgust: '🤢 Pas d\'Humeur',
      neutral: '😐 Tranquille'
    },
    es: {
      happiness: '😊 Súper Feliz',
      sadness: '😢 Melancólico',
      anger: '😠 Picante',
      fear: '😱 Asustado',
      surprise: '🤯 Flipando',
      disgust: '🤢 Sin Vibra',
      neutral: '😐 Relajado'
    }
  }

  const getEmotionName = (emotion: string) => {
    return emotionTranslations[language as keyof typeof emotionTranslations]?.[emotion as keyof typeof emotionTranslations['en']] || emotion
  }

  const dominantEmotions = Object.entries(emotions)
    .filter(([_, value]) => value > 0.2)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, value]) => `${getEmotionName(emotion)}`)
    .join(' + ')

  console.log('Gemini API: Dominant emotions:', dominantEmotions)

  const languageInstructions = language === 'en' ? '' : `
Important: You MUST provide all text content (descriptions and match reasons) in ${language === 'fr' ? 'French' : 'Spanish'}. Keep movie titles in their original form, but translate everything else.

For French translations, ensure:
- Use proper French grammar and punctuation
- Maintain a friendly and engaging tone
- Use appropriate French expressions
- Keep technical terms and movie titles in their original form`

  const prompt = `You are MoodFlix, a quirky and fun movie matchmaker with a great sense of humor! Your mission is to recommend movies that will vibe with this mood combo: ${dominantEmotions}${languageInstructions}

Role: Be a witty and entertaining movie curator who knows how to match vibes with the perfect films! Keep it fun, but make sure the recommendations are genuinely good.

Task: Pick EXACTLY 3 AWESOME movies that will create a perfect movie night based on these vibes. Each movie MUST BE UNIQUE - no repeats allowed!

The Rules of the Game:
1. Movie Must-Haves:
   - One MUST be a fresh 2024/late 2023 release (keep it trendy!)
   - All movies should be crowd-pleasers (7+ IMDb or critics' favorites)
   - Mix of blockbusters and cool indie finds
   - Nothing too obscure - we want movies people can actually watch!
   - Be creative - surprise us with unexpected picks that totally work
   - Bonus points for movies that will make people go "Oh, that's perfect!"

2. Vibe Check:
   - Movies should match or complement the current mood
   - Include some that will make people feel seen
   - Throw in ones that might lift their spirits
   - Think about the whole emotional journey

3. Mix It Up:
   - Each movie from a different genre (variety is the spice of life!)
   - Different styles and vibes
   - Balance between light fun and deeper feels
   - Mix classic favorites with new discoveries

4. Keep It Real:
   - Stick to movies people can easily find and stream
   - Popular enough that friends might have seen them
   - Perfect for movie night discussions
   - Great for social media recommendations

CRITICAL: Give me a JSON array of EXACTLY 3 DIFFERENT movie objects. Each should have:
{
  "title": "The exact movie title",
  "description": "A fun, engaging description that captures why this movie is awesome (2-3 sentences)",
  "matchReason": "A witty explanation of why this movie matches the current vibe (1-2 snappy sentences)",
  "streamingPlatforms": ["Netflix", "Amazon Prime", "Disney+", "HBO Max", "Hulu", "Apple TV+"]
}

Remember: One movie MUST be super recent (2024/late 2023), and all picks should be surprisingly perfect for the mood!

Just the JSON array please - no extra chit-chat!
`

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

      // Validate each suggestion has required properties and title is not empty
      const validSuggestions = suggestions.filter(suggestion => 
        suggestion.title && 
        suggestion.title.trim() !== '' &&
        suggestion.description && 
        suggestion.description.trim() !== '' &&
        suggestion.matchReason && 
        suggestion.matchReason.trim() !== '' &&
        Array.isArray(suggestion.streamingPlatforms) &&
        suggestion.streamingPlatforms.length > 0
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
            const details = await getMovieDetails(title)
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

      // Ensure we have exactly 3 movies
      const finalSuggestions = moviesWithDetails.slice(0, 3)
      if (finalSuggestions.length < 3) {
        console.error('Gemini API: Not enough valid suggestions')
        return []
      }

      console.log('Gemini API: Final suggestions with details:', finalSuggestions)
      return finalSuggestions
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