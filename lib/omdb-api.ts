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
    console.log('Getting movie suggestions for emotions:', emotions)
    
    // Find the dominant emotion
    const dominantEmotion = Object.entries(emotions)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof typeof EMOTION_TO_GENRE
    console.log('Dominant emotion:', dominantEmotion)

    // Get genres for the dominant emotion
    const genres = EMOTION_TO_GENRE[dominantEmotion]
    console.log('Selected genres:', genres)
    
    const moviePromises: Promise<Movie | null>[] = []

    // Always get exactly 3 movies
    const selectedGenres = genres.slice(0, 3) // Take first 3 genres
    if (selectedGenres.length < 3) {
      // If we have fewer than 3 genres, repeat the first genre
      while (selectedGenres.length < 3) {
        selectedGenres.push(selectedGenres[0])
      }
    }
    console.log('Final selected genres:', selectedGenres)

    // Get one movie from each selected genre
    for (const genre of selectedGenres) {
      const movies = SAMPLE_MOVIES[genre as keyof typeof SAMPLE_MOVIES]
      const randomMovie = movies[Math.floor(Math.random() * movies.length)]
      console.log(`Selected "${randomMovie}" from ${genre} genre`)
      const details = await getMovieDetails(randomMovie)
      if (details) {
        moviePromises.push(Promise.resolve({
          ...details,
          description: `A ${genre.toLowerCase()} film that captures the essence of ${dominantEmotion.toLowerCase()}.`,
          matchReason: `This ${genre.toLowerCase()} movie matches your ${dominantEmotion.toLowerCase()} mood.`,
          streamingPlatforms: ['Netflix', 'Amazon Prime', 'Disney+']
        }))
      } else {
        moviePromises.push(Promise.resolve(null))
      }
    }

    const movies = await Promise.all(moviePromises)
    const validMovies = movies.filter((movie): movie is Movie => movie !== null)
    console.log('Valid movies found:', validMovies.length)

    // If we don't have enough movies, try backup movies
    if (validMovies.length < 3) {
      console.log('Not enough movies, trying backup movies')
      const backupGenre = 'Drama'
      const backupMovies = SAMPLE_MOVIES[backupGenre]
      
      while (validMovies.length < 3) {
        const randomMovie = backupMovies[Math.floor(Math.random() * backupMovies.length)]
        console.log(`Trying backup movie: "${randomMovie}"`)
        const details = await getMovieDetails(randomMovie)
        if (details) {
          validMovies.push({
            ...details,
            description: `A ${backupGenre.toLowerCase()} film that resonates with your current mood.`,
            matchReason: `This ${backupGenre.toLowerCase()} movie complements your emotional state.`,
            streamingPlatforms: ['Netflix', 'Amazon Prime', 'Disney+']
          })
        }
      }
    }

    console.log('Final movies:', validMovies)
    return validMovies
  } catch (error) {
    console.error('Error getting movie suggestions:', error)
    return []
  }
}

export async function getMovieDetails(title: string) {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    console.error('OMDB API: API key not configured')
    throw new Error('OMDB API key not configured')
  }

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`OMDB API error: ${response.status}`)
    }

    const data = await response.json()
    if (data.Error) {
      throw new Error(`OMDB API error: ${data.Error}`)
    }

    return {
      posterUrl: data.Poster !== 'N/A' ? data.Poster : '/movie-placeholder.jpg'
    }
  } catch (error) {
    console.error('OMDB API error:', error)
    throw error
  }
} 