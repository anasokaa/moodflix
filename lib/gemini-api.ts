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

  const generateMoviePrompt = (emotions: string[]) => `
🎬 Hey Movie Guru! Time for some AWESOME movie picks! 🍿

Based on the detected mood(s): ${emotions.join(', ')} 

Please suggest 3 AMAZING movies that would be perfect for this emotional state! Here's what we need:

Rules for the perfect movie mix:
- 🌟 One MUST BE a 2024 release (super fresh!)
- 🎯 Each movie MUST BE unique (no repeats, that's boring!)
- ⭐ Only suggest highly-rated films (7+ on IMDb or major critic love)
- 🎭 Mix it up! One mainstream hit, one hidden gem, and one wild card
- 📺 For EACH movie, mention which major streaming platforms it's available on (Netflix, Disney+, Prime Video, Apple TV+, HBO Max)

For each movie, give me:
1. Title (Year)
2. A super fun one-liner about why it's perfect for the mood
3. Available streaming platforms with emojis (🎬 Netflix, 👸 Disney+, 📦 Prime, 🍎 Apple TV+, 🎭 HBO Max)
4. A witty fun fact that'll make someone go "Wow, I didn't know that!"

Make it FUN and ENGAGING! Let's help find the perfect movie for this mood! 🎥✨`

  const prompt = generateMoviePrompt(dominantEmotions.split(' + '))

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