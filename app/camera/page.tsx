'use client'

import dynamic from 'next/dynamic'

const CameraClient = dynamic(() => import('./camera-client.page'), {
  ssr: false,
})

export default function CameraPage() {
  return <CameraClient />
} 