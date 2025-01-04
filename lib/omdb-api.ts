export interface Movie {
  title: string
  description: string
  matchReason: string
  posterUrl: string
  streamingPlatforms: string[]
}

interface OMDBResponse {
  Title: string
  Year: string
  Plot: string
  Poster: string
  Response: string
  Error?: string
}

interface EmotionData {
  anger: number
  disgust: number
  fear: number
  happiness: number
  neutral: number
  sadness: number
  surprise: number
}

const EMOTION_TO_GENRE = {
  happiness: ['Comedy', 'Adventure', 'Animation'],
  sadness: ['Drama', 'Romance'],
  anger: ['Action', 'Thriller'],
  fear: ['Horror', 'Mystery'],
  surprise: ['Sci-Fi', 'Fantasy'],
  disgust: ['Dark Comedy', 'Horror'],
  neutral: ['Documentary', 'Biography']
}

const SAMPLE_MOVIES = {
  Comedy: ['The Hangover', 'Bridesmaids', 'Superbad'],
  Adventure: ['Indiana Jones', 'The Princess Bride', 'Pirates of the Caribbean'],
  Drama: ['The Shawshank Redemption', 'Forrest Gump', 'The Godfather'],
  Romance: ['Notting Hill', 'The Notebook', 'Pride and Prejudice'],
  Action: ['Die Hard', 'Mad Max: Fury Road', 'The Dark Knight'],
  Horror: ['The Shining', 'Get Out', 'A Quiet Place'],
  'Sci-Fi': ['Inception', 'The Matrix', 'Interstellar'],
  Fantasy: ['The Lord of the Rings', 'Harry Potter', 'Pan\'s Labyrinth'],
  Documentary: ['Planet Earth', 'March of the Penguins', 'Free Solo'],
  Biography: ['The Theory of Everything', 'A Beautiful Mind', 'The Imitation Game']
}

export async function getMovieSuggestions(emotions: EmotionData): Promise<Movie[]> {
  try {
    // Find the dominant emotion
    const dominantEmotion = Object.entries(emotions)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof typeof EMOTION_TO_GENRE

    // Get genres for the dominant emotion
    const genres = EMOTION_TO_GENRE[dominantEmotion]
    const moviePromises: Promise<Movie>[] = []

    // Get one movie from each genre
    for (const genre of genres) {
      const movies = SAMPLE_MOVIES[genre as keyof typeof SAMPLE_MOVIES]
      const randomMovie = movies[Math.floor(Math.random() * movies.length)]
      moviePromises.push(getMovieDetails(randomMovie, genre, dominantEmotion))
    }

    const movies = await Promise.all(moviePromises)
    return movies.filter(movie => movie !== null) as Movie[]
  } catch (error) {
    console.error('Error getting movie suggestions:', error)
    return []
  }
}

export async function getMovieDetails(title: string, genre: string, emotion: string): Promise<Movie> {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    throw new Error('OMDB API key not configured')
  }

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch from OMDB API')
    }

    const data: OMDBResponse = await response.json()
    
    if (data.Response === 'True') {
      return {
        title: data.Title,
        description: data.Plot,
        matchReason: `This ${genre.toLowerCase()} movie matches your ${emotion} mood`,
        posterUrl: data.Poster !== 'N/A' ? data.Poster : '/movie-placeholder.jpg',
        streamingPlatforms: ['Netflix', 'Amazon Prime', 'Disney+'] // Placeholder
      }
    } else {
      throw new Error(data.Error || 'Movie not found')
    }
  } catch (error) {
    console.error(`Error fetching details for ${title}:`, error)
    throw error
  }
} 