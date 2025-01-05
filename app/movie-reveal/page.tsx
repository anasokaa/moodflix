'use client'

import dynamic from 'next/dynamic'

const MovieRevealClient = dynamic(() => import('./movie-reveal-client'), {
  ssr: false,
})

export default function MovieRevealPage() {
  return <MovieRevealClient />
} 