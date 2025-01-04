export interface Movie {
  title: string
  year: string
  poster: string
}

interface OMDBResponse {
  Poster: string;
  Response: string;
  Error?: string;
}

export async function getMoviePoster(title: string): Promise<string> {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    console.error('OMDB API key not configured')
    throw new Error('OMDB API key not configured')
  }

  // Extract the movie title without the year
  const movieTitle = title.replace(/\s*\(\d{4}\)$/, '')
  console.log('Fetching poster for movie:', movieTitle)

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      console.error('OMDB API error:', response.statusText)
      throw new Error('Failed to fetch from OMDB API')
    }

    const data: OMDBResponse = await response.json()
    console.log('OMDB API response:', data)

    if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
      console.log('Found poster URL:', data.Poster)
      return data.Poster
    } else {
      console.warn(`No poster found for movie: ${title}`)
      return '/movie-placeholder.jpg'
    }
  } catch (error) {
    console.error(`Error fetching poster for ${title}:`, error)
    return '/movie-placeholder.jpg'
  }
} 