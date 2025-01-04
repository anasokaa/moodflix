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
      anger: 'Anger',
      disgust: 'Disgust',
      fear: 'Fear',
      happiness: 'Joy',
      neutral: 'Neutral',
      sadness: 'Sadness',
      surprise: 'Surprise'
    },
    fr: {
      anger: 'Colère',
      disgust: 'Dégoût',
      fear: 'Peur',
      happiness: 'Joie',
      neutral: 'Neutre',
      sadness: 'Tristesse',
      surprise: 'Surprise'
    },
    es: {
      anger: 'Ira',
      disgust: 'Asco',
      fear: 'Miedo',
      happiness: 'Alegría',
      neutral: 'Neutral',
      sadness: 'Tristeza',
      surprise: 'Sorpresa'
    }
  }

  const getEmotionName = (emotion: string) => {
    return emotionTranslations[language as keyof typeof emotionTranslations]?.[emotion as keyof typeof emotionTranslations['en']] || emotion
  }

  const dominantEmotions = Object.entries(emotions)
    .filter(([_, value]) => value > 0.2)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, value]) => `${getEmotionName(emotion)}: ${(value * 100).toFixed(1)}%`)
    .join(', ')

  console.log('Gemini API: Dominant emotions:', dominantEmotions)

  const languageInstructions = language === 'en' ? '' : `
Important: You MUST provide all text content (descriptions and match reasons) in ${language === 'fr' ? 'French' : 'Spanish'}. Keep movie titles in their original form, but translate everything else.

For French translations, ensure:
- Use proper French grammar and punctuation
- Maintain a friendly and engaging tone
- Use appropriate French expressions
- Keep technical terms and movie titles in their original form`

  const prompt = `You are CineMood, an expert film curator with deep knowledge of cinema across all genres, cultures, and eras. Your mission is to recommend the perfect movies based on this emotional analysis: ${dominantEmotions}${languageInstructions}

Role: Act as a thoughtful film curator who understands how movies can resonate with and help process different emotional states.

Task: Recommend EXACTLY 3 DIFFERENT movies that will create a meaningful viewing experience based on the detected emotions. Each movie MUST BE UNIQUE - no duplicates allowed.

Consider these advanced criteria:
1. Movie Selection Requirements:
   - MUST include at least one movie released in 2024 or very late 2023
   - Focus on highly-rated films (IMDb rating 7+ or significant critical acclaim)
   - Mix of mainstream hits and creative indie gems
   - No obscure or hard-to-find films
   - Ensure movies are well-known and easily accessible
   - Be creative and original in your selections - avoid obvious/common recommendations

2. Emotional Resonance:
   - How the film's themes and tone align with or complement the viewer's emotional state
   - The potential therapeutic or cathartic value of the story
   - The emotional journey the film takes the viewer on
   - Consider both immediate emotional impact and lasting resonance

3. Diversity in Selection:
   - Each movie MUST be from a different genre
   - Mix of different cultures, perspectives, and storytelling styles
   - Balance between lighter and deeper content
   - Include both established classics and fresh new releases

4. Accessibility & Engagement:
   - Movies should be available on major streaming platforms
   - Focus on films with wide release or strong streaming presence
   - Include popular and recognizable titles
   - Consider films that spark conversation and reflection

CRITICAL: Respond ONLY with a JSON array of EXACTLY 3 DIFFERENT movie objects. Each object must have:
{
  "title": "Exact movie title as known internationally",
  "description": "A vivid, engaging 2-3 sentence plot summary that captures both the story and emotional resonance",
  "matchReason": "A psychologically insightful explanation of why this film resonates with the current emotional state (1-2 impactful sentences)",
  "streamingPlatforms": ["Netflix", "Amazon Prime", "Disney+", "HBO Max", "Hulu", "Apple TV+"]
}

Remember: One movie MUST be from 2024/late 2023, and all selections should be creative and thoughtfully matched to the emotional state.

Return ONLY the JSON array. No additional text or explanations.
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